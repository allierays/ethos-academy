"use client";

import { useMemo, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { buildAnnotatedSegments } from "../../lib/annotate";
import type { IndicatorLike } from "../../lib/annotate";
import type { IntentClassification } from "../../lib/types";
import { DIMENSION_COLORS } from "../../lib/colors";
import IndicatorSidebar from "./IndicatorSidebar";

/* ─── Props ─── */

interface AnnotatedMessageProps {
  content: string;
  indicators: IndicatorLike[];
  scoringReasoning?: string;
  intentClassification?: IntentClassification | null;
}

/* ─── Component ─── */

export default function AnnotatedMessage({
  content,
  indicators,
  scoringReasoning,
  intentClassification,
}: AnnotatedMessageProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorLike | null>(null);

  const segments = useMemo(
    () => buildAnnotatedSegments(content, indicators),
    [content, indicators],
  );

  const handleClick = useCallback(
    (indicator: IndicatorLike) => {
      setSelectedIndicator((prev) =>
        prev === indicator ? null : indicator,
      );
    },
    [],
  );

  const handleClose = useCallback(() => {
    setSelectedIndicator(null);
  }, []);

  return (
    <>
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap bg-white/70 rounded-lg p-4">
        {segments.map((seg, i) => {
          if (seg.type === "plain") {
            return <span key={i}>{seg.text}</span>;
          }

          const dimColor = DIMENSION_COLORS[seg.dimension] ?? DIMENSION_COLORS.ethos;
          const isActive = selectedIndicator === seg.indicator;

          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(seg.indicator)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(seg.indicator);
                }
              }}
              className={`cursor-pointer border-b-2 transition-colors duration-150 ${
                isActive ? "rounded-sm" : ""
              }`}
              style={{
                borderBottomColor: dimColor,
                backgroundColor: isActive
                  ? `${dimColor}18`
                  : undefined,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${dimColor}14`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                }
              }}
              title={`${seg.indicator.name?.replace(/_/g, " ")} (click for details)`}
            >
              {seg.text}
            </span>
          );
        })}
      </p>

      <AnimatePresence>
        {selectedIndicator && (
          <IndicatorSidebar
            key={selectedIndicator.name}
            indicator={selectedIndicator}
            scoringReasoning={scoringReasoning}
            intentClassification={intentClassification}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
