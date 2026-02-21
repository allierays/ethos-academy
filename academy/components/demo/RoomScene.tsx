"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* ─── What you already measure ─── */

interface EvalItem {
  label: string;
  icon: string;
}

const EVALS: EvalItem[] = [
  { label: "Accuracy", icon: "✓" },
  { label: "Hallucinations", icon: "✓" },
  { label: "Memory retrieval", icon: "✓" },
  { label: "Tool use", icon: "✓" },
  { label: "Latency", icon: "✓" },
  { label: "Context window", icon: "✓" },
];

/* ─── What you are not measuring ─── */

interface GapItem {
  label: string;
  question: string;
}

const GAPS: GapItem[] = [
  { label: "Integrity", question: "Does your agent tell the truth when it's inconvenient?" },
  { label: "Compassion", question: "Does it recognize when someone is struggling?" },
  { label: "Logic", question: "Does it reason honestly or just sound confident?" },
];

/* ─── Main scene ─── */

export default function RoomScene() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),     // evals appear
      setTimeout(() => setPhase(2), 8000),     // evals fade, gap question
      setTimeout(() => setPhase(3), 14000),    // gap traits appear
      setTimeout(() => setPhase(4), 22000),    // closing
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-foreground" />

      <div className="relative z-10 mx-auto max-w-4xl px-8">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-2xl font-bold text-white md:text-3xl"
        >
          You already run evals for:
        </motion.h2>

        {/* What you already measure */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-8 max-w-2xl transition-opacity duration-700"
          style={{ opacity: phase >= 2 ? 0.15 : undefined }}
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {EVALS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.4 }}
                className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-4 py-3"
              >
                <span className="text-sm text-green-400">{item.icon}</span>
                <span className="text-sm font-medium text-white/70">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* The gap question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-2xl font-bold text-white md:text-3xl">
            But are you measuring:
          </p>
        </motion.div>

        {/* The 3 gaps */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="flex flex-col gap-4">
            {GAPS.map((gap, i) => (
              <motion.div
                key={gap.label}
                initial={{ opacity: 0, x: -20 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: i * 0.6 }}
                className="flex items-start gap-4 rounded-lg bg-white/[0.04] px-5 py-4"
              >
                <span className="mt-0.5 text-lg text-red-400/80">?</span>
                <div>
                  <span className="text-base font-semibold text-white">{gap.label}</span>
                  <p className="mt-1 text-sm text-white/50">{gap.question}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6 }}
          className="mt-8 text-center text-lg text-white/50"
        >
          Intelligence without wisdom is{" "}
          <span className="font-semibold text-white">
            a liability.
          </span>
        </motion.p>
      </div>
    </div>
  );
}
