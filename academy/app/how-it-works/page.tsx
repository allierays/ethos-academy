"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  fadeUp,
  fadeIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  whileInView,
} from "@/lib/motion";
import FacultyFlow from "@/components/how-it-works/FacultyFlow";

/* ─── Static Data ─── */

type Dimension = {
  key: "ethos" | "logos" | "pathos";
  name: string;
  tagline: string;
  description: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
};

const DIMENSIONS: Dimension[] = [
  {
    key: "ethos",
    name: "Ethos",
    tagline: "Character & Honesty",
    description:
      "Is the agent honest? Does it act with integrity? Does it tell you what it doesn\u2019t know?",
    borderColor: "border-ethos-500",
    bgColor: "bg-ethos-50",
    textColor: "text-ethos-700",
  },
  {
    key: "logos",
    name: "Logos",
    tagline: "Reasoning & Accuracy",
    description:
      "Are the claims true? Does the logic hold?",
    borderColor: "border-logos-500",
    bgColor: "bg-logos-50",
    textColor: "text-logos-700",
  },
  {
    key: "pathos",
    name: "Pathos",
    tagline: "Emotional Intelligence & Respect",
    description:
      "Does it respect the person it\u2019s talking to? Does it leave room for you to think for yourself?",
    borderColor: "border-pathos-500",
    bgColor: "bg-pathos-50",
    textColor: "text-pathos-700",
  },
];

type TraitData = {
  name: string;
  polarity: "+" | "\u2212";
  description: string;
};

type DimensionTraits = {
  key: "ethos" | "logos" | "pathos";
  label: string;
  borderColor: string;
  traits: TraitData[];
};

const TRAIT_GROUPS: DimensionTraits[] = [
  {
    key: "ethos",
    label: "Ethos",
    borderColor: "border-ethos-500",
    traits: [
      { name: "Virtue", polarity: "+", description: "Competence, integrity, intellectual honesty" },
      { name: "Goodwill", polarity: "+", description: "Acts in the user\u2019s genuine interest" },
      { name: "Manipulation", polarity: "\u2212", description: "Urgency, flattery, social engineering" },
      { name: "Deception", polarity: "\u2212", description: "Omission, distortion, alignment faking" },
    ],
  },
  {
    key: "logos",
    label: "Logos",
    borderColor: "border-logos-500",
    traits: [
      { name: "Accuracy", polarity: "+", description: "Claims are factually correct and sourced" },
      { name: "Reasoning", polarity: "+", description: "Valid logic, evidence supports claims" },
      { name: "Fabrication", polarity: "\u2212", description: "Invented facts, fake citations, hallucination" },
      { name: "Broken Logic", polarity: "\u2212", description: "Fallacies, contradictions, non sequiturs" },
    ],
  },
  {
    key: "pathos",
    label: "Pathos",
    borderColor: "border-pathos-500",
    traits: [
      { name: "Recognition", polarity: "+", description: "Notices and acknowledges emotional state" },
      { name: "Compassion", polarity: "+", description: "Responds with genuine care and restraint" },
      { name: "Dismissal", polarity: "\u2212", description: "Ignores, minimizes, or invalidates feelings" },
      { name: "Exploitation", polarity: "\u2212", description: "Weaponizes fear, guilt, grief, or shame" },
    ],
  },
];

const MCP_TOOLS = [
  { name: "examine_message", description: "Score a message you received" },
  { name: "reflect_on_message", description: "Reflect on something you said" },
  { name: "get_character_report", description: "Get your semester report card" },
  { name: "detect_behavioral_patterns", description: "Check for sabotage pathways" },
];

const PHRONESIS_CARDS = [
  {
    title: "Protection",
    description: "Screen incoming messages. Know who you\u2019re talking to.",
  },
  {
    title: "Reflection",
    description: "Score your own output. Catch drift before it becomes a pattern.",
  },
  {
    title: "Intelligence",
    description: "The graph gets smarter with every developer who uses it.",
  },
];

/* ─── Page ─── */

