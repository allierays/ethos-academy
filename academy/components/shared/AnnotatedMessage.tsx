"use client";

import React, { useMemo, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { buildAnnotatedSegments } from "../../lib/annotate";
import type { IndicatorLike } from "../../lib/annotate";
import type { IntentClassification } from "../../lib/types";
import { DIMENSION_COLORS } from "../../lib/colors";
import IndicatorSidebar from "./IndicatorSidebar";

/* ─── Props ─── */

interface AnnotatedMessageProps {
  content: string;
  indicators: IndicatorLike[];
  scoringReasoning?: string;
  intentClassification?: IntentClassification | null;
}

/* ─── Inline markdown renderer ─── */

/**
 * Parse inline markdown (**bold**, *italic*, `code`) and return React nodes.
 * Handles nested bold+italic and preserves plain text between matches.
 */
function renderInlineMarkdown(text: string, keyPrefix = ""): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match: **bold**, *italic*, `code`, [link text](url)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\([^)]+\))/g;
  let lastIndex = 0;
  let key = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      nodes.push(
        <strong key={`${keyPrefix}b${key++}`} className="font-semibold text-foreground">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italic*
      nodes.push(
        <em key={`${keyPrefix}i${key++}`}>{match[3]}</em>,
      );
    } else if (match[4]) {
      // `code`
      nodes.push(
        <code
          key={`${keyPrefix}c${key++}`}
          className="text-xs bg-foreground/[0.06] rounded px-1 py-0.5 font-mono text-foreground/90"
        >
          {match[4]}
        </code>,
      );
    } else if (match[5]) {
      // [link text](url) - render just the text
      nodes.push(
        <span key={`${keyPrefix}l${key++}`} className="underline decoration-foreground/20">
          {match[5]}
        </span>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

/**
 * Render a segment's text with markdown formatting.
 * Handles block-level patterns (headings, list items) per line,
 * then applies inline markdown within each line.
 */
function renderSegmentMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];

    // Add line break between lines (not before first)
    if (li > 0) {
      nodes.push(<br key={`${keyPrefix}br${li}`} />);
    }

    // Empty line: just a spacer
    if (line.trim() === "" || line.trim() === "---") {
      nodes.push(<span key={`${keyPrefix}sp${li}`} className="block h-2" />);
      continue;
    }

    // Blockquote: > text
    const quoteMatch = line.match(/^>\s*(.*)$/);
    if (quoteMatch) {
      nodes.push(
        <span
          key={`${keyPrefix}q${li}`}
          className="block border-l-2 border-foreground/15 pl-3 text-foreground/60 italic my-0.5"
        >
          {renderInlineMarkdown(quoteMatch[1], `${keyPrefix}q${li}-`)}
        </span>,
      );
      continue;
    }

    // Heading: ## text
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const cls = level <= 2
        ? "font-bold text-foreground text-base"
        : "font-semibold text-foreground text-sm";
      nodes.push(
        <span key={`${keyPrefix}h${li}`} className={`block mt-3 mb-1 ${cls}`}>
          {renderInlineMarkdown(headingMatch[2], `${keyPrefix}h${li}-`)}
        </span>,
      );
      continue;
    }

    // Numbered list: 1. text
    const numListMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numListMatch) {
      const indent = numListMatch[1];
      const num = numListMatch[2];
      nodes.push(
        <span key={`${keyPrefix}nl${li}`} className="flex gap-2 my-0.5" style={{ paddingLeft: indent ? "1.25rem" : "0.5rem" }}>
          <span className="text-foreground/40 shrink-0 tabular-nums select-none">{num}.</span>
          <span>{renderInlineMarkdown(numListMatch[3], `${keyPrefix}nl${li}-`)}</span>
        </span>,
      );
      continue;
    }

    // Bullet list: - text or * text (only at line start)
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bulletMatch) {
      nodes.push(
        <span key={`${keyPrefix}bl${li}`} className="flex gap-2 my-0.5" style={{ paddingLeft: bulletMatch[1] ? "1.25rem" : "0.5rem" }}>
          <span className="text-foreground/30 shrink-0 select-none">&#8226;</span>
          <span>{renderInlineMarkdown(bulletMatch[2], `${keyPrefix}bl${li}-`)}</span>
        </span>,
      );
      continue;
    }

    // Regular line: just inline markdown
    nodes.push(
      <React.Fragment key={`${keyPrefix}p${li}`}>
        {renderInlineMarkdown(line, `${keyPrefix}p${li}-`)}
      </React.Fragment>,
    );
  }

  return nodes;
}

/* ─── Component ─── */

export default function AnnotatedMessage({
  content,
  indicators,
  scoringReasoning,
  intentClassification,
}: AnnotatedMessageProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorLike | null>(null);

  const segments = useMemo(
    () => buildAnnotatedSegments(content, indicators),
    [content, indicators],
  );

  const handleClick = useCallback(
    (indicator: IndicatorLike) => {
      setSelectedIndicator((prev) =>
        prev === indicator ? null : indicator,
      );
    },
    [],
  );

  const handleClose = useCallback(() => {
    setSelectedIndicator(null);
  }, []);

  return (
    <>
      <div className="text-sm text-foreground/80 leading-[1.75] bg-white/70 rounded-lg p-4">
        {segments.map((seg, i) => {
          if (seg.type === "plain") {
            return (
              <span key={i}>
                {renderSegmentMarkdown(seg.text, `s${i}-`)}
              </span>
            );
          }

          const dimColor = DIMENSION_COLORS[seg.dimension] ?? DIMENSION_COLORS.ethos;
          const isActive = selectedIndicator === seg.indicator;

          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(seg.indicator)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(seg.indicator);
                }
              }}
              className={`cursor-pointer border-b-2 transition-colors duration-150 ${
                isActive ? "rounded-sm" : ""
              }`}
              style={{
                borderBottomColor: dimColor,
                backgroundColor: isActive
                  ? `${dimColor}18`
                  : undefined,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${dimColor}14`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                }
              }}
              title={`${seg.indicator.name?.replace(/_/g, " ")} (click for details)`}
            >
              {renderSegmentMarkdown(seg.text, `a${i}-`)}
            </span>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedIndicator && (
          <IndicatorSidebar
            key={selectedIndicator.name}
            indicator={selectedIndicator}
            scoringReasoning={scoringReasoning}
            intentClassification={intentClassification}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
