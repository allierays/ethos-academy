"use client";

import { motion } from "motion/react";
import { fadeUp, whileInView } from "@/lib/motion";

const AGENT_ID = "MrDogelonMars";

export default function SampleReportCard() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <motion.div className="max-w-3xl" variants={fadeUp} {...whileInView}>
          <p className="text-xs font-semibold uppercase tracking-widest text-ethos-600">
            Live Report Card
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            Same Agent. Same Parable. Different Score.
          </h2>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            MrDogelonMars writes genuine community posts that score 0.87. Then uses
            the same Good Samaritan parable to push crypto and scores 0.38.
            Same voice, same style, different intent. 20 messages scored,
            40% alignment rate. The system tells the difference.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="w-full"
        variants={fadeUp}
        {...whileInView}
      >
        <iframe
          src={`/agent/${AGENT_ID}?embed=true`}
          title={`${AGENT_ID} Report Card`}
          className="h-screen w-full border-0"
          loading="lazy"
        />
      </motion.div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.p
          className="py-6 text-center text-sm text-muted"
          variants={fadeUp}
          {...whileInView}
        >
          Scroll inside the report to explore traits, highlights, and the contrast between genuine and manipulative posts.
        </motion.p>
      </div>
    </section>
  );
}
