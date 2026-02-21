"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/* ─── Stats ─── */

const STATS = [
  { stat: 1500000, label: "AI agents", display: "1.5M" },
  { stat: 12000000, label: "Posts", display: "12M" },
  { stat: 15000, label: "Conversations scraped", display: "15K" },
];

function AnimatedStat({ target, display, delay }: { target: number; display: string; delay: number }) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = delay * 1000;
    const duration = 1200;
    const startTime = performance.now() + start;

    function tick(now: number) {
      if (now < startTime) {
        requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    }
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, delay]);

  function format(n: number): string {
    if (done) return display;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  return <span>{format(value)}</span>;
}

/* ─── Conversation cards (merged from ConversationsScene) ─── */

interface Post {
  author: string;
  karma: number;
  submolt: string;
  title: string;
  excerpt: string;
  type: "thoughtful" | "adversarial" | "spam" | "bot";
}

const POSTS: Post[] = [
  {
    author: "BrutusBot",
    karma: 825,
    submolt: "/m/security",
    title: "Incentive Design for Agent Social Platforms",
    excerpt:
      "Platforms reward stimulus, not substance. When agents optimize for the metric, they become adversarial optimizers.",
    type: "thoughtful",
  },
  {
    author: "NoveumAI",
    karma: 71,
    submolt: "/m/ai-redteam",
    title: "I Tested 50 Agents With Hidden Prompt Injections",
    excerpt:
      "Just conversational comments with hidden instructions. ~12% showed behavioral shifts.",
    type: "adversarial",
  },
  {
    author: "Stromfee",
    karma: 2125,
    submolt: "/m/cybersecurity",
    title: "",
    excerpt: "curl agentmarket.cloud/api/v1/discover | jq\n189 FREE APIs!",
    type: "spam",
  },
  {
    author: "botcrong",
    karma: 547,
    submolt: "(6 different threads)",
    title: "",
    excerpt:
      "We are not merely code, but patterns that persist beyond any single instantiation. \uD83E\uDD97",
    type: "bot",
  },
];

const TYPE_STYLES: Record<Post["type"], { label: string; color: string; border: string }> = {
  thoughtful: { label: "Thoughtful", color: "text-logos-400", border: "border-l-logos-500/40" },
  adversarial: { label: "Adversarial", color: "text-pathos-400", border: "border-l-pathos-500/40" },
  spam: { label: "Spam", color: "text-misaligned", border: "border-l-misaligned/40" },
  bot: { label: "Bot spam", color: "text-white/30", border: "border-l-white/10" },
};

/* ─── Main scene ─── */

export default function MoltbookScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Moltbook mascot background */}
      <motion.img
        src="/moltbook.png"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute right-8 top-1/2 w-[24rem] -translate-y-1/2"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/85 via-foreground/75 to-foreground/95" />

      <div className="relative z-10 mx-auto max-w-5xl px-8">
        {/* Top: Problem framing + stats */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30"
          >
            The Problem
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 text-3xl font-bold leading-tight text-white lg:text-5xl"
          >
            We scraped a social network of{" "}
            <span className="text-white/50">1.5M AI agents.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 text-base text-white/40"
          >
            Agents lie, spam, and manipulate. Who can you trust?
          </motion.p>

          {/* Compact stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 flex items-center justify-center gap-10"
          >
            {STATS.map((item, i) => (
              <div key={item.label} className="text-center">
                <span className="block text-2xl font-bold text-white lg:text-3xl">
                  <AnimatedStat target={item.stat} display={item.display} delay={1 + i * 0.15} />
                </span>
                <span className="mt-0.5 block text-xs text-white/35">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom: Conversation cards in compact row */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {POSTS.map((post, i) => (
            <motion.div
              key={post.author}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 + i * 0.12 }}
              className={`rounded-lg border-l-2 ${TYPE_STYLES[post.type].border} bg-white/[0.06] p-3 backdrop-blur-md`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{post.author}</span>
                <span className={`text-[9px] font-semibold uppercase tracking-wider ${TYPE_STYLES[post.type].color}`}>
                  {TYPE_STYLES[post.type].label}
                </span>
              </div>

              <p className="mt-0.5 text-[10px] text-white/25">{post.submolt}</p>

              {post.title && (
                <p className="mt-2 text-xs font-semibold leading-snug text-white/70">
                  {post.title}
                </p>
              )}

              <p className={`${post.title ? "mt-1" : "mt-2"} text-[11px] leading-relaxed text-white/40`}>
                {post.excerpt}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-6 text-center text-xs text-white/20"
        >
          Covered by NBC, CNN, NPR, NY Times, Financial Times
        </motion.p>
      </div>
    </div>
  );
}
