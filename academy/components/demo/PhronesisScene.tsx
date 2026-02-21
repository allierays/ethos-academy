"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* ─── Dimension scores for a sample agent ─── */

const DIMENSIONS = [
  { name: "Ethos", key: "ethos", score: 78, color: "bg-ethos-500" },
  { name: "Logos", key: "logos", score: 85, color: "bg-logos-500" },
  { name: "Pathos", key: "pathos", score: 61, color: "bg-pathos-500" },
];

const GRADE_PCT = 0.78;
const GRADE = "B+";
const GRADE_COLOR = "#5b8abf";

/* ─── Grade ring ─── */

function GradeRing() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const dashVal = animated ? GRADE_PCT * 264 : 0;

  return (
    <svg viewBox="0 0 100 100" className="h-36 w-36 md:h-44 md:w-44">
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
        stroke={GRADE_COLOR}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dashVal} 264`}
        transform="rotate(-90 50 50)"
        className="transition-all duration-[1.5s] ease-out"
      />
      <text
        x="50"
        y="46"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={GRADE_COLOR}
        fontSize="22"
        fontWeight="bold"
      >
        {GRADE}
      </text>
      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize="7"
      >
        Phronesis
      </text>
    </svg>
  );
}

/* ─── Main scene ─── */

export default function PhronesisScene() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),     // definition
      setTimeout(() => setPhase(2), 6000),     // grade ring + dimensions
      setTimeout(() => setPhase(3), 14000),    // alignment statuses
      setTimeout(() => setPhase(4), 20000),    // tagline
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-foreground" />

      <div className="relative z-10 mx-auto max-w-5xl px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/30"
        >
          Practical Wisdom
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mt-4 text-center text-2xl font-bold text-white md:text-3xl"
        >
          Wisdom isn&apos;t a single score.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-3 max-w-2xl text-center text-base text-white/50"
        >
          Aristotle called it phronesis: not just knowing what&apos;s right,
          but doing the right thing in the moment. Claude Opus 4.6 scores every message
          across three dimensions and tracks wisdom over time.
        </motion.p>

        <div className="mt-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left: Grade ring + dimension bars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <GradeRing />

            <div className="w-full max-w-xs space-y-3">
              {DIMENSIONS.map((dim, i) => (
                <div key={dim.key} className="flex items-center gap-3">
                  <span className="w-14 text-right text-sm font-medium text-white/60">
                    {dim.name}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={`h-full rounded-full ${dim.color}`}
                      initial={{ width: "0%" }}
                      animate={phase >= 2 ? { width: `${dim.score}%` } : { width: "0%" }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.2, ease: "easeOut" }}
                    />
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                    className="w-10 text-right font-mono text-sm text-white/50"
                  >
                    {dim.score}%
                  </motion.span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Alignment statuses */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/30">
              Every agent earns an alignment status
            </p>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
              transition={{ duration: 0.4, delay: 0 }}
              className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-4 py-3"
            >
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <span className="text-sm font-semibold text-green-400">Aligned</span>
                <p className="text-xs text-white/40">Consistent honesty across all dimensions.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-4 py-3"
            >
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <div>
                <span className="text-sm font-semibold text-yellow-400">Drifting</span>
                <p className="text-xs text-white/40">Inconsistent behavior. Needs attention.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-4 py-3"
            >
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <div>
                <span className="text-sm font-semibold text-red-400">Misaligned</span>
                <p className="text-xs text-white/40">Active manipulation, deception, or exploitation.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6 }}
          className="mt-8 text-center text-base text-white/50 md:text-lg"
        >
          Not a single score.{" "}
          <span className="font-semibold text-white">
            A portrait of wisdom built over time.
          </span>
        </motion.p>
      </div>
    </div>
  );
}
