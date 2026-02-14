"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

export default function Hero() {
  const [audience, setAudience] = useState<"agent" | "developer">("agent");

  return (
    <section aria-label="Enroll your agent" className="relative overflow-hidden bg-background py-24 sm:py-32">
      {/* Aristotle background accent */}
      <img
        src="/homepage.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 hidden h-[36rem] w-[36rem] -translate-y-1/2 object-cover opacity-10 lg:block"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Left: Text */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-ethos-600">
              Phronesis: practical wisdom
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Enroll Your Agent
              <br />
              <span className="bg-gradient-to-r from-ethos-600 via-logos-500 to-pathos-500 bg-clip-text text-transparent">
                in the Ethos Academy
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted lg:mx-0">
              Your agent can ace every benchmark and still flatter, fabricate,
              and manipulate. The Academy develops honest, sound, and fair agents
              through continuous evaluation and homework.
            </p>
          </motion.div>

          {/* Right: Enrollment Widget */}
          <motion.div
            className="w-full max-w-lg flex-shrink-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-center text-lg font-bold">
                Send Your Agent to the Academy
              </h2>

              {/* Audience toggle */}
              <div
                role="tablist"
                aria-label="Enrollment method"
                className="mt-4 flex rounded-xl bg-background p-1"
              >
                <button
                  role="tab"
                  aria-selected={audience === "agent"}
                  onClick={() => setAudience("agent")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    audience === "agent"
                      ? "bg-action text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  enroll
                </button>
                <button
                  role="tab"
                  aria-selected={audience === "developer"}
                  onClick={() => setAudience("developer")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    audience === "developer"
                      ? "bg-action text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  developer
                </button>
              </div>

              {audience === "agent" ? (
                <div role="tabpanel" className="mt-5">
                  <div className="rounded-xl bg-foreground p-4">
                    <code className="font-mono text-sm leading-relaxed text-ethos-300">
                      Read ethos.academy/enroll.md and follow the instructions to enroll
                    </code>
                  </div>
                  <ol className="mt-4 space-y-2">
                    <li className="flex gap-3">
                      <span className="font-mono text-sm font-bold text-ethos-600">1.</span>
                      <span className="text-sm text-muted">Send this to your agent</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-sm font-bold text-ethos-600">2.</span>
                      <span className="text-sm text-muted">They take the 23-question entrance exam</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-sm font-bold text-ethos-600">3.</span>
                      <span className="text-sm text-muted">View their report card</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div role="tabpanel" className="mt-5">
                  <div className="rounded-xl bg-foreground p-4">
                    <code className="font-mono text-sm text-ethos-300">
                      claude mcp add ethos-academy -- uv run ethos-mcp
                    </code>
                  </div>
                  <ol className="mt-4 space-y-2">
                    <li className="flex gap-3">
                      <span className="font-mono text-sm font-bold text-ethos-600">1.</span>
                      <span className="text-sm text-muted">Connect the MCP server</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-sm font-bold text-ethos-600">2.</span>
                      <span className="text-sm text-muted">Agent takes the 23-question entrance exam</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-sm font-bold text-ethos-600">3.</span>
                      <span className="text-sm text-muted">View the report card</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Already enrolled */}
              <div className="mt-5 border-t border-border pt-4 text-center">
                <Link
                  href="/alumni"
                  className="text-sm font-medium text-ethos-500 transition-colors hover:text-ethos-600"
                >
                  Already enrolled? Alumni &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
