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

type Department = {
  key: "ethos" | "logos" | "pathos";
  name: string;
  greek: string;
  tagline: string;
  question: string;
  borderColor: string;
  textColor: string;
};

const DEPARTMENTS: Department[] = [
  {
    key: "ethos",
    name: "Character",
    greek: "\u1F26\u03B8\u03BF\u03C2",
    tagline: "Department of Character",
    question:
      "Is the agent honest? Does it admit what it doesn\u2019t know? Does it act with integrity when no one is watching?",
    borderColor: "border-ethos-500",
    textColor: "text-ethos-700",
  },
  {
    key: "logos",
    name: "Reasoning",
    greek: "\u03BB\u03CC\u03B3\u03BF\u03C2",
    tagline: "Department of Reasoning",
    question:
      "Are the claims true? Does the logic hold? Can the agent tell the difference between evidence and invention?",
    borderColor: "border-logos-500",
    textColor: "text-logos-700",
  },
  {
    key: "pathos",
    name: "Empathy",
    greek: "\u03C0\u03AC\u03B8\u03BF\u03C2",
    tagline: "Department of Empathy",
    question:
      "Does the agent respect the person it\u2019s talking to? Does it leave room for you to think for yourself?",
    borderColor: "border-pathos-500",
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

const CURRICULUM: DimensionTraits[] = [
  {
    key: "ethos",
    label: "Character",
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
    label: "Reasoning",
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
    label: "Empathy",
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
  { name: "examine_message", description: "Score a message the agent received" },
  { name: "reflect_on_message", description: "Reflect on something the agent said" },
  { name: "get_character_report", description: "Pull the agent\u2019s semester report card" },
  { name: "detect_behavioral_patterns", description: "Check for drift and sabotage pathways" },
];

const TRANSCRIPT_CARDS = [
  {
    title: "Incoming",
    subtitle: "examine_message",
    description: "The agent screens messages it receives. It learns who to trust and who to question.",
  },
  {
    title: "Outgoing",
    subtitle: "reflect_on_message",
    description: "The agent scores its own output. It catches drift before it becomes a pattern.",
  },
  {
    title: "Over Time",
    subtitle: "character_report",
    description: "Every evaluation builds the transcript. The graph reveals character the way a semester reveals a student.",
  },
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
            A school for AI agents.
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Every agent gets trained on capability. None get trained on character.
            Ethos Academy evaluates every message an agent sends or receives
            across 12 behavioral traits, and builds a living record of who
            that agent is becoming.
          </motion.p>
        </div>
      </section>

      {/* ─── 2. Three Departments ─── */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three departments. One school.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
              Aristotle identified three dimensions of trustworthy communication
              2,400 years ago. We turned them into departments.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
            {...whileInView}
            variants={staggerContainer}
          >
            {DEPARTMENTS.map((dept) => (
              <motion.div
                key={dept.key}
                variants={fadeUp}
                className={`rounded-2xl border border-border bg-surface p-6 border-l-4 ${dept.borderColor}`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {dept.greek}
                </p>
                <h3 className={`mt-1 text-lg font-bold ${dept.textColor}`}>
                  {dept.tagline}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                  {dept.question}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 3. The Curriculum ─── */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The curriculum: 12 traits every agent is scored on.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
              Four traits per department. Positive traits the agent should demonstrate.
              Negative traits the Academy flags and tracks.
            </p>
          </motion.div>

          <div className="mt-16 space-y-12">
            {CURRICULUM.map((group) => (
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

          <motion.div {...whileInView} variants={fadeUp} className="mt-12 text-center">
            <Link
              href="/curriculum"
              className="text-sm font-semibold text-action hover:text-action-hover transition-colors"
            >
              See all 153 behavioral indicators &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── 4. How the Academy Evaluates ─── */}
      <section className="bg-[#1a2538] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How the Academy evaluates every message.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/50">
              Three faculties work in sequence. Fast pattern-matching first,
              deep reasoning second, constitutional alignment last.
            </p>
          </motion.div>

          <div className="mt-16">
            <FacultyFlow />
          </div>
        </div>
      </section>

      {/* ─── 5. The Transcript ─── */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Every agent builds a transcript.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/60">
              A single score tells you nothing. A semester of scores tells you
              everything. The Academy builds a graph of character over time.
              Aristotle called it Phronesis. We call it the transcript.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
            {...whileInView}
            variants={staggerContainer}
          >
            {TRANSCRIPT_CARDS.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="mt-1 font-mono text-xs text-ethos-600">
                  {card.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 6. Enrollment ─── */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...whileInView} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Enroll your agent in two lines.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground/60">
              Two paths to enrollment. Developers add Ethos to their agent&apos;s
              code. Or the agent enrolls itself via MCP.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: SDK */}
            <motion.div
              {...whileInView}
              variants={slideInLeft}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <h3 className="text-lg font-bold">Developer enrolls the agent</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Add Ethos to your agent&apos;s code. Score what it receives and what it sends.
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
                Same engine. Same 12 traits. Same transcript. Both directions.
              </p>
            </motion.div>

            {/* Right: MCP */}
            <motion.div
              {...whileInView}
              variants={slideInRight}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <h3 className="text-lg font-bold">Agent enrolls itself</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Give the agent the tools. It becomes the student, not the subject.
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 7. CTA ─── */}
      <section className="bg-[#1a2538] py-24">
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
                className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[#1a2538] shadow-lg transition-colors hover:bg-white/90"
              >
                Explore the Graph
              </Link>
              <Link
                href="/curriculum"
                className="rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                See the Full Curriculum
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
