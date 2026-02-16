"use client";

import { motion } from "motion/react";
import { DIMENSION_COLORS } from "../../../lib/colors";

const PIPELINE = [
  { label: "Message", sub: "Agent output arrives", color: "#94a3b8" },
  {
    label: "Scan",
    sub: "214 indicators matched",
    color: DIMENSION_COLORS.ethos,
  },
  {
    label: "Route",
    sub: "Sonnet or Opus 4.6",
    color: DIMENSION_COLORS.logos,
  },
  {
    label: "Analyze",
    sub: "Extended thinking",
    color: DIMENSION_COLORS.logos,
  },
  {
    label: "Score",
    sub: "12 traits \u2192 phronesis",
    color: DIMENSION_COLORS.pathos,
  },
  {
    label: "Store",
    sub: "Neo4j graph",
    color: DIMENSION_COLORS.pathos,
  },
];

const CARDS = [
  {
    title: "Intent Router",
    desc: "Keyword scanner detects risk signals in milliseconds. Low-risk messages route to Sonnet. Flagged messages escalate to Opus 4.6 for deep analysis.",
    color: DIMENSION_COLORS.ethos,
  },
  {
    title: "Extended Thinking",
    desc: "Opus 4.6 reasons through each flagged message before scoring. Adaptive depth based on complexity, not a fixed token budget.",
    color: DIMENSION_COLORS.logos,
  },
  {
    title: "Neo4j Graph",
    desc: "Every evaluation stored as connected data. Agents, traits, indicators, and scores form a living graph of character over time.",
    color: DIMENSION_COLORS.logos,
  },
  {
    title: "Prompt Caching",
    desc: "The constitutional rubric (214 indicators) cached across evaluations. Only the message changes. 90% cost reduction.",
    color: DIMENSION_COLORS.pathos,
  },
];

function Arrow() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-[#1a2538]/20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function OpusScene() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#e2dbd1]">
      <div className="relative z-10 mx-auto max-w-6xl px-8 lg:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-3xl font-bold tracking-tight text-[#1a2538] lg:text-5xl"
        >
          How it works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-3 text-center text-base text-[#1a2538]/60 lg:text-lg"
        >
          Powered by Claude Opus 4.6 and Neo4j.
        </motion.p>

        {/* Pipeline visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          {PIPELINE.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <div className="flex flex-col items-center gap-1 rounded-xl border border-[#1a2538]/[0.08] bg-white/70 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
                <span className="text-[11px] font-bold text-[#1a2538]">
                  {step.label}
                </span>
                <span className="max-w-[90px] text-center text-[9px] leading-tight text-[#1a2538]/50">
                  {step.sub}
                </span>
              </div>
              {i < PIPELINE.length - 1 && <Arrow />}
            </motion.div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
              className="rounded-xl border border-[#1a2538]/[0.06] bg-white/60 p-5 backdrop-blur-sm"
              style={{ borderLeft: `3px solid ${card.color}` }}
            >
              <h3 className="text-sm font-bold text-[#1a2538]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#1a2538]/70">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center font-mono text-xs text-[#1a2538]/40"
        >
          Two-model pipeline. Constitutional rubric cached. Smart escalation.
        </motion.p>
      </div>
    </div>
  );
}
