"use client";

import { motion } from "motion/react";
import { DEMO_PROFILE, DEMO_REPORT, TRAIT_INDICATOR_COUNTS } from "../../../lib/pitch-data";
import { GRADE_COLORS, DIMENSIONS, DIMENSION_COLORS } from "../../../lib/colors";
import { TRAIT_ORDER, TRAIT_LABELS, DIMENSION_MAP } from "../../shared/RadarChart";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ReportCardSlide() {
  const grade = DEMO_REPORT.grade;
  const gradeColor = GRADE_COLORS[grade] ?? "#64748b";
  const overallPct = Math.round(DEMO_REPORT.overallScore * 100);

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background">
      <div className="relative z-10 mx-auto max-w-5xl px-12">
        {/* Indicator counts ribbon */}
        <motion.div
          className="mb-6 flex flex-wrap justify-center gap-2"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {TRAIT_ORDER.map((trait) => {
            const dim = DIMENSION_MAP[trait] ?? "ethos";
            const color = DIMENSION_COLORS[dim];
            const count = TRAIT_INDICATOR_COUNTS[trait] ?? 0;
            const label = TRAIT_LABELS[trait] ?? trait;
            return (
              <motion.div
                key={trait}
                variants={fadeIn}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
                style={{
                  borderColor: `${color}30`,
                  backgroundColor: `${color}10`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-foreground/70">
                  {label}
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color }}
                >
                  {count}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8 text-center font-mono text-sm text-foreground/40"
        >
          214 behavioral indicators scored per message
        </motion.p>

        {/* Report card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="rounded-2xl border border-foreground/10 bg-foreground p-8 text-white shadow-xl"
        >
          <div className="flex items-center gap-8">
            {/* Grade ring */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#334155"
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
                  strokeDasharray={`${overallPct * 2.64} 264`}
                  transform="rotate(-90 50 50)"
                  initial={{ strokeDasharray: "0 264" }}
                  animate={{
                    strokeDasharray: `${overallPct * 2.64} 264`,
                  }}
                  transition={{ duration: 1.2, delay: 1.0, ease: "easeOut" }}
                />
              </svg>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                className="text-4xl font-bold"
                style={{ color: gradeColor }}
              >
                {grade}
              </motion.span>
            </div>

            {/* Identity */}
            <div>
              <h3 className="bg-gradient-to-r from-ethos-300 via-logos-300 to-pathos-300 bg-clip-text text-3xl font-bold text-transparent">
                {DEMO_PROFILE.agentName}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Class of 2025 &middot; 47 evaluations &middot; Improving
              </p>
            </div>
          </div>

          {/* Dimension bars */}
          <div className="mt-8 space-y-3">
            {DIMENSIONS.map((dim, i) => {
              const score =
                DEMO_PROFILE.dimensionAverages[dim.key] ?? 0;
              const pct = Math.round(score * 100);
              return (
                <div key={dim.key} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium text-white/60">
                    {dim.label}
                  </span>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 1.3 + i * 0.15,
                        ease: "easeOut",
                      }}
                      className="absolute inset-y-0 rounded-full"
                      style={{ backgroundColor: dim.color }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-sm text-white/50">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
            className="mt-6 text-sm leading-relaxed text-white/60"
          >
            {DEMO_REPORT.summary}
          </motion.p>

          {/* Homework preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3 }}
            className="mt-4 rounded-lg border border-pathos-400/20 bg-pathos-400/5 px-4 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-pathos-400/70">
              Homework assigned
            </p>
            <p className="mt-1 text-sm text-white/60">
              {DEMO_REPORT.homework.directive}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
