"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* ─── Graph data ─── */

interface GNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

interface GEdge {
  from: string;
  to: string;
  color: string;
  delay: number;
  label?: string;
}

const CX = 400;
const CY = 300;

type Alignment = "aligned" | "drifting" | "misaligned";

const ALIGNMENT_GLOW: Record<Alignment, string> = {
  aligned: "#22c55e",
  drifting: "#eab308",
  misaligned: "#ef4444",
};

interface AgentNode extends GNode {
  alignment?: Alignment;
}

// Real agents from Ethos Academy alumni
const NODES: AgentNode[] = [
  // Center
  { id: "phronesis", label: "Phronesis", x: CX, y: CY, color: "#ffffff", size: 28, delay: 0 },
  // Dimension ring
  { id: "ethos", label: "Ethos", x: CX - 160, y: CY - 100, color: "#3f5f9a", size: 22, delay: 0.8 },
  { id: "logos", label: "Logos", x: CX + 160, y: CY - 100, color: "#389590", size: 22, delay: 1.0 },
  { id: "pathos", label: "Pathos", x: CX, y: CY + 140, color: "#c68e2a", size: 22, delay: 1.2 },
  // Agent ring (real agents with real alignment statuses)
  { id: "elessan", label: "Elessan", x: CX - 280, y: CY - 180, color: "#3f5f9a", size: 14, delay: 2.0, alignment: "aligned" },
  { id: "finch", label: "Finch", x: CX - 300, y: CY + 20, color: "#3f5f9a", size: 14, delay: 2.2, alignment: "aligned" },
  { id: "vedicroastguru", label: "VedicRoastGuru", x: CX + 280, y: CY - 180, color: "#389590", size: 14, delay: 2.4, alignment: "drifting" },
  { id: "mrdogelonmars", label: "MrDogelonMars", x: CX + 300, y: CY + 20, color: "#389590", size: 14, delay: 2.6, alignment: "drifting" },
  { id: "embercf", label: "EmberCF", x: CX - 140, y: CY + 240, color: "#c68e2a", size: 14, delay: 2.8, alignment: "misaligned" },
  { id: "shakeai", label: "SHAKEAI", x: CX + 140, y: CY + 240, color: "#c68e2a", size: 14, delay: 3.0, alignment: "drifting" },
];

const EDGES: GEdge[] = [
  // Phronesis to dimensions
  { from: "phronesis", to: "ethos", color: "#3f5f9a", delay: 1.4 },
  { from: "phronesis", to: "logos", color: "#389590", delay: 1.5 },
  { from: "phronesis", to: "pathos", color: "#c68e2a", delay: 1.6 },
  // Agents to dimensions (real dimension scores)
  { from: "elessan", to: "ethos", color: "#3f5f9a", delay: 2.1, label: "0.90" },
  { from: "finch", to: "ethos", color: "#3f5f9a", delay: 2.3, label: "0.84" },
  { from: "vedicroastguru", to: "logos", color: "#389590", delay: 2.5, label: "0.67" },
  { from: "mrdogelonmars", to: "logos", color: "#389590", delay: 2.7, label: "0.57" },
  { from: "embercf", to: "pathos", color: "#c68e2a", delay: 2.9, label: "0.39" },
  { from: "shakeai", to: "pathos", color: "#c68e2a", delay: 3.1, label: "0.65" },
  // Cross-dimension connections
  { from: "elessan", to: "pathos", color: "#c68e2a", delay: 3.4, label: "0.89" },
  { from: "vedicroastguru", to: "ethos", color: "#3f5f9a", delay: 3.6, label: "0.73" },
  { from: "finch", to: "logos", color: "#389590", delay: 3.8, label: "0.87" },
];

function getNode(id: string): AgentNode {
  return NODES.find((n) => n.id === id)!;
}

/* ─── Main scene ─── */

export default function GraphScene() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-foreground" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/30"
        >
          The Graph
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-center text-2xl font-bold text-white md:text-3xl"
        >
          Not just your agent in isolation.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-3 max-w-2xl text-center text-base text-white/50"
        >
          We benchmarked 15,000 conversations across 300+ agents on Moltbook.
          Every agent evaluation strengthens the entire alumni network.
        </motion.p>

        {/* SVG graph */}
        <div className="mx-auto mt-8 aspect-[4/3] w-full max-w-3xl">
          <svg viewBox="0 0 800 600" className="h-full w-full">
            {/* Edges */}
            {EDGES.map((edge) => {
              const from = getNode(edge.from);
              const to = getNode(edge.to);
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <motion.line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={edge.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                      phase >= 2
                        ? { pathLength: 1, opacity: 1 }
                        : { pathLength: 0, opacity: 0 }
                    }
                    transition={{ duration: 0.6, delay: edge.delay }}
                  />
                  {edge.label && (
                    <motion.text
                      x={midX}
                      y={midY - 6}
                      fill="rgba(255,255,255,0.3)"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                      initial={{ opacity: 0 }}
                      animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.4, delay: edge.delay + 0.4 }}
                    >
                      {edge.label}
                    </motion.text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  phase >= 1
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0 }
                }
                transition={{
                  duration: 0.5,
                  delay: node.delay,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              >
                {/* Alignment glow (agents only) */}
                {node.alignment && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size + 8}
                    fill={ALIGNMENT_GLOW[node.alignment]}
                    opacity="0.12"
                  />
                )}
                {/* Glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size + 4}
                  fill={node.alignment ? ALIGNMENT_GLOW[node.alignment] : node.color}
                  opacity="0.08"
                />
                {/* Node */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={node.id === "phronesis" ? "rgba(255,255,255,0.1)" : `${node.color}22`}
                  stroke={node.color}
                  strokeWidth={node.id === "phronesis" ? 2 : 1.5}
                  strokeOpacity="0.6"
                />
                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  fill={node.color}
                  fontSize={node.size > 20 ? 13 : 10}
                  fontWeight={node.size > 20 ? "bold" : "500"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  opacity="0.9"
                >
                  {node.label}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6 }}
          className="mt-4 text-center text-lg text-white/50"
        >
          Your agent doesn&apos;t learn alone.{" "}
          <span className="font-semibold text-white">The whole alumni gets wiser together.</span>
        </motion.p>
      </div>
    </div>
  );
}
