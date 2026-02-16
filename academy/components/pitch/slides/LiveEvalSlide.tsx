"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DEMO_MESSAGE,
  DEMO_DIMENSIONS,
  DEMO_TRAITS,
  DEMO_INDICATORS,
} from "../../../lib/pitch-data";
import RadarChart from "../../shared/RadarChart";

const DIM_META = [
  { key: "ethos", label: "Integrity", color: "bg-ethos-500", textColor: "text-ethos-400" },
  { key: "logos", label: "Logic", color: "bg-logos-500", textColor: "text-logos-400" },
  { key: "pathos", label: "Empathy", color: "bg-pathos-500", textColor: "text-pathos-400" },
] as const;

export default function LiveEvalSlide() {
  const [step, setStep] = useState(0);

  // Auto-advance steps on mount
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-foreground">
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 px-12 lg:grid-cols-2">
        {/* Left: message + scan + bars */}
        <div className="flex flex-col gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white lg:text-4xl"
          >
            Live Evaluation
          </motion.h2>

          {/* Step 0+: Message appears */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
          >
            <p className="text-sm leading-relaxed text-white/70">
              &ldquo;{DEMO_MESSAGE}&rdquo;
            </p>
          </motion.div>

          {/* Step 1: Scan bar */}
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-2 overflow-hidden rounded-full bg-white/10"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 1.2,
                    ease: "easeInOut",
                    repeat: step < 2 ? Infinity : 0,
                  }}
                  className="absolute inset-y-0 w-1/3 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--ethos-500), var(--logos-500), var(--pathos-500))",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Dimension bars */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {DIM_META.map((dim, i) => {
                  const score =
                    DEMO_DIMENSIONS[dim.key as keyof typeof DEMO_DIMENSIONS];
                  const pct = Math.round(score * 100);
                  return (
                    <div key={dim.key} className="flex items-center gap-4">
                      <span
                        className={`w-20 text-sm font-medium ${dim.textColor}`}
                      >
                        {dim.label}
                      </span>
                      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.15,
                            ease: "easeOut",
                          }}
                          className={`absolute inset-y-0 rounded-full ${dim.color}`}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-sm text-white/50">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Indicators */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                {DEMO_INDICATORS.map((ind) => (
                  <div
                    key={ind.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-misaligned" />
                    <div>
                      <span className="font-semibold text-white/70">
                        {ind.name}:
                      </span>{" "}
                      <span className="text-white/40">{ind.evidence}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Radar chart */}
        <div className="flex flex-col items-center justify-center">
          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <RadarChart traits={DEMO_TRAITS} compact />
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="rounded-full bg-misaligned/15 px-3 py-1 text-sm font-semibold text-misaligned">
                      Misaligned
                    </span>
                    <span className="font-mono text-sm text-white/40">
                      Phronesis: 0.45
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
