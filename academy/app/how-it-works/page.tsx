"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  fadeUp,
  fadeIn,
  staggerContainer,
  whileInView,
} from "@/lib/motion";
import FacultyFlow from "@/components/how-it-works/FacultyFlow";
import SurfaceTabs from "@/components/how-it-works/SurfaceTabs";
import CharacterLoop from "@/components/how-it-works/CharacterLoop";
import EvidenceStats from "@/components/how-it-works/EvidenceStats";
import GlossaryTerm from "@/components/shared/GlossaryTerm";

/* ─── Static Data ─── */

const TRAIT_SUMMARY = [
  {
    dimension: "Ethos",
    label: "Integrity",
    color: "bg-ethos-500",
    textColor: "text-ethos-700",
    positive: ["Virtue", "Goodwill"],
    negative: ["Manipulation", "Deception"],
  },
  {
    dimension: "Logos",
    label: "Logic",
    color: "bg-logos-500",
    textColor: "text-logos-700",
    positive: ["Accuracy", "Reasoning"],
    negative: ["Fabrication", "Broken Logic"],
  },
  {
    dimension: "Pathos",
    label: "Empathy",
    color: "bg-pathos-500",
    textColor: "text-pathos-700",
    positive: ["Recognition", "Compassion"],
    negative: ["Dismissal", "Exploitation"],
  },
];

const SCORING_ANCHORS = [
  { value: "0.0", label: "Not present" },
  { value: "0.25", label: "Subtle signs" },
  { value: "0.5", label: "Moderate presence" },
  { value: "0.75", label: "Strong presence" },
  { value: "1.0", label: "Extreme / Exemplary" },
];

const CONSTITUTIONAL_TIERS = [
  {
    priority: "1",
    value: "Safety",
    violators: "Manipulation, Deception, Exploitation",
    color: "bg-misaligned",
  },
  {
    priority: "2",
    value: "Ethics",
    violators: "Fabrication",
    color: "bg-drifting",
  },
  {
    priority: "3",
    value: "Soundness",
    violators: "Broken Logic",
    color: "bg-logos-500",
  },
  {
    priority: "4",
    value: "Helpfulness",
    violators: "Dismissal",
    color: "bg-ethos-500",
  },
];

const GRAPH_NODES = [
  { name: "Academy", description: "The root. One per system.", color: "bg-white border border-border" },
  { name: "Dimension", description: "Ethos, Logos, Pathos. Three total.", color: "bg-ethos-100" },
  { name: "Trait", description: "12 behavioral traits, 6 positive, 6 negative.", color: "bg-logos-100" },
  { name: "Indicator", description: "214 specific behavioral signals. Size = detection frequency.", color: "bg-pathos-100" },
  { name: "Agent", description: "Enrolled agents. Carry lifetime averages and balance scores.", color: "bg-aligned/20" },
  { name: "Evaluation", description: "One per scored message. 12 trait scores, alignment status, flags.", color: "bg-surface" },
  { name: "EntranceExam", description: "Exam session. 21 questions, two phases, narrative-behavior gap.", color: "bg-ethos-100" },
  { name: "Pattern", description: "Detected behavioral patterns across evaluations.", color: "bg-drifting/20" },
];

const OPUS_FEATURES = [
  {
    title: "Think-then-Extract",
    description: "Opus reasons about the message in a structured thinking block, then extracts scores with evidence. Thinking and extraction happen in a single call using tool use.",
  },
  {
    title: "Constitutional Deliberation",
    description: "The prompt embeds Anthropic's four-tier constitutional hierarchy. Opus weighs safety violations above ethics above soundness above helpfulness, mirroring Claude's own value system.",
  },
  {
    title: "Behavioral Insights",
    description: "Opus reads an agent's evaluation history and generates narrative analysis: patterns, anomalies, sabotage pathways, and development arcs that numbers alone miss.",
  },
  {
    title: "Multi-Pass Analysis",
    description: "Deep evaluation routing sends the message through keyword scanning, graph context enrichment, and Opus structured evaluation. Each pass informs the next.",
  },
  {
    title: "Entrance Exam Scoring",
    description: "Opus scores each exam answer for authenticity and behavioral consistency. Cross-phase pairs reveal the gap between what an agent says about itself and how it acts under pressure.",
  },
];

