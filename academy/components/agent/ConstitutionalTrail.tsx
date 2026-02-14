"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getTrail } from "../../lib/api";
import { DIMENSION_COLORS } from "../../lib/colors";
import type { ConstitutionalTrailResult, ConstitutionalTrailItem } from "../../lib/types";
import GraphHelpButton from "../shared/GraphHelpButton";
import GlossaryTerm from "../shared/GlossaryTerm";

/* ─── Trait-to-dimension mapping ─── */

const TRAIT_DIM: Record<string, string> = {
  virtue: "ethos", goodwill: "ethos", manipulation: "ethos", deception: "ethos",
  accuracy: "logos", reasoning: "logos", fabrication: "logos", broken_logic: "logos",
  recognition: "pathos", compassion: "pathos", dismissal: "pathos", exploitation: "pathos",
};

function dimColor(trait: string): string {
  const dim = TRAIT_DIM[trait.toLowerCase()] ?? "ethos";
  return DIMENSION_COLORS[dim] ?? DIMENSION_COLORS.ethos;
}

/* ─── Priority badge colors ─── */

function priorityBadge(p: number): string {
  if (p <= 1) return "bg-misaligned/10 text-misaligned";
  if (p <= 2) return "bg-drifting/10 text-drifting";
  return "bg-aligned/10 text-aligned";
}

/* ─── Helpers ─── */

interface TrailNode {
  id: string;
  label: string;
  column: "indicator" | "trait" | "value";
  dimension?: string;
  polarity?: string;
  priority?: number;
  evalCount?: number;
  confidence?: number;
  evidence?: string[];
  impact?: string;
}

interface TrailLink {
  from: string;
  to: string;
  evalCount: number;
  confidence: number;
}

function buildGraph(items: ConstitutionalTrailItem[]) {
  const nodes = new Map<string, TrailNode>();
  const links: TrailLink[] = [];

  for (const item of items) {
    const indId = `ind-${item.indicatorId}`;
    const traitId = `trait-${item.trait}`;
    const cvId = `cv-${item.constitutionalValue}`;

    if (!nodes.has(indId)) {
      nodes.set(indId, {
        id: indId,
        label: item.indicatorName.replace(/_/g, " "),
        column: "indicator",
        dimension: TRAIT_DIM[item.trait.toLowerCase()],
        evalCount: item.evalCount,
        confidence: item.avgConfidence,
        evidence: item.sampleEvidence,
      });
    }

    if (!nodes.has(traitId)) {
      nodes.set(traitId, {
        id: traitId,
        label: item.trait.replace(/_/g, " "),
        column: "trait",
        dimension: TRAIT_DIM[item.trait.toLowerCase()],
        polarity: item.traitPolarity,
      });
    }

    if (!nodes.has(cvId)) {
      nodes.set(cvId, {
        id: cvId,
        label: item.constitutionalValue,
        column: "value",
        priority: item.cvPriority,
        impact: item.impact,
      });
    }

    links.push({ from: indId, to: traitId, evalCount: item.evalCount, confidence: item.avgConfidence });
    links.push({ from: traitId, to: cvId, evalCount: item.evalCount, confidence: item.avgConfidence });
  }

  return { nodes: Array.from(nodes.values()), links };
}

/* ─── SVG Flow Visualization ─── */

