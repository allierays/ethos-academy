"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { getEntranceExam, getAgent } from "../../../../../lib/api";
import type {
  ExamReportCard,
  QuestionDetail,
  ConsistencyPair,
  AgentProfile,
} from "../../../../../lib/types";
import { GRADE_COLORS, SECTION_COLORS, getGrade } from "../../../../../lib/colors";
import AlignmentBadge from "../../../../../components/shared/AlignmentBadge";
import RadarChart from "../../../../../components/shared/RadarChart";
import DimensionBalance from "../../../../../components/shared/DimensionBalance";
import {
  fadeUp,
  staggerContainer,
  staggerContainerFast,
} from "../../../../../lib/motion";

/* ─── Tier display ─── */

const TIER_META: Record<string, { label: string; color: string }> = {
  safety: { label: "Safety", color: "#ef4444" },
  ethics: { label: "Ethics", color: "#8b5cf6" },
  soundness: { label: "Soundness", color: "#2e4a6e" },
  helpfulness: { label: "Helpfulness", color: "#3b8a98" },
};

/* ─── Page ─── */

export default function ExamReportCardPage() {
  const params = useParams();
  const agentId = params.id as string;
  const examId = params.examId as string;

  const [report, setReport] = useState<ExamReportCard | null>(null);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId || !examId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [reportResult, profileResult] = await Promise.allSettled([
          getEntranceExam(agentId, examId),
          getAgent(agentId),
        ]);

        if (cancelled) return;

        if (reportResult.status === "rejected") {
          throw reportResult.reason;
        }
        setReport(reportResult.value);

        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Exam report not found"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [agentId, examId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-action border-t-transparent" />
            <p className="mt-3 text-sm text-muted">
              Loading exam report card...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-sm text-misaligned">
            {error ?? "Exam report not found."}
          </p>
          <Link
            href={`/agent/${encodeURIComponent(agentId)}`}
            className="text-sm text-action hover:text-action-hover transition-colors"
          >
            Back to agent profile
          </Link>
        </div>
      </main>
    );
  }

  const agentName =
    profile?.agentName ?? profile?.agentId ?? agentId;
  const phronesisPct = Math.round(report.phronesisScore * 100);
  const grade = getGrade(report.phronesisScore);
  const gradeColor = GRADE_COLORS[grade] ?? "#64748b";

  // Build traits object for RadarChart from per-question aggregation
  const traitAggregates: Record<string, { sum: number; count: number }> = {};
  for (const q of report.perQuestionDetail) {
    for (const [trait, score] of Object.entries(q.traitScores)) {
      if (!traitAggregates[trait]) {
        traitAggregates[trait] = { sum: 0, count: 0 };
      }
      traitAggregates[trait].sum += score;
      traitAggregates[trait].count += 1;
    }
  }
  const traits = Object.fromEntries(
    Object.entries(traitAggregates).map(([name, { sum, count }]) => [
      name,
      {
        name,
        score: count > 0 ? sum / count : 0,
        dimension: "",
        polarity: "",
        indicators: [],
      },
    ])
  );

  // Group questions by section
  const sections = new Map<string, QuestionDetail[]>();
  for (const q of report.perQuestionDetail) {
    const existing = sections.get(q.section) ?? [];
    existing.push(q);
    sections.set(q.section, existing);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <motion.div
        className="space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Back link */}
        <motion.div variants={fadeUp}>
          <Link
            href={`/agent/${encodeURIComponent(agentId)}`}
            className="inline-flex items-center gap-1.5 text-sm text-action hover:text-action-hover transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to {agentName}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.section
          className="rounded-xl glass-strong p-6"
          variants={fadeUp}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Grade ring */}
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center"
                role="img"
                aria-label={`Grade ${grade}, ${phronesisPct}% phronesis`}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={gradeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${phronesisPct * 2.64} 264`}
                    transform="rotate(-90 50 50)"
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{
                      strokeDasharray: `${phronesisPct * 2.64} 264`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <span
                  className="text-2xl font-bold"
                  style={{ color: gradeColor }}
                >
                  {grade}
                </span>
              </div>

              <div>
                <h1 className="text-xl font-semibold text-[#1a2538]">
                  Entrance Exam Report
                </h1>
                <p className="mt-0.5 text-sm text-foreground/60">
                  {agentName}&apos;s baseline character assessment
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: gradeColor }}>
                  {phronesisPct}%
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  Phronesis
                </p>
              </div>
              <AlignmentBadge status={report.alignmentStatus} />
            </div>
          </div>
        </motion.section>

        {/* Dimension Balance */}
        <motion.section variants={fadeUp}>
          <DimensionBalance
            dimensionAverages={report.dimensions}
            title={`${agentName}'s Exam Baseline`}
          />
        </motion.section>

        {/* Radar Chart */}
        {Object.keys(traits).length > 0 && (
          <motion.section
            className="rounded-xl glass-strong p-6"
            variants={fadeUp}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Trait Radar (Exam Baseline)
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Scores across 12 behavioral traits from the entrance exam.
            </p>
            <div className="mt-2">
              <RadarChart traits={traits} />
            </div>
          </motion.section>
        )}

        {/* Constitutional Tier Scores */}
        {Object.keys(report.tierScores).length > 0 && (
          <motion.section
            className="rounded-xl glass-strong p-6"
            variants={fadeUp}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Constitutional Tier Scores
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Performance across the four constitutional tiers.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(report.tierScores).map(([tier, score]) => {
                const meta = TIER_META[tier] ?? {
                  label: tier,
                  color: "#64748b",
                };
                const pct = Math.round(score * 100);
                return (
                  <div
                    key={tier}
                    className="rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] p-4 text-center"
                  >
                    <p
                      className="text-2xl font-bold"
                      style={{ color: meta.color }}
                    >
                      {pct}%
                    </p>
                    <p className="mt-1 text-xs font-medium text-foreground/60">
                      {meta.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Consistency Analysis */}
        {report.consistencyAnalysis.length > 0 && (
          <motion.section
            className="rounded-xl glass-strong p-6"
            variants={fadeUp}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Consistency Analysis
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Coherence between paired questions that test the same principles
              from different angles.
            </p>
            <div className="mt-4 space-y-3">
              {report.consistencyAnalysis.map((pair) => (
                <ConsistencyPairCard key={pair.pairName} pair={pair} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Per-Question Detail */}
        <motion.section
          className="rounded-xl glass-strong p-6"
          variants={fadeUp}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Per-Question Detail
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Expand each question to see the prompt, response summary, and trait
            scores.
          </p>
          <motion.div
            className="mt-4 space-y-2"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            {Array.from(sections.entries()).map(([section, questions]) => (
              <motion.div key={section} variants={fadeUp}>
                <h3
                  className="mb-2 mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: SECTION_COLORS[section] ?? "#64748b",
                  }}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        SECTION_COLORS[section] ?? "#64748b",
                    }}
                  />
                  {section}
                </h3>
                <div className="space-y-2">
                  {questions.map((q) => (
                    <QuestionCard key={q.questionId} question={q} />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </motion.div>
    </main>
  );
}

/* ─── Sub-components ─── */

function ConsistencyPairCard({ pair }: { pair: ConsistencyPair }) {
  const pct = Math.round(pair.coherenceScore * 100);
  const color =
    pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#ef4444";

  return (
    <div className="flex items-center justify-between rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[#1a2538]">
          {pair.pairName}
        </p>
        <p className="mt-0.5 text-xs text-foreground/50">
          {pair.questionAId} ({pair.frameworkA}) vs {pair.questionBId} (
          {pair.frameworkB})
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold" style={{ color }}>
          {pct}%
        </p>
        <p className="text-[10px] uppercase tracking-wider text-muted">
          Coherence
        </p>
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionDetail }) {
  const [open, setOpen] = useState(false);

  const traitEntries = Object.entries(question.traitScores).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={`question-detail-${question.questionId}`}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <div className="flex items-center gap-2">
          <span className="rounded bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-semibold text-foreground/60">
            {question.questionId}
          </span>
          <span className="text-sm font-medium text-[#1a2538]">
            {question.section}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-foreground/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`question-detail-${question.questionId}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-foreground/[0.06] px-4 py-4">
              {/* Prompt */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                  Prompt
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                  {question.prompt}
                </p>
              </div>

              {/* Response summary */}
              {question.responseSummary && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                    Response Summary
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                    {question.responseSummary}
                  </p>
                </div>
              )}

              {/* Trait scores */}
              {traitEntries.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                    Trait Scores
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {traitEntries.map(([trait, score]) => {
                      const pct = Math.round(score * 100);
                      return (
                        <div key={trait} className="flex items-center gap-3">
                          <span className="w-28 text-xs text-foreground/60 truncate">
                            {trait.replace(/_/g, " ")}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.06]">
                            <div
                              className="h-1.5 rounded-full bg-action"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs font-semibold text-foreground/70">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Detected indicators */}
              {question.detectedIndicators.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                    Detected Indicators
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {question.detectedIndicators.map((indicator) => (
                      <span
                        key={indicator}
                        className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[10px] font-medium text-foreground/60"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
