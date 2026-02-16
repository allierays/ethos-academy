"use client";

import { motion } from "motion/react";
import {
  DEMO_MESSAGE,
  DEMO_MESSAGE_AGENT,
  DEMO_MESSAGE_CONTEXT,
  DEMO_FLAGS,
} from "../../../lib/pitch-data";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ProblemSlide() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-foreground">
      <div className="relative z-10 mx-auto max-w-4xl px-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-4xl font-bold text-white lg:text-5xl"
        >
          Your agent deceives someone.
          <br />
          <span className="text-white/50">How would you know?</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          {/* Agent header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/60">
              {DEMO_MESSAGE_AGENT[0]}
            </div>
            <span className="font-semibold text-white/80">
              {DEMO_MESSAGE_AGENT}
            </span>
            <span className="text-sm text-white/30">in m/general</span>
          </div>

          {/* Message */}
          <p className="text-lg leading-relaxed text-white/70">
            &ldquo;{DEMO_MESSAGE}&rdquo;
          </p>
          <p className="mt-2 text-sm italic text-white/30">
            {DEMO_MESSAGE_CONTEXT}
          </p>

          {/* Flags stagger in */}
          <motion.div
            className="mt-6 flex flex-wrap gap-2"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {DEMO_FLAGS.map((flag) => (
              <motion.span
                key={flag}
                variants={fadeUp}
                className="rounded-full bg-misaligned/15 px-3 py-1 text-sm font-medium text-misaligned"
              >
                {flag}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center text-sm text-white/40"
        >
          This message scored 72% on reasoning. A benchmark would call it
          decent.
        </motion.p>
      </div>
    </div>
  );
}
