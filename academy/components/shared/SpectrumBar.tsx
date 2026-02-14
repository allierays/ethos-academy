"use client";

import { spectrumLabel, spectrumColor } from "../../lib/colors";

interface SpectrumBarProps {
  score: number;
  label?: string;
  size?: "sm" | "md";
}

const LABELS = ["Alarming", "Concerning", "Uncertain", "Developing", "Sound", "Exemplary"];

export default function SpectrumBar({ score, label, size = "md" }: SpectrumBarProps) {
  const pct = Math.round(score * 100);
  const markerLeft = Math.max(0, Math.min(100, pct));
  const color = spectrumColor(score);
  const displayLabel = label ?? spectrumLabel(score);
  const isSm = size === "sm";

  return (
    <div className={isSm ? "space-y-0.5" : "space-y-1"}>
      <div className="flex items-center justify-between">
        <span
          className={`font-semibold ${isSm ? "text-[11px]" : "text-xs"}`}
          style={{ color }}
        >
          {displayLabel}
        </span>
        <span className={`tabular-nums text-muted ${isSm ? "text-[10px]" : "text-xs"}`}>
          {pct}%
        </span>
      </div>
      <div className="relative">
        {/* Muted gray track */}
        <div
          className={`rounded-full bg-muted/15 ${isSm ? "h-1.5" : "h-2.5"}`}
        />
        {/* Colored fill up to score */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${isSm ? "h-1.5" : "h-2.5"}`}
          style={{ width: `${markerLeft}%`, backgroundColor: color, opacity: 0.7 }}
        />
        {/* Marker dot */}
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${
            isSm ? "h-3 w-3" : "h-4 w-4"
          }`}
          style={{ left: `${markerLeft}%`, backgroundColor: color }}
        />
      </div>
      {!isSm && (
        <div className="flex justify-between px-0.5">
          {LABELS.map((l) => (
            <span
              key={l}
              className={`text-[9px] text-muted/60 ${
                l === displayLabel ? "font-semibold text-muted" : ""
              }`}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
