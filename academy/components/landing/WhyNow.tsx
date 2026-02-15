"use client";

import { motion } from "motion/react";
import { fadeUp, staggerContainer, whileInView } from "../../lib/motion";

const POINTS = [
  {
    stat: "Emails, support, infrastructure, finance",
    label: "AI agents make real decisions every day",
  },
  {
    stat: "Benchmarks test capability",
    label: "We measure what agents CAN do, not HOW they behave",
  },
  {
    stat: "95% on coding, 0% on character",
    label: "A top-scoring agent can still manipulate, fabricate, and dismiss",
  },
  {
    stat: "Continuous, not one-time",
    label: "Ethos evaluates character over time, not on a single test",
  },
];

export default function WhyNow() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div {...whileInView} variants={fadeUp} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-ethos-600">
            The gap
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Why character evaluation matters now
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            AI agents are making consequential decisions. We test what they can do.
            No one tests how they behave.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2"
          {...whileInView}
          variants={staggerContainer}
        >
          {POINTS.map((point) => (
            <motion.div
              key={point.stat}
              variants={fadeUp}
              className="rounded-2xl border border-border/50 bg-background p-6"
            >
              <p className="text-lg font-semibold tracking-tight">
                {point.stat}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {point.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
