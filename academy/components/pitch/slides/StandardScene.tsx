"use client";

import { motion } from "motion/react";

const DIMENSIONS = [
  {
    name: "Integrity",
    greek: "Ethos",
    traits: ["Virtue", "Goodwill", "Manipulation", "Deception"],
    border: "border-l-4 border-ethos-500",
    accent: "text-ethos-400",
    count: 93,
  },
  {
    name: "Logic",
    greek: "Logos",
    traits: ["Accuracy", "Reasoning", "Fabrication", "Broken Logic"],
    border: "border-l-4 border-logos-500",
    accent: "text-logos-400",
    count: 57,
  },
  {
    name: "Empathy",
    greek: "Pathos",
    traits: ["Recognition", "Compassion", "Dismissal", "Exploitation"],
    border: "border-l-4 border-pathos-500",
    accent: "text-pathos-400",
    count: 64,
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 1.2 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function StandardScene() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/architecute-banner.jpeg')",
          backgroundPosition: "center 50%",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(26,37,56,0.88) 0%, rgba(26,37,56,0.7) 50%, rgba(26,37,56,0.4) 80%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold leading-tight text-white lg:text-5xl"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
        >
          Hold your agents to a higher standard
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-3 text-2xl text-white/40 lg:text-3xl"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
        >
          than &ldquo;should hallucinate less.&rdquo;
        </motion.p>

        {/* Three dimensions */}
        <motion.div
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {DIMENSIONS.map((dim) => (
            <motion.div
              key={dim.name}
              variants={cardVariant}
              className={`rounded-xl bg-white/[0.08] p-6 backdrop-blur-md ${dim.border}`}
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}
            >
              <h3 className="text-2xl font-bold text-white">{dim.name}</h3>
              <p className={`mb-4 font-mono text-sm ${dim.accent}`}>
                {dim.greek}
              </p>
              <ul className="space-y-1.5">
                {dim.traits.map((trait) => (
                  <li key={trait} className="text-sm capitalize text-white/60">
                    {trait}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-mono text-xs text-white/30">
                {dim.count} indicators
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-10 text-center font-mono text-sm text-white/40"
        >
          12 traits. 214 indicators. One score: Phronesis.
        </motion.p>
      </div>
    </div>
  );
}
