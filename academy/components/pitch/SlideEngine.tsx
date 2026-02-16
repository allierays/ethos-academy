"use client";

import {
  type ReactNode,
  Children,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { useRouter } from "next/navigation";

/**
 * Lazy-mounts children when the user scrolls near this scene.
 * Uses manual scroll tracking instead of IntersectionObserver
 * because IO doesn't reliably detect elements inside fixed + overflow-y-auto containers.
 */
function Scene({
  children,
  index,
  containerRef,
}: {
  children: ReactNode;
  index: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function check() {
      if (!container) return;
      const viewH = container.clientHeight;
      const scrollTop = container.scrollTop;
      const sceneTop = index * viewH;
      const sceneBottom = sceneTop + viewH;
      // Mount when the scene is within 20% buffer of the visible viewport
      const buffer = viewH * 0.2;
      if (
        sceneBottom > scrollTop - buffer &&
        sceneTop < scrollTop + viewH + buffer
      ) {
        setMounted(true);
      }
    }

    check(); // Check immediately (scene 0 should mount on load)
    if (!mounted) {
      container.addEventListener("scroll", check, { passive: true });
      return () => container.removeEventListener("scroll", check);
    }
  }, [containerRef, index, mounted]);

  return mounted ? <>{children}</> : <div className="h-screen" />;
}

interface SlideEngineProps {
  children: ReactNode[];
}

export default function SlideEngine({ children }: SlideEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Escape key returns home
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        router.push("/");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  // Hide scroll hint after first meaningful scroll
  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (el && el.scrollTop > 80) setShowScrollHint(false);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const slides = Children.toArray(children);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-foreground">
      {/* Video-style progress bar */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left"
        style={{
          scaleX,
          background:
            "linear-gradient(90deg, var(--ethos-500), var(--logos-500), var(--pathos-500))",
        }}
      />

      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="fixed left-6 top-5 z-40 flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/40 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white/70"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Home
      </button>

      {/* Scenes */}
      {slides.map((slide, i) => (
        <Scene key={i} index={i} containerRef={containerRef}>
          {slide}
        </Scene>
      ))}

      {/* Scroll hint on first scene */}
      <motion.div
        className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollHint ? 1 : 0 }}
        transition={{ duration: 0.4, delay: showScrollHint ? 2 : 0 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          Scroll
        </span>
        <motion.svg
          className="h-4 w-4 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7"
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}
