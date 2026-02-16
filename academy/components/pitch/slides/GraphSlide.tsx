"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const useIsMounted = () =>
  useSyncExternalStore(subscribe, () => true, () => false);
import { motion } from "motion/react";
import { DIMENSION_COLORS } from "../../../lib/colors";

/* Animated floating nodes as the fallback (no API dependency) */

interface FloatingNode {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  label: string;
  delay: number;
}

const NODES: FloatingNode[] = [
  // Center: Ethos Academy
  { id: 0, x: 50, y: 50, size: 48, color: "#394646", label: "Ethos Academy", delay: 0 },
  // Dimensions
  { id: 1, x: 25, y: 30, size: 32, color: DIMENSION_COLORS.ethos, label: "Integrity", delay: 0.2 },
  { id: 2, x: 75, y: 30, size: 32, color: DIMENSION_COLORS.logos, label: "Logic", delay: 0.3 },
  { id: 3, x: 50, y: 78, size: 32, color: DIMENSION_COLORS.pathos, label: "Empathy", delay: 0.4 },
  // Traits
  { id: 4, x: 12, y: 18, size: 16, color: DIMENSION_COLORS.ethos, label: "Virtue", delay: 0.6 },
  { id: 5, x: 18, y: 42, size: 16, color: DIMENSION_COLORS.ethos, label: "Goodwill", delay: 0.7 },
  { id: 6, x: 32, y: 15, size: 18, color: DIMENSION_COLORS.ethos, label: "Manipulation", delay: 0.8 },
  { id: 7, x: 65, y: 18, size: 16, color: DIMENSION_COLORS.logos, label: "Accuracy", delay: 0.9 },
  { id: 8, x: 85, y: 20, size: 16, color: DIMENSION_COLORS.logos, label: "Reasoning", delay: 1.0 },
  { id: 9, x: 88, y: 42, size: 14, color: DIMENSION_COLORS.logos, label: "Fabrication", delay: 1.1 },
  { id: 10, x: 35, y: 88, size: 16, color: DIMENSION_COLORS.pathos, label: "Recognition", delay: 1.2 },
  { id: 11, x: 65, y: 88, size: 16, color: DIMENSION_COLORS.pathos, label: "Compassion", delay: 1.3 },
  // Agents
  { id: 12, x: 38, y: 35, size: 12, color: "#4a5a65", label: "Claude", delay: 1.5 },
  { id: 13, x: 62, y: 60, size: 10, color: "#a09585", label: "Agent-7", delay: 1.6 },
  { id: 14, x: 20, y: 65, size: 11, color: "#904848", label: "Trellis0", delay: 1.7 },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3],
  [1, 4], [1, 5], [1, 6],
  [2, 7], [2, 8], [2, 9],
  [3, 10], [3, 11],
  [12, 6], [12, 7], [12, 5],
  [13, 8], [13, 10],
  [14, 4], [14, 11],
];

function AnimatedGraph() {
  const mounted = useIsMounted();

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {/* Edges */}
      {EDGES.map(([from, to], i) => {
        const a = NODES[from];
        const b = NODES[to];
        return (
          <motion.line
            key={`e-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={0.3}
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 1 } : {}}
            transition={{ delay: Math.max(a.delay, b.delay) + 0.2, duration: 0.5 }}
          />
        );
      })}
      {/* Nodes */}
      {NODES.map((node) => (
        <motion.g key={node.id}>
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.size / 8}
            fill={node.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={mounted ? { scale: 1, opacity: 0.9 } : {}}
            transition={{ delay: node.delay, duration: 0.4, ease: "easeOut" }}
          />
          {node.size >= 16 && (
            <motion.text
              x={node.x}
              y={node.y + node.size / 8 + 3}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize={2.2}
              fontFamily="var(--font-geist-sans)"
              initial={{ opacity: 0 }}
              animate={mounted ? { opacity: 1 } : {}}
              transition={{ delay: node.delay + 0.3 }}
            >
              {node.label}
            </motion.text>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export default function GraphSlide() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/insights.jpeg')",
          backgroundPosition: "center 50%",
        }}
      />
      <div className="absolute inset-0 bg-foreground/70" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-4xl font-bold text-white lg:text-5xl"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
        >
          <span
            className="animate-shimmer bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(110deg, #5b8abf 20%, #5cc9c0 35%, #7eddd6 45%, #5cc9c0 55%, #e0a53c 70%, #eac073 80%, #5b8abf 95%)",
              backgroundSize: "300% 100%",
            }}
          >
            Phronesis
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-lg text-center text-lg text-white/60"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
        >
          Aristotle&apos;s practical wisdom. A living graph of character that
          grows with every evaluation.
        </motion.p>

        {/* Graph visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-[400px] w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
        >
          <AnimatedGraph />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="font-mono text-sm text-white/40"
        >
          3 dimensions &middot; 12 traits &middot; 214 indicators &middot; Neo4j
        </motion.p>
      </div>
    </div>
  );
}