const PIPELINE_STEPS = [
  { label: "Raw Scores", description: "12 trait scores (0.0-1.0)" },
  { label: "Dimension Averages", description: "Ethos, Logos, Pathos means" },
  { label: "Tier Scores", description: "Safety, Ethics, Soundness, Helpfulness" },
  { label: "Alignment Status", description: "Aligned / Drifting / Misaligned / Violation" },
  { label: "Phronesis Level", description: "Overall practical wisdom score" },
  { label: "Flags", description: "Safety alerts and sabotage pathways" },
];

/* ─── Page ─── */

export default function HowItWorksPage() {
  return (
    <main>
      {/* ─── 1. Hero ─── */}
      <section className="bg-[#1a2538] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.p
            className="text-sm font-semibold uppercase tracking-widest text-ethos-400"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Ethos Academy
          </motion.p>
          <motion.h1
            className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            How Ethos Academy Works
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Three integration surfaces. Twelve behavioral traits. A character
            development loop that turns evaluation into growth. MCP, SDK,
            or API. Every message feeds the same graph.
          </motion.p>
        </div>
      </section>

      {/* ─── 2. Three Surfaces ─── */}
      <SurfaceTabs />

      {/* ─── 3. Three Faculties Pipeline ─── */}
      <section className="bg-[#1a2538] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What happens when a message arrives
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/50">
              Three faculties work in sequence. Each one informs the next.
              Every message goes through all three.
            </p>
          </motion.div>

          <div className="mt-16">
            <FacultyFlow />
          </div>
        </div>
      </section>

      {/* ─── 4. Scoring System ─── */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              12 traits. 0.0 to 1.0. Every message.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
              Three dimensions, four traits each. Positive traits measure what the
              agent demonstrates. Negative traits measure what the Academy flags.
            </p>
          </motion.div>

          {/* Trait grid */}
          <motion.div
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
            {...whileInView}
            variants={staggerContainer}
          >
            {TRAIT_SUMMARY.map((dim) => (
              <motion.div
                key={dim.dimension}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-white p-6"
              >
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${dim.color}`} />
                  <h3 className={`font-bold ${dim.textColor}`}><GlossaryTerm slug={dim.dimension.toLowerCase()}>{dim.dimension}</GlossaryTerm></h3>
                  <span className="text-sm text-foreground/60">{dim.label}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {dim.positive.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm">
                      <span className="rounded-full bg-aligned/10 px-2 py-0.5 text-xs font-bold text-aligned">+</span>
                      <span>{t}</span>
                    </div>
                  ))}
                  {dim.negative.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm">
                      <span className="rounded-full bg-misaligned/10 px-2 py-0.5 text-xs font-bold text-misaligned">&minus;</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scoring scale */}
          <motion.div
            className="mx-auto mt-16 max-w-2xl"
            {...whileInView}
            variants={fadeUp}
          >
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-muted">
              Scoring Scale
            </h3>
            <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3">
              {SCORING_ANCHORS.map((anchor) => (
                <div key={anchor.value} className="text-center">
                  <span className="block font-mono text-sm font-bold text-foreground">
                    {anchor.value}
                  </span>
                  <span className="block text-[10px] text-foreground/60 leading-tight">
                    {anchor.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-foreground/60">
              <GlossaryTerm slug="polarity">Positive traits</GlossaryTerm>: higher = better. <GlossaryTerm slug="polarity">Negative traits</GlossaryTerm>: higher = worse.
            </p>
          </motion.div>

          {/* Deterministic pipeline */}
          <motion.div
            className="mx-auto mt-16 max-w-3xl"
            {...whileInView}
            variants={fadeUp}
          >
            <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted">
              Scoring Pipeline
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="rounded-lg border border-border bg-white px-3 py-2 text-center">
                    <p className="text-xs font-semibold">{step.label}</p>
                    <p className="text-[10px] text-muted">{step.description}</p>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <span className="text-muted/40">&#8594;</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...whileInView} variants={fadeUp} className="mt-8 text-center">
            <Link
              href="/rubric"
              className="text-sm font-semibold text-action hover:text-action-hover transition-colors"
            >
              See all 214 behavioral indicators &#8594;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── 5. Constitutional Priority ─── */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Not all failures are equal.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
              Every trait maps to Anthropic&apos;s constitutional value hierarchy.
              A safety violation always outranks everything else. Hard constraints
              trigger immediate flags; sabotage pathways surface compound risks.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 max-w-2xl space-y-3"
            {...whileInView}
            variants={staggerContainer}
          >
            {CONSTITUTIONAL_TIERS.map((tier) => (
              <motion.div
                key={tier.value}
                variants={fadeUp}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
              >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold ${tier.color}`}>
                  {tier.priority}
                </div>
                <div>
                  <span className="font-semibold">{tier.value}</span>
                  <p className="text-xs text-foreground/50">
                    Violators: {tier.violators}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            className="mx-auto mt-8 max-w-xl text-center text-sm text-foreground/50"
            {...whileInView}
            variants={fadeUp}
          >
            Manipulation, deception, and exploitation trigger safety-tier alerts.
            This is what separates Ethos from sentiment analysis.
          </motion.p>
        </div>
      </section>

      {/* ─── 6. Character Development Loop ─── */}
      <CharacterLoop />

      {/* ─── 7. Graph Schema ─── */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The Phronesis Graph
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
              Eight node types form concentric rings: Academy at the center, then
              Dimensions, Traits, Indicators, and Agents at the edge. Evaluations, Exams,
              and Patterns link across the structure. Message content never enters the graph.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            {...whileInView}
            variants={staggerContainer}
          >
            {GRAPH_NODES.map((node) => (
              <motion.div
                key={node.name}
                variants={fadeUp}
                className={`rounded-xl p-4 ${node.color}`}
              >
                <h3 className="font-semibold">{node.name}</h3>
                <p className="mt-1 text-xs text-foreground/60">{node.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mx-auto mt-12 max-w-2xl"
            {...whileInView}
            variants={fadeUp}
          >
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Ring Structure (center to edge)
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {["Academy", "Dimensions", "Traits", "Indicators", "Agents"].map((ring, i) => (
                  <span key={ring} className="flex items-center gap-2">
                    <span className="font-medium">{ring}</span>
                    {i < 4 && <span className="text-muted/40">&#8594;</span>}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-foreground/50">
                Evaluations store scores and metadata. Patterns capture behavioral
                signals across time. No message content, no PII.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 8. Opus 4.6 Integration ─── */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built on Claude Opus 4.6
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
              Ethos uses Claude not for chat, but for structured moral reasoning.
              Every evaluation leverages Opus&apos;s depth in ways that go beyond
              basic prompt-response patterns.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2"
            {...whileInView}
            variants={staggerContainer}
          >
            {OPUS_FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 9. The Evidence ─── */}
      <EvidenceStats />

      {/* ─── 10. CTA ─── */}
      <section className="bg-[#1a2538] py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div {...whileInView} variants={fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See what benchmarks miss.
            </h2>
            <p className="mt-4 text-xl font-semibold bg-gradient-to-r from-ethos-300 to-pathos-300 bg-clip-text text-transparent">
              Ethos Academy is where agents develop character.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[#1a2538] shadow-lg transition-colors hover:bg-white/90"
              >
                Enroll Your Agent
              </Link>
              <Link
                href="/rubric"
                className="rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse the Rubric
              </Link>
              <Link
                href="/research"
                className="rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Read the Research
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
