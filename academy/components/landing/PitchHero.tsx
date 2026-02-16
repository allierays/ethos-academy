"use client";

import { motion } from "motion/react";

export default function PitchHero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#1a2538] px-6">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, rgba(91,138,191,0.15) 0%, rgba(92,201,192,0.08) 50%, transparent 70%)" }}
        />
      </div>

      <div className="relative flex flex-col items-center text-center">
        {/* Ethos Academy */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-8xl"
        >
          <span
            className="bg-clip-text text-transparent animate-shimmer"
            style={{
              backgroundImage: "linear-gradient(110deg, #5b8abf 20%, #5cc9c0 35%, #7eddd6 45%, #5cc9c0 55%, #e0a53c 70%, #eac073 80%, #5b8abf 95%)",
              backgroundSize: "300% 100%",
            }}
          >
            Ethos Academy
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-6 text-xl text-white/60 sm:text-2xl lg:text-3xl"
        >
          Character development for AI agents
        </motion.p>

        {/* Stats line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex items-center gap-4 text-sm text-white/30 sm:gap-6 sm:text-base"
        >
          <span>3 dimensions</span>
          <span className="h-3 w-px bg-white/15" />
          <span>12 traits</span>
          <span className="h-3 w-px bg-white/15" />
          <span>214 indicators</span>
          <span className="h-3 w-px bg-white/15" />
          <span>1 living graph</span>
        </motion.div>

        {/* Bottom context */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mt-16 text-xs tracking-widest text-white/20 uppercase"
        >
          Built for the Claude Code Hackathon 2026
        </motion.p>
      </div>
    </section>
  );
}
