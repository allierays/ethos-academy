"use client";

import { useState, useEffect, useRef, Children, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  children: ReactNode[];
  durations: number[]; // seconds per scene. 0 = stay forever.
}

export default function AutoPlayEngine({ children, durations }: Props) {
  const [current, setCurrent] = useState(0);
  const slides = Children.toArray(children);
  const total = slides.length;

  // Store durations in ref so they don't trigger re-renders
  const durRef = useRef(durations);
  durRef.current = durations;

  // Auto-advance timer
  useEffect(() => {
    const dur = durRef.current[current];
    if (!dur || dur <= 0) return;
    const timer = setTimeout(() => {
      setCurrent((c) => Math.min(c + 1, total - 1));
    }, dur * 1000);
    return () => clearTimeout(timer);
  }, [current, total]);

  // Keyboard nav: arrow keys for manual override
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrent((c) => Math.min(c + 1, total - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrent((c) => Math.max(c - 1, 0));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [total]);

  // Progress: fraction of total time elapsed
  const elapsed = durRef.current.slice(0, current).reduce((a, b) => a + b, 0);
  const totalTime = durRef.current.reduce((a, b) => a + b, 0);
  const progress = totalTime > 0 ? elapsed / totalTime : 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-foreground">
      {/* Progress bar */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left"
        style={{
          background:
            "linear-gradient(90deg, var(--ethos-500), var(--logos-500), var(--pathos-500))",
        }}
        animate={{ scaleX: progress }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Scene indicator dots */}
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-white/60"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Scene */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="h-full w-full"
        >
          {slides[current]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