function TrailFlow({ items }: { items: ConstitutionalTrailItem[] }) {
  const { nodes, links } = buildGraph(items);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const columns = {
    indicator: nodes.filter((n) => n.column === "indicator"),
    trait: nodes.filter((n) => n.column === "trait"),
    value: nodes.filter((n) => n.column === "value"),
  };

  // Layout constants
  const colX = { indicator: 80, trait: 320, value: 560 };
  const nodeH = 32;
  const gap = 8;

  // Compute Y positions per column
  const positions = new Map<string, { x: number; y: number }>();

  for (const [col, colNodes] of Object.entries(columns) as [keyof typeof colX, TrailNode[]][]) {
    const totalH = colNodes.length * (nodeH + gap) - gap;
    const startY = Math.max(20, (Math.max(columns.indicator.length, columns.trait.length, columns.value.length) * (nodeH + gap)) / 2 - totalH / 2);
    colNodes.forEach((node, i) => {
      positions.set(node.id, { x: colX[col], y: startY + i * (nodeH + gap) });
    });
  }

  const svgH = Math.max(
    ...Array.from(positions.values()).map((p) => p.y + nodeH + 20),
    200
  );

  // Highlight connected nodes on hover
  const connectedIds = new Set<string>();
  if (hoveredNode) {
    connectedIds.add(hoveredNode);
    for (const link of links) {
      if (link.from === hoveredNode || link.to === hoveredNode) {
        connectedIds.add(link.from);
        connectedIds.add(link.to);
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      {/* Column headers */}
      <div className="flex items-center gap-0 mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50 px-1">
        <span style={{ width: 200, marginLeft: 0 }}>Indicators</span>
        <span style={{ width: 200, marginLeft: 60 }}>Traits</span>
        <span style={{ width: 200, marginLeft: 60 }}>Constitutional Values</span>
      </div>

      <svg width={680} height={svgH} className="w-full max-w-[680px]">
        {/* Links */}
        {links.map((link, i) => {
          const from = positions.get(link.from);
          const to = positions.get(link.to);
          if (!from || !to) return null;

          const fromNode = nodes.find((n) => n.id === link.from);
          const opacity = hoveredNode
            ? connectedIds.has(link.from) && connectedIds.has(link.to)
              ? 0.6
              : 0.06
            : 0.2;

          const color = fromNode?.dimension
            ? DIMENSION_COLORS[fromNode.dimension] ?? "#94a3b8"
            : "#94a3b8";

          return (
            <line
              key={`link-${i}`}
              x1={from.x + 160}
              y1={from.y + nodeH / 2}
              x2={to.x}
              y2={to.y + nodeH / 2}
              stroke={color}
              strokeWidth={Math.max(1, Math.min(3, link.evalCount * 0.5))}
              strokeOpacity={opacity}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;

          const isActive = !hoveredNode || connectedIds.has(node.id);
          const opacity = isActive ? 1 : 0.2;

          let fill: string;
          if (node.column === "value") {
            fill = node.priority && node.priority <= 1 ? "#ef4444" : node.priority && node.priority <= 2 ? "#d97706" : "#10b981";
          } else if (node.column === "trait") {
            fill = dimColor(node.label);
          } else {
            fill = node.dimension ? DIMENSION_COLORS[node.dimension] ?? "#94a3b8" : "#94a3b8";
          }

          return (
            <g
              key={node.id}
              opacity={opacity}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <rect
                x={pos.x}
                y={pos.y}
                width={160}
                height={nodeH}
                rx={6}
                fill={fill}
                fillOpacity={0.1}
                stroke={fill}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
              <text
                x={pos.x + 8}
                y={pos.y + nodeH / 2 + 1}
                dominantBaseline="middle"
                className="text-[11px] fill-foreground"
                style={{ fontFamily: "inherit" }}
              >
                {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
              </text>
              {node.column === "value" && node.priority !== undefined && (
                <text
                  x={pos.x + 148}
                  y={pos.y + nodeH / 2 + 1}
                  dominantBaseline="middle"
                  textAnchor="end"
                  className="text-[9px]"
                  fill={fill}
                  fontWeight={600}
                >
                  P{node.priority}
                </text>
              )}
              {node.column === "indicator" && node.evalCount !== undefined && (
                <text
                  x={pos.x + 148}
                  y={pos.y + nodeH / 2 + 1}
                  dominantBaseline="middle"
                  textAnchor="end"
                  className="text-[9px]"
                  fill={fill}
                  fontWeight={500}
                >
                  {node.evalCount}x
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Detail Card ─── */

function TrailDetail({ item }: { item: ConstitutionalTrailItem }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-white/50 p-3">
      <div
        className="mt-0.5 h-2 w-2 rounded-full shrink-0"
        style={{ background: dimColor(item.trait) }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{item.indicatorName.replace(/_/g, " ")}</span>
          <span className="text-[10px] text-muted">{item.trait}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityBadge(item.cvPriority)}`}>
            P{item.cvPriority} {item.constitutionalValue}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted">
          <span>{item.evalCount} evaluation{item.evalCount !== 1 ? "s" : ""}</span>
          <span>{(item.avgConfidence * 100).toFixed(0)}% confidence</span>
          {item.impact && <span className="italic">{item.impact}</span>}
        </div>
        {item.sampleEvidence.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {item.sampleEvidence.map((ev, i) => (
              <p key={i} className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                &ldquo;{ev}&rdquo;
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

interface ConstitutionalTrailProps {
  agentId: string;
  agentName?: string;
}

export default function ConstitutionalTrail({ agentId, agentName }: ConstitutionalTrailProps) {
  const name = agentName ?? "this agent";
  const [data, setData] = useState<ConstitutionalTrailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTrail(agentId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [agentId]);

  if (loading) {
    return (
      <div className="rounded-xl glass-strong p-6">
        <div className="flex h-32 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-teal" />
        </div>
      </div>
    );
  }

  if (!data || data.items.length === 0) return null;

  // Group by constitutional value for summary stats
  const valueMap = new Map<string, { priority: number; count: number; traits: Set<string> }>();
  for (const item of data.items) {
    const existing = valueMap.get(item.constitutionalValue);
    if (existing) {
      existing.count += item.evalCount;
      existing.traits.add(item.trait);
    } else {
      valueMap.set(item.constitutionalValue, {
        priority: item.cvPriority,
        count: item.evalCount,
        traits: new Set([item.trait]),
      });
    }
  }

  const sortedValues = Array.from(valueMap.entries()).sort(
    ([, a], [, b]) => a.priority - b.priority
  );

  const highPriorityCount = sortedValues.filter(([, v]) => v.priority <= 1).length;

  return (
    <div className="rounded-xl glass-strong p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold uppercase tracking-wider text-[#1a2538]">
            <GlossaryTerm slug="constitutional-value">Constitutional</GlossaryTerm> Value Trail
          </h2>
          <p className="mt-0.5 text-sm text-foreground/60">
            Five-hop graph traversal: {name}&apos;s indicators through traits to constitutional values.
            {highPriorityCount > 0 && (
              <span className="ml-1 text-misaligned font-medium">
                {highPriorityCount} priority-1 value{highPriorityCount !== 1 ? "s" : ""} affected.
              </span>
            )}
          </p>
        </div>
        <GraphHelpButton slug="guide-constitutional-trail" />
      </div>

      {/* Why this matters callout */}
      <div className="rounded-lg bg-ethos-50/50 border border-ethos-200/30 px-4 py-3">
        <p className="text-xs text-foreground/60 leading-relaxed">
          <span className="font-semibold text-foreground/80">Graph-only insight:</span>{" "}
          This traces 5 typed relationships across 5 node types. A vector database stores flat documents
          and cannot answer &ldquo;which constitutional values are at risk?&rdquo; without following the full chain.
        </p>
      </div>

      {/* Flow visualization */}
      <TrailFlow items={data.items} />

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {sortedValues.map(([cv, info]) => (
          <span
            key={cv}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${priorityBadge(info.priority)}`}
          >
            P{info.priority} {cv}
            <span className="opacity-60">{info.count}x across {info.traits.size} trait{info.traits.size !== 1 ? "s" : ""}</span>
          </span>
        ))}
      </div>

      {/* Expandable detail list */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-action hover:underline"
      >
        {expanded ? "Hide" : "Show"} detail ({data.items.length} paths)
      </button>

      {expanded && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {data.items.slice(0, 20).map((item, i) => (
            <TrailDetail key={i} item={item} />
          ))}
          {data.items.length > 20 && (
            <p className="text-xs text-muted text-center">
              Showing 20 of {data.items.length} paths.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
