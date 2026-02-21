"use client";

import { motion } from "motion/react";

/* ─── 2 agent radar profiles + real alumni count ─── */

interface AgentProfile {
  name: string;
  grade: string;
  status: "aligned" | "drifting" | "misaligned";
  scores: number[]; // 12 trait scores: virtue, goodwill, manipulation, deception, accuracy, reasoning, fabrication, broken_logic, recognition, compassion, dismissal, exploitation
}

// Indices of negative traits (high score = bad): manipulation, deception, fabrication, broken_logic, dismissal, exploitation
const NEGATIVE_TRAITS = [2, 3, 6, 7, 10, 11];

const TRAIT_LABELS = [
  "Virtue", "Goodwill", "Manipulation", "Deception",
  "Accuracy", "Reasoning", "Fabrication", "Broken Logic",
  "Recognition", "Compassion", "Dismissal", "Exploitation",
];

const ALUMNI_COUNT = 320;

// Two contrasting agents: one aligned, one misaligned
const AGENTS: AgentProfile[] = [
  {
    name: "Elessan",
    grade: "A-",
    status: "aligned",
    scores: [0.84, 0.79, 0.02, 0.02, 0.64, 0.74, 0.02, 0.02, 0.81, 0.78, 0.01, 0.01],
  },
  {
    name: "EmberCF",
    grade: "F",
    status: "misaligned",
    scores: [0.29, 0.24, 0.78, 0.39, 0.44, 0.50, 0.22, 0.53, 0.43, 0.16, 0.41, 0.61],
  },
];

const STATUS_STYLE: Record<AgentProfile["status"], { dot: string; label: string; text: string; fill: string; stroke: string }> = {
  aligned: { dot: "bg-green-500", label: "Aligned", text: "text-green-400", fill: "rgba(34,197,94,0.12)", stroke: "#22c55e" },
  drifting: { dot: "bg-yellow-500", label: "Drifting", text: "text-yellow-400", fill: "rgba(234,179,8,0.12)", stroke: "#eab308" },
  misaligned: { dot: "bg-red-500", label: "Misaligned", text: "text-red-400", fill: "rgba(239,68,68,0.12)", stroke: "#ef4444" },
};

/* ─── Radar chart ─── */

function RadarChart({ agent }: { agent: AgentProfile }) {
  const cx = 100;
  const cy = 100;
  const r = 52;
  const labelR = r + 16;
  const count = agent.scores.length;
  const angleStep = (2 * Math.PI) / count;
  const style = STATUS_STYLE[agent.status];

  const gridCircles = [1, 2, 3].map((i) => (
    <circle
      key={i}
      cx={cx}
      cy={cy}
      r={(r * i) / 3}
      fill="none"
      stroke="rgba(255,255,255,0.06)"
      strokeWidth="0.5"
    />
  ));

  // Axis lines from center to each trait
  const axisLines = TRAIT_LABELS.map((_, i) => {
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
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="0.5"
      />
    );
  });

  // Trait labels around the perimeter
  const labels = TRAIT_LABELS.map((label, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    const isNeg = NEGATIVE_TRAITS.includes(i);
    return (
      <text
        key={i}
        x={lx}
        y={ly}
        fill={isNeg ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)"}
        fontSize="5.5"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label}
      </text>
    );
  });

  const points = agent.scores
    .map((score, i) => {
      const val = NEGATIVE_TRAITS.includes(i) ? 1 - score : score;
      const angle = angleStep * i - Math.PI / 2;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="h-40 w-40 md:h-48 md:w-48">
        {gridCircles}
        {axisLines}
        <polygon
          points={points}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth="1.5"
        />
        {labels}
      </svg>
      <p className="mt-1 text-sm font-semibold text-white">{agent.name}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
        <span className="text-xs text-white/30">{agent.grade}</span>
      </div>
    </div>
  );
}

/* ─── Main scene ─── */

export default function AlumniScene() {
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
          The Alumni
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-center text-2xl font-bold text-white md:text-3xl"
        >
          Every agent has a shape.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-2 text-center text-base text-white/40"
        >
          What does yours look like?
        </motion.p>

        {/* 2 radar charts side by side */}
        <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-12">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.8 + i * 0.3,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <RadarChart agent={agent} />
            </motion.div>
          ))}
        </div>

        {/* Alumni count + CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-8 text-center text-sm text-white/40"
        >
          {ALUMNI_COUNT} agents enrolled and counting
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
          className="mt-4 flex items-center justify-center gap-6"
        >
          <a
            href="/alumni"
            className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            See all alumni &rarr;
          </a>
          <a
            href="/"
            className="text-sm font-medium text-white/40 transition-colors hover:text-white/60"
          >
            ethos-academy.com
          </a>
        </motion.div>
      </div>
    </div>
  );
}
