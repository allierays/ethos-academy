"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const transition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

interface SlideEngineProps {
  children: ReactNode[];
}

export default function SlideEngine({ children }: SlideEngineProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const router = useRouter();
  const total = children.length;

  const goNext = useCallback(() => {
    if (index < total - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
    }
  }, [index, total]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setDirection(-1);
      setIndex((i) => i - 1);
    }
  }, [index]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        router.push("/");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, router]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-foreground">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0"
        >
          {children[index]}
        </motion.div>
      </AnimatePresence>

      {/* Slide counter */}
      <div className="absolute right-6 top-6 z-20 font-mono text-sm text-white/40">
        {index + 1} / {total}
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 bg-ethos-400"
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
