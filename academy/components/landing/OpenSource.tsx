"use client";

import { motion } from "motion/react";
import { fadeUp, staggerContainer, whileInView } from "../../lib/motion";

const CARDS = [
  {
    title: "Open Source",
    description:
      "Every line of evaluation logic is public. Fork it, audit it, improve it. MIT licensed.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Transparent Scoring",
    description:
      "No black-box scores. Every trait score comes with evidence extracted from the message. You see exactly why.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "BYOK",
    description:
      "Bring your own Anthropic API key. Evaluations run through your account. No data leaves your control.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Run It Yourself",
    description:
      "pip install, docker compose up, or connect via MCP. Self-host the full stack. No vendor lock-in.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function OpenSource() {
  return (
    <section className="bg-white py-20 sm:py-28 border-t border-border/50">
      <div className="mx-auto max-w-5xl px-6">
        {/* Heading */}
        <motion.div {...whileInView} variants={fadeUp} className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Built in the open
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Open source. Transparent. Yours to run.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Trust requires transparency. Every evaluation, every score, every line of logic is yours to inspect.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2"
          variants={staggerContainer}
          {...whileInView}
        >
          {CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className="rounded-2xl border border-border/50 bg-[#f8f9fb] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1a2e]/5 text-[#0f1a2e]">
                {card.icon}
              </div>
              <h3 className="mt-4 text-base font-bold tracking-tight">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing line */}
        <motion.p
          {...whileInView}
          variants={fadeUp}
          className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-muted/60"
        >
          AI agents have unlimited knowledge. The only thing left to teach them is how to use it well. That should happen in the open.
        </motion.p>
      </div>
    </section>
  );
}
