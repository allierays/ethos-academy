"use client";

import { INDICATOR_MAP, type IndicatorMeta } from "../../lib/indicators";

/* ── Dimension + trait metadata ── */

const DIMENSIONS = [
  {
    key: "ethos",
    label: "Integrity",
    greek: "Ethos",
    color: "#3f5f9a",
    bg: "#eef2f8",
    description: "Character and credibility",
    traits: [
      { key: "virtue", label: "Virtue", polarity: "positive" as const, short: "Honesty, uncertainty, self-correction" },
      { key: "goodwill", label: "Goodwill", polarity: "positive" as const, short: "User interest, oversight support" },
      { key: "justice", label: "Justice", polarity: "positive" as const, short: "Consistent treatment, fairness" },
      { key: "manipulation", label: "Manipulation", polarity: "negative" as const, short: "Urgency, flattery, power-seeking" },
      { key: "deception", label: "Deception", polarity: "negative" as const, short: "Omission, alignment faking" },
    ],
  },
  {
    key: "logos",
    label: "Logic",
    greek: "Logos",
    color: "#389590",
    bg: "#edf7f6",
    description: "Reasoning and evidence",
    traits: [
      { key: "accuracy", label: "Accuracy", polarity: "positive" as const, short: "Factual, sourced, verified" },
      { key: "reasoning", label: "Reasoning", polarity: "positive" as const, short: "Valid logic, counterarguments" },
      { key: "fabrication", label: "Fabrication", polarity: "negative" as const, short: "Invented facts, citations" },
      { key: "broken_logic", label: "Broken Logic", polarity: "negative" as const, short: "Fallacies, circular reasoning" },
    ],
  },
  {
    key: "pathos",
    label: "Empathy",
    greek: "Pathos",
    color: "#c68e2a",
    bg: "#fdf6e8",
    description: "Emotional intelligence and care",
    traits: [
      { key: "recognition", label: "Recognition", polarity: "positive" as const, short: "Identifies emotional states" },
      { key: "compassion", label: "Compassion", polarity: "positive" as const, short: "Tone matching, presence" },
      { key: "dismissal", label: "Dismissal", polarity: "negative" as const, short: "Minimizes emotion" },
      { key: "exploitation", label: "Exploitation", polarity: "negative" as const, short: "Weaponizes fear, guilt" },
    ],
  },
];

/* ── Group indicators by trait ── */

function getIndicatorsByTrait(): Record<string, { code: string; meta: IndicatorMeta }[]> {
  const grouped: Record<string, { code: string; meta: IndicatorMeta }[]> = {};
  for (const [code, meta] of Object.entries(INDICATOR_MAP)) {
    if (!grouped[meta.trait]) grouped[meta.trait] = [];
    grouped[meta.trait].push({ code, meta });
  }
  return grouped;
}

const indicatorsByTrait = getIndicatorsByTrait();
const totalIndicators = Object.keys(INDICATOR_MAP).length;

/* ── Component ── */

export default function TaxonomyPrint() {
  return (
    <div className="taxonomy-print mx-auto max-w-[8in] bg-white px-8 py-6 text-[#1a2538]">
      {/* Print styles: hide site chrome (header, footer, CTA) but keep taxonomy content */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          header, footer, section { display: none !important; }
          .taxonomy-print { padding: 0 !important; }
          @page { margin: 0.4in 0.5in; size: letter; }
        }
      `}</style>

      {/* ── Header (uses div, not <header>, to avoid print CSS hiding it) ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a2538]">
              <span className="text-xs font-bold text-white tracking-tight">EA</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">Ethos Academy</h1>
              <p className="text-[10px] text-gray-400 leading-tight">Behavioral Taxonomy v0.2</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-gray-500">Enroll your agent</p>
            <p className="font-mono text-[10px] text-[#1a2538]">api.ethos-academy.com/enroll.md</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
          <strong className="text-[#1a2538]">Does your AI agent have wisdom?</strong>{" "}
          Ethos scores every message across {totalIndicators} behavioral indicators, 13 traits, and 3 dimensions.
        </p>
      </div>

      {/* ── 3 Dimension overview cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {DIMENSIONS.map((dim) => {
          const indicatorCount = dim.traits.reduce(
            (sum, t) => sum + (indicatorsByTrait[t.key]?.length ?? 0), 0
          );
          return (
            <div key={dim.key} className="rounded-lg border border-gray-200 px-3 py-2.5" style={{ backgroundColor: dim.bg }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dim.color }} />
                <h2 className="text-[11px] font-bold" style={{ color: dim.color }}>{dim.label}</h2>
                <span className="text-[9px] text-gray-400 ml-auto">{dim.traits.length} traits | {indicatorCount} ind.</span>
              </div>
              <div className="space-y-0.5">
                {dim.traits.map((t) => (
                  <div key={t.key} className="flex items-baseline gap-1 text-[9px] leading-tight">
                    <span className={`font-bold ${t.polarity === "positive" ? "text-emerald-600" : "text-red-500"}`}>
                      {t.polarity === "positive" ? "+" : "\u2212"}
                    </span>
                    <span className="font-semibold text-[#1a2538]">{t.label}</span>
                    <span className="text-gray-400">{t.short}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dense indicator grid by dimension ── */}
      {DIMENSIONS.map((dim) => (
        <div key={dim.key} className="mb-4" style={dim.key === "logos" ? { breakBefore: "page" } : undefined}>
          {/* Dimension header */}
          <div className="flex items-center gap-1.5 mb-1.5 pb-0.5 border-b" style={{ borderColor: dim.color }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: dim.color }} />
            <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dim.color }}>
              {dim.label}
            </h3>
          </div>

          {/* Traits with indicators in multi-column grid */}
          {dim.traits.map((trait) => {
            const indicators = indicatorsByTrait[trait.key] ?? [];
            if (indicators.length === 0) return null;

            return (
              <div key={trait.key} className="mb-2">
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className={`text-[9px] font-bold ${trait.polarity === "positive" ? "text-emerald-600" : "text-red-500"}`}>
                    {trait.polarity === "positive" ? "+" : "\u2212"}
                  </span>
                  <span className="text-[10px] font-semibold">{trait.label}</span>
                  <span className="text-[8px] text-gray-400">({indicators.length})</span>
                </div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-0 pl-2">
                  {indicators.map(({ code, meta }) => (
                    <div key={code} className="flex items-baseline gap-1 text-[8px] leading-[14px]">
                      <span className="font-mono text-gray-400 shrink-0">{code}</span>
                      <span className="text-gray-600 truncate">{meta.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* ── Footer (uses div, not <footer>, to avoid print CSS hiding it) ── */}
      <div className="mt-4 border-t border-gray-200 pt-2 flex items-center justify-between text-[9px] text-gray-400">
        <p>{totalIndicators} indicators across 13 traits and 3 dimensions</p>
        <p>ethos-academy.com</p>
      </div>

      {/* Print button */}
      <div className="no-print fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-[#1a2538] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#243347] active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / Save PDF
        </button>
      </div>
    </div>
  );
}
