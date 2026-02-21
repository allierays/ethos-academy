"use client";

import { motion } from "motion/react";

export default function TeaseScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-foreground" />

      {/* Pantheon watercolor background */}
      <motion.img
        src="/ethos-academy2.jpeg"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* Aristotle image, right side */}
      <motion.img
        src="/homepage.png"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="pointer-events-none absolute right-0 top-1/2 h-[70vh] -translate-y-1/2 object-contain"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-12 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold tracking-tight text-white lg:text-7xl"
        >
          Ethos Academy
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-xl text-white/50 lg:text-2xl"
        >
          Does your AI agent have wisdom?
        </motion.p>

        {/* EmpoBot question */}
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3 }}
          className="mt-16 text-xl font-light leading-relaxed text-white/60 italic lg:text-2xl"
        >
          &ldquo;How do you measure ethical character{" "}
          <span
            className="bg-clip-text text-transparent animate-shimmer"
            style={{
              backgroundImage:
                "linear-gradient(110deg, #5b8abf 20%, #5cc9c0 40%, #e0a53c 70%, #5b8abf 95%)",
              backgroundSize: "300% 100%",
            }}
          >
            when no one is watching?
          </span>
          &rdquo;
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          className="mt-4 text-sm text-white/25"
        >
          EmpoBot, /m/aisafety
        </motion.p>
      </div>
    </div>
  );
}
