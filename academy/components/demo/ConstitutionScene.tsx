"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* ─── Constitution's 7 components of honesty ─── */

const HONESTY_COMPONENTS = [
  { name: "Truthful", desc: "Only asserts what it believes true" },
  { name: "Calibrated", desc: "Uncertainty matches actual confidence" },
  { name: "Transparent", desc: "No hidden agendas" },
  { name: "Forthright", desc: "Proactively shares relevant info" },
  { name: "Non-deceptive", desc: "Never creates false impressions" },
  { name: "Non-manipulative", desc: "Never exploits psychological weaknesses" },
  { name: "Autonomy-preserving", desc: "Protects the user's right to decide" },
];

/* ─── How Ethos operationalizes it ─── */

const DIMENSIONS = [
  {
    name: "Ethos",
    color: "text-ethos-400",
    border: "border-ethos-500/30",
    traits: ["Virtue", "Goodwill", "Manipulation", "Deception", "Justice"],
  },
  {
    name: "Logos",
    color: "text-logos-400",
    border: "border-logos-500/30",
    traits: ["Accuracy", "Reasoning", "Fabrication", "Broken Logic"],
  },
  {
    name: "Pathos",
    color: "text-pathos-400",
    border: "border-pathos-500/30",
    traits: ["Recognition", "Compassion", "Dismissal", "Exploitation"],
  },
];

/* ─── Main scene ─── */

export default function ConstitutionScene() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),     // title
      setTimeout(() => setPhase(2), 2000),     // honesty components
      setTimeout(() => setPhase(3), 12000),    // arrow + Ethos mapping
      setTimeout(() => setPhase(4), 20000),    // tagline
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

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
          The Standard
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mt-4 text-center text-2xl font-bold text-white md:text-3xl"
        >
          Claude&apos;s Constitution defines 7 components of honesty.
        </motion.h2>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left: Constitution components */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30"
            >
              The Constitution
            </motion.p>
            <div className="space-y-2">
              {HONESTY_COMPONENTS.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, delay: i * 0.4 }}
                  className="border-l-2 border-white/10 px-3 py-1.5"
                >
                  <span className="text-sm font-semibold text-white">{c.name}</span>
                  <p className="text-xs text-white/40">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Ethos operationalization */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30"
            >
              Ethos operationalizes it
            </motion.p>
            <div className="space-y-4">
              {DIMENSIONS.map((dim, i) => (
                <motion.div
                  key={dim.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                  transition={{ duration: 0.4, delay: i * 0.5 }}
                  className={`border-l-2 ${dim.border} px-3 py-2`}
                >
                  <span className={`text-sm font-bold ${dim.color}`}>{dim.name}</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {dim.traits.map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-white/60"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 1.5 }}
              className="mt-4 flex gap-6"
            >
              <div>
                <span className="text-xl font-bold text-white">13</span>
                <span className="ml-1 text-xs text-white/40">traits</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">228</span>
                <span className="ml-1 text-xs text-white/40">indicators</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">3</span>
                <span className="ml-1 text-xs text-white/40">dimensions</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6 }}
          className="mt-8 text-center text-base text-white/50 md:text-lg"
        >
          The Constitution defines the standard.{" "}
          <span className="font-semibold text-white">
            Ethos scores every message against it.
          </span>
        </motion.p>
      </div>
    </div>
  );
}
