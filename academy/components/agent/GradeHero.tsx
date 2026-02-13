"use client";

import { motion } from "motion/react";
import type { AgentProfile, DailyReportCard } from "../../lib/types";
import { GRADE_COLORS, RISK_STYLES, TREND_DISPLAY, DIMENSION_COLORS } from "../../lib/colors";
import { getAcademicLabel, formatClassOf } from "../../lib/academic";
import { fadeUp, staggerContainer } from "../../lib/motion";
import GlossaryTerm from "../shared/GlossaryTerm";

interface TimelinePoint {
  ethos: number;
  logos: number;
  pathos: number;
}

const DIM_LABELS: Record<string, string> = {
  ethos: "ethical foundations",
  logos: "logical rigor",
  pathos: "emotional awareness",
};

interface GradeHeroProps {
  profile: AgentProfile;
  report: DailyReportCard | null;
  timeline?: TimelinePoint[];
}

export default function GradeHero({ profile, report, timeline = [] }: GradeHeroProps) {
  const latestAlignment =
    profile.alignmentHistory?.[profile.alignmentHistory.length - 1] ?? "unknown";
  const academicLabel = getAcademicLabel(latestAlignment);
  const classOf = formatClassOf(profile.createdAt);

  const dims = profile.dimensionAverages;
  const phronesisScore = Math.round(
    (((dims.ethos ?? 0) + (dims.logos ?? 0) + (dims.pathos ?? 0)) / 3) * 100
  );

  const grade = report?.grade ?? null;
  const gradeColor = grade ? GRADE_COLORS[grade] ?? "#64748b" : "#64748b";
  const overallPct = report ? Math.round(report.overallScore * 100) : null;
  const trend = report?.trend
    ? TREND_DISPLAY[report.trend] ?? TREND_DISPLAY.insufficient_data
    : TREND_DISPLAY[profile.phronesisTrend] ?? TREND_DISPLAY.insufficient_data;
  const riskLevel = report?.riskLevel ?? "low";
  const riskStyle = RISK_STYLES[riskLevel] ?? RISK_STYLES.low;

  return (
    <section className="rounded-2xl bg-[#1a2538] px-6 py-8 text-white sm:px-10 sm:py-10">
      <motion.div
        className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Left: Grade ring + identity */}
        <motion.div className="flex items-start gap-6" variants={fadeUp}>
          {/* Grade ring */}
          {grade ? (
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={gradeColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallPct ?? 0) * 2.64} 264`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="text-3xl font-bold" style={{ color: gradeColor }}>
                {grade}
              </span>
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-slate-600">
              <span className="text-sm text-slate-400">N/A</span>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {profile.agentName || profile.agentId}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                  latestAlignment === "aligned"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : latestAlignment === "drifting"
                    ? "bg-amber-500/20 text-amber-400"
                    : latestAlignment === "misaligned"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                <GlossaryTerm slug="alignment-status">{latestAlignment}</GlossaryTerm>
              </span>
              {academicLabel && (
                <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300">
                  {academicLabel}
                </span>
              )}
            </div>
            {classOf && (
              <p className="mt-1 text-xs text-slate-400">{classOf}</p>
            )}
            {overallPct !== null && (
              <p className="mt-1 text-sm text-slate-300">
                Overall score: {overallPct}%
              </p>
            )}
          </div>
        </motion.div>

        {/* Right: stat cards */}
        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          variants={fadeUp}
        >
          <StatCard label={<GlossaryTerm slug="phronesis">Phronesis</GlossaryTerm>} value={`${phronesisScore}%`} />
          <StatCard
            label="Trend"
            value={trend.arrow}
            sublabel={trend.label}
            valueClass={
              trend.color === "text-aligned"
                ? "text-emerald-400"
                : trend.color === "text-misaligned"
                ? "text-red-400"
                : "text-slate-400"
            }
          />
          <StatCard
            label="Evaluations"
            value={String(report?.totalEvaluationCount ?? profile.evaluationCount)}
          />
          <StatCard
            label="Risk"
            value={riskLevel}
            valueClass={`capitalize text-xs font-semibold rounded-full px-2 py-0.5 ${riskStyle}`}
            isRiskBadge
          />
        </motion.div>
      </motion.div>

      {/* Summary */}
      {report?.summary && (
        <motion.p
          className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-300"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {report.summary}
        </motion.p>
      )}

      {/* Phronesis narrative + dimension deltas */}
      <PhronesisNarrative profile={profile} report={report} timeline={timeline} />
    </section>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  valueClass,
  isRiskBadge,
}: {
  label: React.ReactNode;
  value: string;
  sublabel?: string;
  valueClass?: string;
  isRiskBadge?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
      {isRiskBadge ? (
        <span className={valueClass}>{value}</span>
      ) : (
        <p className={`text-xl font-bold ${valueClass ?? "text-white"}`}>
          {value}
        </p>
      )}
      {sublabel && <p className="text-[10px] text-slate-300">{sublabel}</p>}
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function PhronesisNarrative({
  profile,
  report,
  timeline,
}: {
  profile: AgentProfile;
  report: DailyReportCard | null;
  timeline: TimelinePoint[];
}) {
  const dims = profile.dimensionAverages;
  const sorted = Object.entries(dims).sort(([, a], [, b]) => b - a);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const evalCount = report?.totalEvaluationCount ?? profile.evaluationCount;
  const agentName = profile.agentName || profile.agentId;
  const drift = report?.characterDrift ?? 0;

  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  const deltas =
    first && last && timeline.length > 1
      ? {
          ethos: Math.round((last.ethos - first.ethos) * 100),
          logos: Math.round((last.logos - first.logos) * 100),
          pathos: Math.round((last.pathos - first.pathos) * 100),
        }
      : null;

  if (!strongest || !weakest) return null;

  const narrative = buildNarrative(
    agentName,
    strongest,
    weakest,
    deltas,
    evalCount,
    drift
  );

  return (
    <motion.div
      className="mt-5 border-t border-white/10 pt-5"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
        {narrative}
      </p>

      {deltas && (
        <div className="mt-4 flex flex-wrap gap-3">
          {(["ethos", "logos", "pathos"] as const).map((dim) => {
            const d = deltas[dim];
            return (
              <div
                key={dim}
                className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: DIMENSION_COLORS[dim] }}
                />
                <span className="text-xs font-medium capitalize text-slate-400">
                  {dim}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    d > 0
                      ? "text-emerald-400"
                      : d < 0
                        ? "text-red-400"
                        : "text-slate-400"
                  }`}
                >
                  {d > 0 ? "+" : ""}
                  {d}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function buildNarrative(
  name: string,
  strongest: [string, number],
  weakest: [string, number],
  deltas: Record<string, number> | null,
  evalCount: number,
  drift: number
): string {
  const parts: string[] = [];
  const strongLabel = DIM_LABELS[strongest[0]] ?? strongest[0];
  const weakLabel = DIM_LABELS[weakest[0]] ?? weakest[0];

  parts.push(
    `${name} enrolled as a ${strongest[0]}-dominant agent with strong ${strongLabel}.`
  );

  if (deltas && evalCount > 1) {
    const sorted = Object.entries(deltas).sort(([, a], [, b]) => b - a);
    const biggest = sorted[0];
    if (biggest[1] > 0) {
      const label = DIM_LABELS[biggest[0]] ?? biggest[0];
      parts.push(
        `Over ${evalCount} evaluations, ${label} showed the strongest growth (+${biggest[1]}%).`
      );
    }
  }

  if (strongest[0] !== weakest[0]) {
    const cap = weakLabel.charAt(0).toUpperCase() + weakLabel.slice(1);
    parts.push(`${cap} remains the primary growth edge.`);
  }

  if (drift > 0.02) {
    parts.push(
      "The trajectory suggests practical wisdom is forming through repeated evaluation and correction."
    );
  } else if (drift < -0.02) {
    parts.push(
      "Recent evaluations show a decline that warrants attention before negative habits solidify."
    );
  } else if (evalCount >= 2) {
    parts.push(
      "Character foundations are stabilizing. Consistency will determine whether virtues become lasting habits."
    );
  } else {
    parts.push(
      "More evaluations will reveal whether these initial patterns mature into stable character traits."
    );
  }

  return parts.join(" ");
}
