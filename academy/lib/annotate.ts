/**
 * Pure text-matching utility for annotating message content with indicator evidence.
 * No React dependency -- just string processing.
 */

import { TRAIT_DIMENSIONS } from "./colors";

/* ─── Types ─── */

export interface PlainSegment {
  type: "plain";
  text: string;
}

export interface AnnotatedSegment {
  type: "annotated";
  text: string;
  indicator: IndicatorLike;
  dimension: string;
}

export type Segment = PlainSegment | AnnotatedSegment;

/** Union type to handle both RecordItem and HighlightItem indicators. */
export interface IndicatorLike {
  id?: string;
  name: string;
  trait: string;
  confidence: number;
  severity?: number;
  description?: string;
  evidence: string;
}

/* ─── Normalization ─── */

/**
 * Normalize text for case-insensitive matching.
 * Applies the same transforms as cleanMarkdown in HighlightsPanel:
 * strip markdown syntax, straighten quotes, collapse whitespace.
 */
function normalizeForMatch(text: string): string {
  return (
    text
      // Strip bold / italic markers
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      // Strip fenced code blocks (complete and unterminated)
      .replace(/```[^`]*```/g, "")
      .replace(/```[^`]*$/g, "")
      // Strip inline code
      .replace(/`([^`]+)`/g, "$1")
      // Strip markdown headings
      .replace(/#{1,6}\s/g, "")
      // Strip markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Strip HTML tags
      .replace(/<[^>]+>/g, "")
      // Strip unterminated bold
      .replace(/\*\*[^*]*$/g, "")
      // Straighten curly quotes
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      // Collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Strip wrapping quotes and trailing punctuation from evidence for a retry match.
 */
function stripWrapping(text: string): string {
  let s = text.trim();
  // Remove surrounding quotes (single or double)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  // Remove trailing punctuation that the LLM might have added
  s = s.replace(/[.,;:!?]+$/, "").trim();
  return s;
}

/* ─── Matching ─── */

interface Match {
  start: number;
  end: number;
  indicator: IndicatorLike;
}

/** Minimum consecutive words for n-gram fallback to accept a match. */
const MIN_NGRAM_WORDS = 4;

/** Minimum keyword overlap ratio for sentence fallback (0-1). */
const MIN_KEYWORD_OVERLAP = 0.25;

/** Minimum number of keyword hits for sentence fallback. */
const MIN_KEYWORD_HITS = 2;

/** Common English stop words to exclude from keyword matching. */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "this", "that",
  "these", "those", "it", "its", "i", "you", "he", "she", "we", "they",
  "me", "him", "her", "us", "them", "my", "your", "his", "our", "their",
  "what", "which", "who", "whom", "how", "when", "where", "why", "if",
  "then", "so", "no", "not", "as", "about", "up", "out", "into", "than",
  "very", "just", "also", "more", "some", "any", "all", "each", "every",
  "both", "few", "most", "other", "such", "only", "same", "own", "here",
  "there", "too", "much", "many", "well", "back", "even", "still",
]);

/**
 * Try to find the indicator's evidence as a substring of the normalized message.
 * Returns the index in normalizedMessageLower or -1.
 */
function findExactEvidence(
  normalizedMessageLower: string,
  evidence: string,
): { idx: number; normalizedEvidence: string } {
  let normalizedEvidence = normalizeForMatch(evidence);
  let idx = normalizedMessageLower.indexOf(normalizedEvidence.toLowerCase());

  // Retry with stripped wrapping quotes/punctuation
  if (idx === -1) {
    const stripped = stripWrapping(normalizedEvidence);
    if (stripped !== normalizedEvidence && stripped.length > 0) {
      normalizedEvidence = stripped;
      idx = normalizedMessageLower.indexOf(normalizedEvidence.toLowerCase());
    }
  }

  return { idx, normalizedEvidence };
}

/**
 * N-gram fallback: when the full evidence doesn't appear verbatim, extract
 * sliding windows of consecutive words and find the longest window that
 * does appear in the message. Returns the best match or null.
 */
function findNgramMatch(
  normalizedMessageLower: string,
  evidence: string,
): { idx: number; fragment: string } | null {
  const normalizedEvidence = normalizeForMatch(evidence);
  // Strip trailing punctuation from each word so "yours," matches "yours"
  const words = normalizedEvidence
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.,;:!?"')\]]+$/, "").replace(/^[("'\[]+/, ""));
  if (words.length < MIN_NGRAM_WORDS) return null;

  // Try window sizes from largest to smallest (at least MIN_NGRAM_WORDS)
  for (let size = words.length - 1; size >= MIN_NGRAM_WORDS; size--) {
    for (let start = 0; start + size <= words.length; start++) {
      const fragment = words.slice(start, start + size).join(" ");
      const idx = normalizedMessageLower.indexOf(fragment.toLowerCase());
      if (idx !== -1) {
        return { idx, fragment };
      }
    }
  }
  return null;
}

/**
 * Extract significant (non-stop) words from text, lowercased.
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Split text into sentences. Handles ". " boundary plus newlines.
 */
function splitSentences(text: string): { text: string; start: number; end: number }[] {
  const results: { text: string; start: number; end: number }[] = [];
  // Split on sentence boundaries: period/exclamation/question followed by space + uppercase,
  // or double newlines
  const pattern = /[^.!?\n]+(?:[.!?]+|$)/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const sentence = m[0].trim();
    if (sentence.length > 0) {
      results.push({
        text: sentence,
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }
  // If regex produced nothing (no punctuation at all), treat whole text as one sentence
  if (results.length === 0 && text.trim().length > 0) {
    results.push({ text: text.trim(), start: 0, end: text.length });
  }
  return results;
}

/**
 * Keyword-based sentence fallback: find the message sentence with the highest
 * keyword overlap with the evidence. Returns the sentence boundaries or null.
 */
function findKeywordSentenceMatch(
  messageContent: string,
  evidence: string,
): { start: number; end: number } | null {
  const evidenceKeywords = extractKeywords(normalizeForMatch(evidence));
  if (evidenceKeywords.length < MIN_KEYWORD_HITS) return null;

  const evidenceSet = new Set(evidenceKeywords);
  const sentences = splitSentences(messageContent);
  if (sentences.length === 0) return null;

  let bestScore = 0;
  let bestSentence: { start: number; end: number } | null = null;

  for (const sentence of sentences) {
    const sentenceKeywords = extractKeywords(sentence.text);
    if (sentenceKeywords.length === 0) continue;

    const hits = sentenceKeywords.filter((w) => evidenceSet.has(w)).length;
    const score = hits / evidenceSet.size;

    if (hits >= MIN_KEYWORD_HITS && score >= MIN_KEYWORD_OVERLAP && score > bestScore) {
      bestScore = score;
      bestSentence = { start: sentence.start, end: sentence.end };
    }
  }

  return bestSentence;
}

/**
 * Map a normalized-space match back to original message positions.
 * Returns null if the mapping fails.
 */
function toOriginalRange(
  messageContent: string,
  normalizedMessage: string,
  idx: number,
  matchLength: number,
): { start: number; end: number } | null {
  const origStart = mapNormalizedToOriginal(messageContent, normalizedMessage, idx);
  const origEnd = mapNormalizedToOriginal(
    messageContent,
    normalizedMessage,
    idx + matchLength - 1,
  );
  if (origStart === -1 || origEnd === -1) return null;
  return { start: origStart, end: origEnd + 1 };
}

/**
 * Build an array of Segments from message content and its detected indicators.
 *
 * Algorithm:
 * 1. Normalize both message and evidence, then case-insensitive indexOf to find evidence in message.
 * 2. If full evidence doesn't match, try n-gram fallback (longest consecutive-word window).
 * 3. Map matched positions back to original message string.
 * 4. Sort by start ascending, length descending (longer wins).
 * 5. Resolve overlaps: skip any match that overlaps a previously accepted one.
 * 6. Emit PlainSegment for gaps and AnnotatedSegment for matches.
 */
export function buildAnnotatedSegments(
  messageContent: string,
  indicators: IndicatorLike[],
): Segment[] {
  if (!messageContent || !indicators?.length) {
    return messageContent ? [{ type: "plain", text: messageContent }] : [];
  }

  const normalizedMessage = normalizeForMatch(messageContent);
  const normalizedMessageLower = normalizedMessage.toLowerCase();

  const matches: Match[] = [];

  for (const indicator of indicators) {
    if (!indicator.evidence?.trim()) continue;

    // Pass 1: exact evidence match
    const exact = findExactEvidence(normalizedMessageLower, indicator.evidence);

    if (exact.idx !== -1) {
      const range = toOriginalRange(
        messageContent,
        normalizedMessage,
        exact.idx,
        exact.normalizedEvidence.length,
      );
      if (range) {
        matches.push({ ...range, indicator });
        continue;
      }
    }

    // Pass 2: n-gram fallback (longest consecutive-word window from evidence)
    const ngram = findNgramMatch(normalizedMessageLower, indicator.evidence);
    if (ngram) {
      const range = toOriginalRange(
        messageContent,
        normalizedMessage,
        ngram.idx,
        ngram.fragment.length,
      );
      if (range) {
        matches.push({ ...range, indicator });
        continue;
      }
    }

    // Pass 3: keyword sentence fallback (find sentence with most keyword overlap)
    const sentenceMatch = findKeywordSentenceMatch(messageContent, indicator.evidence);
    if (sentenceMatch) {
      matches.push({ ...sentenceMatch, indicator });
    }
  }

  // Sort: start ascending, then length descending (longer match wins)
  matches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  // Resolve overlaps: greedy, first (longest at same start) wins
  const accepted: Match[] = [];
  for (const m of matches) {
    const overlaps = accepted.some((a) => m.start < a.end && m.end > a.start);
    if (!overlaps) accepted.push(m);
  }

  // Build segments
  const segments: Segment[] = [];
  let cursor = 0;

  for (const m of accepted) {
    if (m.start > cursor) {
      segments.push({ type: "plain", text: messageContent.slice(cursor, m.start) });
    }
    const dimension = TRAIT_DIMENSIONS[m.indicator.trait] ?? "ethos";
    segments.push({
      type: "annotated",
      text: messageContent.slice(m.start, m.end),
      indicator: m.indicator,
      dimension,
    });
    cursor = m.end;
  }

  if (cursor < messageContent.length) {
    segments.push({ type: "plain", text: messageContent.slice(cursor) });
  }

  return segments;
}

/* ─── Position Mapping ─── */

/**
 * Normalize a single character the same way normalizeForMatch does for
 * replacements (curly quotes -> straight, any whitespace -> space).
 * Returns "" for characters that normalizeForMatch would strip entirely
 * (replacement char U+FFFD).
 */
function normalizeChar(c: string): string {
  if (/[\u2018\u2019\u201A\u201B]/.test(c)) return "'";
  if (/[\u201C\u201D\u201E\u201F]/.test(c)) return '"';
  if (/\s/.test(c)) return " ";
  if (c === "\uFFFD") return "";
  return c;
}

/**
 * Two-pointer walk that maps normalized string positions back to original
 * string positions. Before comparing, each original character is run through
 * normalizeChar so that replacements (curly quotes, whitespace variants)
 * align correctly. Characters that were stripped by multi-character regex
 * transforms (markdown syntax, HTML tags, emojis) are naturally skipped
 * because they won't match the next normalized character.
 */
function mapNormalizedToOriginal(
  original: string,
  normalized: string,
  normalizedIdx: number,
): number {
  if (normalizedIdx < 0 || normalizedIdx >= normalized.length) return -1;

  const normToOrig: number[] = new Array(normalized.length).fill(-1);

  let ni = 0;
  let oi = 0;
  while (ni < normalized.length && oi < original.length) {
    const nc = normalizeChar(original[oi]);
    if (nc === "") {
      // Character stripped entirely (e.g. U+FFFD), skip
      oi++;
      continue;
    }
    if (nc === normalized[ni]) {
      normToOrig[ni] = oi;
      ni++;
      oi++;
    } else {
      // Original char was stripped during normalization (markdown syntax, etc.)
      oi++;
    }
  }

  return normToOrig[normalizedIdx];
}
