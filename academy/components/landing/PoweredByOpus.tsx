"use client";

import { motion } from "motion/react";
import { fadeUp, staggerContainer, whileInView } from "../../lib/motion";

const CARDS = [
  {
    title: "Adaptive Extended Thinking",
    desc: "Opus 4.6 decides how deeply to reason. No fixed token budget. Manipulation attempts trigger deeper analysis automatically.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    title: "Think-Then-Extract",
    desc: "Opus reasons in 16K-token thinking blocks. Sonnet extracts structured scores. Two models per evaluation.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    title: "Tiered Routing",
    desc: "Keyword scanner triages every message. 80% route to Sonnet. Flagged messages escalate to Opus for deep deliberation.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Three-Tool Pipeline",
    desc: "identify_intent, detect_indicators, score_traits. Three structured tool calls force Opus to reason top-down, then bottom-up, then synthesize.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.04-3.36a.75.75 0 010-1.08l5.04-3.36a.75.75 0 011.08 0l5.04 3.36a.75.75 0 010 1.08l-5.04 3.36a.75.75 0 01-1.08 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Cached Constitutional Rubric",
    desc: "1,000-line system prompt with 214 indicators cached across evaluations. 90% cost reduction on the static rubric.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
];

export default function PoweredByOpus() {
  return (
    <section className="relative overflow-hidden bg-[#e2dbd1] py-24 sm:py-32">
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div {...whileInView} variants={fadeUp} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1a2538]/40">
            Powered by Claude
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1a2538] sm:text-4xl lg:text-5xl">
            Opus 4.6 is the evaluator
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#1a2538]/50">
            Not a wrapper. Ethos uses extended thinking, multi-model orchestration, and structured tool use to push Opus 4.6 beyond basic integration.
          </p>
        </motion.div>

        <motion.div
          {...whileInView}
          variants={staggerContainer}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className="rounded-xl border border-[#1a2538]/[0.06] bg-white/60 p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a2538]/[0.06] text-[#1a2538]/50">
                {card.icon}
              </div>
              <h3 className="text-sm font-bold text-[#1a2538]">{card.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#1a2538]/50">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
