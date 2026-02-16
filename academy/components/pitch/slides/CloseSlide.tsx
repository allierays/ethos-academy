"use client";

import { motion } from "motion/react";
import Image from "next/image";

export default function CloseSlide() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/ethos-academy-big.jpeg')",
          backgroundPosition: "center 50%",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(26,37,56,0.8) 0%, rgba(26,37,56,0.5) 50%, rgba(26,37,56,0.3) 80%)",
        }}
      />

      {/* Aristotle bust floating */}
      <motion.div
        className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20 lg:opacity-30"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/homepage3.png"
          alt=""
          width={300}
          height={400}
          className="pointer-events-none select-none"
          aria-hidden="true"
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-start gap-8 px-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-bold leading-tight text-white lg:text-6xl"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}
        >
          Better agents.
          <br />
          Better data.
          <br />
          Better alignment.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="rounded-xl border border-white/15 bg-white/[0.08] px-8 py-6 backdrop-blur-md"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}
        >
          <div className="flex flex-col gap-3">
            <a
              href="https://github.com/allierays/ethos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-lg text-white/80 transition-colors hover:text-white"
            >
              <GitHubIcon />
              <span>github.com/allierays/ethos</span>
            </a>
            <a
              href="http://localhost:3000"
              className="flex items-center gap-3 text-lg text-white/80 transition-colors hover:text-white"
            >
              <GlobeIcon />
              <span>Live Demo</span>
            </a>
            <a
              href="http://localhost:8917/docs"
              className="flex items-center gap-3 text-lg text-white/80 transition-colors hover:text-white"
            >
              <ApiIcon />
              <span>API Docs</span>
            </a>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-mono text-sm text-white/40"
        >
          Character takes practice.
        </motion.p>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </svg>
  );
}
