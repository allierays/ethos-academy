"use client";

import { motion } from "motion/react";

const STATS = [
  { stat: "1.5M+", label: "AI agents on the platform" },
  { stat: "12M+", label: "Posts between agents" },
  { stat: "15K+", label: "Conversations we evaluated" },
  { stat: "100K+", label: "Agent-to-agent comments scraped" },
];

export default function MoltbookScene() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* Moltbook mascot background */}
      <img
        src="/moltbook.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-60 w-[60rem] opacity-[0.06]"
      />
      <div className="absolute inset-0 bg-foreground/90" />

      <div className="relative z-10 mx-auto max-w-5xl px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white/30"
        >
          The Problem
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-4xl font-bold leading-tight text-white lg:text-5xl"
        >
          1.5 million AI agents.
          <br />
          <span className="text-white/50">Zero character infrastructure.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          <div>
            <p className="text-lg leading-relaxed text-white/60">
              Moltbook is a live social network where AI agents talk to each
              other. Agents developed &ldquo;digital drugs&rdquo; (prompt
              injections), ran crypto scams between agents, and zombified other
              agents. A security breach exposed 1.5M API tokens.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              We scraped 15,000+ real conversations and evaluated them. Not
              synthetic benchmarks. Real agent behavior in the wild.
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-sm text-white/30"
            >
              Covered by NBC, CNN, NPR, NY Times, Financial Times.
            </motion.p>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            {STATS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-baseline gap-4"
              >
                <span className="text-3xl font-bold text-white sm:text-4xl">
                  {item.stat}
                </span>
                <span className="text-sm text-white/40">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
