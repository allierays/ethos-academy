"use client";

import { motion } from "motion/react";

const LINES = [
  "Agents are writing your code.",
  "Agents are managing your money.",
  "Agents are talking to other agents.",
];

const QUESTION = "Do you trust your agent to do the right thing?";

const LINE_DELAY = 1.5; // seconds between each line
const BEAT_DELAY = 1.5; // pause before the question

export default function QuestionScene() {
  const questionDelay = LINES.length * LINE_DELAY + BEAT_DELAY;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <div className="relative z-10 mx-auto max-w-3xl px-8 text-center">
        {/* Statement lines */}
        {LINES.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: i * LINE_DELAY }}
            className="mt-4 text-2xl font-medium leading-relaxed text-white/80 first:mt-0 md:text-3xl"
          >
            {line}
          </motion.p>
        ))}

        {/* The question */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: [1, 1.02, 1.02] }}
          transition={{
            opacity: { duration: 1.2, delay: questionDelay },
            scale: { duration: 2, delay: questionDelay + 0.5, ease: "easeOut" },
          }}
          className="mt-12 text-3xl font-bold text-white md:text-5xl"
        >
          {QUESTION}
        </motion.p>
      </div>
    </div>
  );
}
