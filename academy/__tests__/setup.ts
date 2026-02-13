import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

/**
 * Mock motion/react: render motion.* as plain HTML elements.
 * AnimatePresence just passes children through.
 */
vi.mock("motion/react", () => {
  const handler: ProxyHandler<object> = {
    get(_target, tag: string) {
      return React.forwardRef(function MotionProxy(
        props: Record<string, unknown>,
        ref: React.Ref<unknown>
      ) {
        // Strip motion-specific props before passing to DOM element
        const {
          variants,
          initial,
          animate,
          exit,
          transition,
          whileInView,
          whileHover,
          whileTap,
          viewport,
          layout,
          layoutId,
          ...domProps
        } = props;
        return React.createElement(tag, { ...domProps, ref });
      });
    },
  };

  return {
    motion: new Proxy({}, handler),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

/**
 * Mock GlossaryContext: provide a no-op glossary so components
 * that use GlossaryTerm / GraphHelpButton render without a provider.
 */
vi.mock("@/lib/GlossaryContext", () => ({
  useGlossary: () => ({
    isOpen: false,
    selectedTerm: null,
    openGlossary: vi.fn(),
    closeGlossary: vi.fn(),
    selectTerm: vi.fn(),
  }),
  GlossaryProvider: ({ children }: { children: React.ReactNode }) => children,
}));
