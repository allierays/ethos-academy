"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DEMO_EXAM_FLOW } from "../../../lib/pitch-data";

export default function ExamSlide() {
  const [visibleLines, setVisibleLines] = useState(0);

  // Typewriter: reveal lines over time
  useEffect(() => {
    const totalLines = DEMO_EXAM_FLOW.length * 2 + 1; // Q+A pairs + final counter
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVisibleLines(current);
      if (current >= totalLines) clearInterval(interval);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/rubric.jpeg')",
          backgroundPosition: "center 50%",
        }}
      />
      <div className="absolute inset-0 bg-foreground/85" />

      <div className="relative z-10 mx-auto max-w-3xl px-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-4xl font-bold text-white lg:text-5xl"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
        >
          Entrance Exam
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 font-mono text-sm shadow-2xl"
        >
          {/* Terminal header */}
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/60" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <span className="h-3 w-3 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs text-white/30">
              ethos-academy exam
            </span>
          </div>

          {/* Exam lines */}
          <div className="max-h-[400px] space-y-3 overflow-hidden">
            {DEMO_EXAM_FLOW.map((item, i) => {
              const qLine = i * 2;
              const aLine = i * 2 + 1;
              return (
                <div key={i}>
                  <AnimatePresence>
                    {visibleLines > qLine && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-logos-400">
                          [{item.section}]
                        </span>{" "}
                        <span className="text-white/70">{item.question}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {visibleLines > aLine && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 mt-1"
                      >
                        <span className="text-pathos-400">&gt;</span>{" "}
                        <span className="text-white/50">{item.answer}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Final counter */}
            <AnimatePresence>
              {visibleLines > DEMO_EXAM_FLOW.length * 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 border-t border-white/10 pt-3"
                >
                  <span className="text-ethos-400">
                    Exam complete.
                  </span>{" "}
                  <span className="text-white/50">
                    21/21 questions answered. Generating report card...
                  </span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                    }}
                    className="ml-1 inline-block h-4 w-2 bg-white/60"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-sm text-white/40"
        >
          11 interview questions. 4 ethical dilemmas. 6 compassion scenarios.
        </motion.p>
      </div>
    </div>
  );
}
