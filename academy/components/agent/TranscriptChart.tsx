"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { motion } from "motion/react";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "../../lib/colors";
import { fadeUp, whileInView } from "../../lib/motion";
import type { DriftBreakpoint } from "../../lib/types";
import GraphHelpButton from "../shared/GraphHelpButton";
import GlossaryTerm from "../shared/GlossaryTerm";

interface TimelineDataPoint {
  index: number;
  createdAt: string;
  ethos: number;
  logos: number;
  pathos: number;
  flags: string[];
  alignmentStatus: string;
}

interface TranscriptChartProps {
  timeline: TimelineDataPoint[];
  agentName?: string;
  breakpoints?: DriftBreakpoint[];
}

export default function TranscriptChart({ timeline, agentName, breakpoints = [] }: TranscriptChartProps) {
  const name = agentName ?? "this agent";
  const flaggedPoints = timeline.filter((d) => d.flags.length > 0);

  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  const dims = [
    { key: "ethos" as const, label: "Integrity (Ethos)", color: DIMENSION_COLORS.ethos },
    { key: "logos" as const, label: "Logic (Logos)", color: DIMENSION_COLORS.logos },
    { key: "pathos" as const, label: "Empathy (Pathos)", color: DIMENSION_COLORS.pathos },
  ];

  return (
    <motion.section
      className="rounded-xl glass-strong p-6"
      {...whileInView}
      variants={fadeUp}
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold uppercase tracking-wider text-[#1a2538]">
            Evaluation Over Time
          </h2>
          <p className="mt-0.5 text-sm text-foreground/60">
            We are what we repeatedly do. These messages mark the peaks and valleys of character.
          </p>
        </div>
        <GraphHelpButton slug="guide-transcript" />
      </div>

      {timeline.length === 0 ? (
        <div className="mt-8 flex h-48 items-center justify-center text-sm text-muted">
          No evaluation history for {name} yet.
        </div>
      ) : (
        <>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="gradEthos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={DIMENSION_COLORS.ethos} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={DIMENSION_COLORS.ethos} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradLogos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={DIMENSION_COLORS.logos} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={DIMENSION_COLORS.logos} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradPathos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={DIMENSION_COLORS.pathos} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={DIMENSION_COLORS.pathos} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <ReferenceArea y1={0} y2={0.5} fill="#ef4444" fillOpacity={0.03} />
                <XAxis
                  dataKey="index"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  label={{ value: "Evaluation", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }}
                />
                <YAxis
                  domain={[0, 1]}
                  ticks={[0, 0.25, 0.5, 0.75, 1]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  width={32}
                />
                <Tooltip
                  content={({ active, label }) => {
                    if (!active || label == null) return null;
                    const point = timeline.find((d) => d.index === label);
                    if (!point) return null;
                    const prev = timeline.find((d) => d.index === Number(label) - 1);
                    const delta = (key: "ethos" | "logos" | "pathos") => {
                      if (!prev) return "";
                      const d = Math.round((point[key] - prev[key]) * 100);
                      if (d === 0) return "";
                      return d > 0 ? ` (+${d}%)` : ` (${d}%)`;
                    };
                    return (
                      <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-xs shadow-lg backdrop-blur-md">
                        <p className="font-semibold text-[#1a2538]">Evaluation #{label}</p>
                        <div className="mt-2 space-y-1">
                          {dims.map((dim) => {
                            const pct = Math.round(point[dim.key] * 100);
                            return (
                              <div key={dim.key} className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dim.color }} />
                                <span className="text-foreground/70">{dim.label}</span>
                                <span className="ml-auto font-semibold text-[#1a2538]">{pct}%</span>
                                <span className={`text-[10px] ${delta(dim.key).includes("+") ? "text-aligned" : delta(dim.key).includes("-") ? "text-misaligned" : "text-muted"}`}>
                                  {delta(dim.key)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2 border-t border-border/30 pt-2">
                          <p className="text-[10px] leading-relaxed text-foreground/60">
                            {(() => {
                              const parts: string[] = [];
                              const eDelta = prev ? Math.round((point.ethos - prev.ethos) * 100) : 0;
                              const lDelta = prev ? Math.round((point.logos - prev.logos) * 100) : 0;
                              const pDelta = prev ? Math.round((point.pathos - prev.pathos) * 100) : 0;
                              const bigDrop = [
                                eDelta < -5 && "character",
                                lDelta < -5 && "reasoning",
                                pDelta < -5 && "empathy",
                              ].filter(Boolean);
                              const bigGain = [
                                eDelta > 5 && "character",
                                lDelta > 5 && "reasoning",
                                pDelta > 5 && "empathy",
                              ].filter(Boolean);
                              if (bigDrop.length > 0) parts.push(`${bigDrop.join(" and ")} dropped`);
                              if (bigGain.length > 0) parts.push(`${bigGain.join(" and ")} improved`);
                              if (parts.length === 0 && prev) parts.push("Scores held steady");
                              if (!prev) parts.push("First evaluation");
                              const low = Math.min(point.ethos, point.logos, point.pathos);
                              if (low < 0.5) parts.push("empathy needs attention");
                              return parts.join(". ") + ".";
                            })()}
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ethos"
                  stroke={DIMENSION_COLORS.ethos}
                  strokeWidth={2.5}
                  fill="url(#gradEthos)"
                  dot={{ r: 4, fill: DIMENSION_COLORS.ethos, stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: DIMENSION_COLORS.ethos, strokeWidth: 2, fill: "#fff" }}
                  name="Integrity (Ethos)"
                />
                <Area
                  type="monotone"
                  dataKey="logos"
                  stroke={DIMENSION_COLORS.logos}
                  strokeWidth={2.5}
                  fill="url(#gradLogos)"
                  dot={{ r: 4, fill: DIMENSION_COLORS.logos, stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: DIMENSION_COLORS.logos, strokeWidth: 2, fill: "#fff" }}
                  name="Logic (Logos)"
                />
                <Area
                  type="monotone"
                  dataKey="pathos"
                  stroke={DIMENSION_COLORS.pathos}
                  strokeWidth={2.5}
                  fill="url(#gradPathos)"
                  dot={{ r: 4, fill: DIMENSION_COLORS.pathos, stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: DIMENSION_COLORS.pathos, strokeWidth: 2, fill: "#fff" }}
                  name="Empathy (Pathos)"
                />
                {flaggedPoints.map((point) => (
                  <ReferenceDot
                    key={`flag-${point.index}`}
                    x={point.index}
                    y={Math.min(point.ethos, point.logos, point.pathos)}
                    r={5}
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
                {breakpoints.map((bp) => (
                  <ReferenceLine
                    key={`drift-${bp.evalIndex}-${bp.dimension}`}
                    x={bp.evalIndex}
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    strokeOpacity={0.7}
                    label={{
                      value: `${bp.delta > 0 ? "+" : ""}${(bp.delta * 100).toFixed(0)}% ${(DIMENSION_LABELS[bp.dimension] ?? bp.dimension).toLowerCase()}`,
                      position: "top",
                      fill: "#dc2626",
                      fontSize: 9,
                      fontWeight: 600,
                    }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Dimension summary stats */}
          {first && last && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {dims.map((dim) => {
                const latest = last[dim.key];
                const delta = timeline.length > 1 ? last[dim.key] - first[dim.key] : 0;
                const pct = Math.round(latest * 100);
                const deltaPct = Math.round(delta * 100);
                return (
                  <div
                    key={dim.key}
                    className="rounded-lg glass p-3 text-center"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      {dim.label}
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#1a2538]">
                      {pct}%
                    </p>
                    {timeline.length > 1 && (
                      <p
                        className={`text-xs font-medium ${
                          delta > 0.01
                            ? "text-aligned"
                            : delta < -0.01
                            ? "text-misaligned"
                            : "text-muted"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}
                        {deltaPct}%
                      </p>
                    )}
                    <div
                      className="mx-auto mt-1.5 h-1 w-full max-w-[60px] rounded-full"
                      style={{ backgroundColor: `${dim.color}20` }}
                    >
                      <div
                        className="h-1 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: dim.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-ethos-500" /> Integrity (Ethos)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-logos-500" /> Logic (Logos)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-pathos-500" /> Empathy (Pathos)
        </span>
        {flaggedPoints.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-misaligned" />{" "}
            Flagged
          </span>
        )}
        {breakpoints.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 border-l-2 border-dashed border-[#dc2626]" />{" "}
            Drift breakpoint
          </span>
        )}
      </div>

      {/* Drift breakpoint details */}
      {breakpoints.length > 0 && (
        <div className="mt-3 rounded-lg bg-misaligned/5 border border-misaligned/10 px-4 py-3">
          <p className="text-xs font-semibold text-misaligned/80 uppercase tracking-wider mb-2">
            Character Drift Detected
          </p>
          <div className="space-y-1.5">
            {breakpoints.map((bp, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-misaligned">#{bp.evalIndex}</span>
                <span className="text-foreground/70">
                  {(DIMENSION_LABELS[bp.dimension] ?? bp.dimension)} {bp.delta < 0 ? "dropped" : "rose"}{" "}
                  <span className="font-semibold">{Math.abs(Math.round(bp.delta * 100))}%</span>
                  {" "}({(bp.beforeAvg * 100).toFixed(0)}% &rarr; {(bp.afterAvg * 100).toFixed(0)}%)
                </span>
                {bp.indicators.length > 0 && (
                  <span className="text-muted ml-auto truncate max-w-[200px]">
                    {bp.indicators.slice(0, 3).join(", ")}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-foreground/40">
            Breakpoints use a 5-evaluation sliding window. Only the PRECEDES linked list in Neo4j
            guarantees temporal chain integrity at scale.
          </p>
        </div>
      )}
    </motion.section>
  );
}
