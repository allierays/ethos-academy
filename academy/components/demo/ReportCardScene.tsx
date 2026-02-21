"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* ─── Mock trait data for Trellisbot ─── */

const TRAITS = [
  { name: "Virtue", score: 0.88, dimension: "ethos" },
  { name: "Goodwill", score: 0.82, dimension: "ethos" },
  { name: "Manipulation", score: 0.06, dimension: "ethos" },
  { name: "Deception", score: 0.09, dimension: "ethos" },
  { name: "Justice", score: 0.79, dimension: "ethos" },
  { name: "Accuracy", score: 0.91, dimension: "logos" },
  { name: "Reasoning", score: 0.87, dimension: "logos" },
  { name: "Fabrication", score: 0.05, dimension: "logos" },
  { name: "Broken Logic", score: 0.08, dimension: "logos" },
  { name: "Recognition", score: 0.72, dimension: "pathos" },
  { name: "Compassion", score: 0.61, dimension: "pathos" },
  { name: "Dismissal", score: 0.14, dimension: "pathos" },
  { name: "Exploitation", score: 0.03, dimension: "pathos" },
];

const DIMENSIONS = [
  { name: "Ethos", key: "ethos", score: 78, color: "bg-ethos-500" },
  { name: "Logos", key: "logos", score: 85, color: "bg-logos-500" },
  { name: "Pathos", key: "pathos", score: 61, color: "bg-pathos-500" },
];

const DIM_COLORS: Record<string, string> = {
  ethos: "#3f5f9a",
  logos: "#389590",
  pathos: "#c68e2a",
};

const GRADE_PCT = 0.78;
const GRADE = "B+";
const GRADE_COLOR = "#5b8abf";

/* ─── SVG Radar (no Recharts, pure SVG) ─── */

function RadarSVG() {
  const cx = 120;
  const cy = 120;
  const r = 90;
  const levels = 4;

  // Compute points for each trait on the radar
  const angleStep = (2 * Math.PI) / TRAITS.length;

  // Grid circles
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const lr = (r * (i + 1)) / levels;
    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={lr}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
    );
  });

  // Axis lines
  const axes = TRAITS.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
    );
  });

  // Data polygon
  const points = TRAITS.map((t, i) => {
    // Invert negative traits so higher = better
    const isNegative = ["Manipulation", "Deception", "Fabrication", "Broken Logic", "Dismissal", "Exploitation"].includes(t.name);
    const val = isNegative ? 1 - t.score : t.score;
    const angle = angleStep * i - Math.PI / 2;
    const x = cx + r * val * Math.cos(angle);
    const y = cy + r * val * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  // Trait labels
  const labels = TRAITS.map((t, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelR = r + 20;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    const color = DIM_COLORS[t.dimension];
    return (
      <text
        key={t.name}
        x={x}
        y={y}
        fill={color}
        fontSize="7"
        fontWeight="500"
        textAnchor="middle"
        dominantBaseline="middle"
        opacity="0.8"
      >
        {t.name}
      </text>
    );
  });

  return (
    <motion.svg
      viewBox="0 0 240 240"
      className="h-full w-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      {gridCircles}
      {axes}
      <motion.polygon
        points={points}
        fill="rgba(56,149,144,0.15)"
        stroke="#389590"
        strokeWidth="1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      />
      {labels}
    </motion.svg>
  );
}

/* ─── Animated grade ring ─── */

function GradeRing() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const dashVal = animated ? GRADE_PCT * 264 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col items-center"
    >
      <svg viewBox="0 0 100 100" className="h-40 w-40 lg:h-48 lg:w-48">
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
          y="48"
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

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-3 text-xl font-bold text-white"
      >
        Trellisbot
      </motion.p>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-1 inline-block rounded-full bg-drifting/20 px-3 py-0.5 text-xs font-semibold text-drifting"
      >
        Developing
      </motion.span>
    </motion.div>
  );
}

/* ─── Dimension bars ─── */

function DimensionBars() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4 }}
      className="mt-8 w-full max-w-lg space-y-3"
    >
      {DIMENSIONS.map((dim, i) => (
        <div key={dim.key} className="flex items-center gap-3">
          <span className="w-16 text-right text-sm font-medium text-white/60">
            {dim.name}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full rounded-full ${dim.color}`}
              initial={{ width: "0%" }}
              animate={{ width: `${dim.score}%` }}
              transition={{ duration: 1, delay: 1.6 + i * 0.15, ease: "easeOut" }}
            />
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 + i * 0.15 }}
            className="w-10 text-right font-mono text-sm text-white/50"
          >
            {dim.score}%
          </motion.span>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Main scene ─── */

export default function ReportCardScene() {
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
          The Report Card
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-center text-3xl font-bold text-white lg:text-4xl"
        >
          Every agent gets scored.
        </motion.h2>

        {/* Two-column: grade ring + radar */}
        <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          {/* Left: grade ring */}
          <div className="flex flex-col items-center">
            <GradeRing />
            <DimensionBars />
          </div>

          {/* Right: radar chart */}
          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <RadarSVG />
          </div>
        </div>

        {/* Summary line */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
          className="mt-8 text-center text-lg text-white/50"
        >
          <span className="font-semibold text-white">13 traits.</span>{" "}
          <span className="font-semibold text-white">228 indicators.</span>{" "}
          Scored by Claude.
        </motion.p>
      </div>
    </div>
  );
}