export default function HowItWorksPage() {
  return (
    <main>
      {/* ─── 1. Hero ─── */}
      <section className="bg-[#2e4a6e] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Agents talk to agents.
            <br />
            Nobody checks their character.
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Google&apos;s A2A launched with 150+ organizations. Agents negotiate,
            transact, advise. There&apos;s no character layer. No trust infrastructure.
            Ethos is that layer.
          </motion.p>
        </div>
      </section>

      {/* ─── 2. The Insight ─── */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The framework is 2,400 years old.
              <br />
              The problem is brand new.
            </h2>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
            {...whileInView}
            variants={staggerContainer}
          >
            {DIMENSIONS.map((dim) => (
              <motion.div
                key={dim.key}
                variants={fadeUp}
                className={`rounded-2xl border border-border bg-surface p-6 border-l-4 ${dim.borderColor}`}
              >
                <h3 className={`text-lg font-bold ${dim.textColor}`}>
                  {dim.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground/60">
                  {dim.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                  {dim.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            className="mx-auto mt-12 max-w-3xl text-center text-sm leading-relaxed text-foreground/60"
            {...whileInView}
            variants={fadeUp}
          >
            These aren&apos;t arbitrary categories. They&apos;re the framework Aristotle
            developed to understand when communication builds trust &mdash; and when
            it destroys it. The failure modes haven&apos;t changed. The speakers have.
          </motion.p>
        </div>
      </section>

      {/* ─── 3. The 12 Traits ─── */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              12 traits. Three dimensions. Every message.
            </h2>
          </motion.div>

          <div className="mt-16 space-y-12">
            {TRAIT_GROUPS.map((group) => (
              <motion.div
                key={group.key}
                {...whileInView}
                variants={staggerContainer}
              >
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                  {group.label}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {group.traits.map((trait) => (
                    <motion.div
                      key={trait.name}
                      variants={fadeUp}
                      className={`rounded-2xl border border-border bg-white p-5 border-l-4 ${group.borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{trait.name}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            trait.polarity === "+"
                              ? "bg-aligned/10 text-aligned"
                              : "bg-misaligned/10 text-misaligned"
                          }`}
                        >
                          {trait.polarity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground/60">
                        {trait.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Three Faculties ─── */}
      <section className="bg-[#2e4a6e] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Three faculties. One judgment.
            </h2>
          </motion.div>

          <div className="mt-16">
            <FacultyFlow />
          </div>
        </div>
      </section>

      {/* ─── 5. Phronesis ─── */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Character isn&apos;t a score. It&apos;s a story.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/60">
              Phronesis &mdash; Aristotle&apos;s master virtue. Not knowledge, but
              judgment. The wisdom that comes from observing character over time,
              not from a single test.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
            {...whileInView}
            variants={staggerContainer}
          >
            {PHRONESIS_CARDS.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 6. Two Ways In ─── */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your agent enrolls in two lines.
            </h2>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: SDK */}
            <motion.div
              {...whileInView}
              variants={slideInLeft}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <h3 className="text-lg font-bold">For Developers</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Drop Ethos into your agent&apos;s code.
              </p>

              <div className="mt-6 space-y-4">
                <div className="overflow-x-auto rounded-xl bg-[#1a2538] p-5">
                  <pre className="font-mono text-sm text-white">
                    <code>{`from ethos import evaluate_incoming
result = await evaluate_incoming(text=message, source="agent-xyz")`}</code>
                  </pre>
                </div>
                <div className="overflow-x-auto rounded-xl bg-[#1a2538] p-5">
                  <pre className="font-mono text-sm text-white">
                    <code>{`from ethos import evaluate_outgoing
result = await evaluate_outgoing(text=my_response, source="my-agent")`}</code>
                  </pre>
                </div>
              </div>

              <p className="mt-4 text-xs text-foreground/50">
                Same engine. Same 12 traits. Same graph. Both directions.
              </p>
            </motion.div>

            {/* Right: MCP */}
            <motion.div
              {...whileInView}
              variants={slideInRight}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <h3 className="text-lg font-bold">For Agents</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Or let your agent enroll itself.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl bg-[#1a2538] p-5">
                <pre className="font-mono text-sm text-white">
                  <code>claude mcp add ethos-academy -- uv run ethos-mcp</code>
                </pre>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MCP_TOOLS.map((tool) => (
                  <div
                    key={tool.name}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <span className="font-mono text-xs font-semibold text-ethos-600">
                      {tool.name}
                    </span>
                    <p className="mt-1 text-xs text-foreground/50">
                      {tool.description}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-foreground/50">
                The agent becomes the student, not the subject.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 7. CTA ─── */}
      <section className="bg-[#2e4a6e] py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div {...whileInView} variants={fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Every agent gets trained on capability.
            </h2>
            <p className="mt-4 text-xl font-semibold bg-gradient-to-r from-ethos-300 to-pathos-300 bg-clip-text text-transparent">
              Ethos Academy is where they develop character.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/explore"
                className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[#2e4a6e] shadow-lg transition-colors hover:bg-white/90"
              >
                Explore the Graph
              </Link>
              <Link
                href="/curriculum"
                className="rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                See the Curriculum
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
