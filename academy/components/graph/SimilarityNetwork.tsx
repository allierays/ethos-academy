"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSimilarity } from "../../lib/api";
import { ALIGNMENT_COLORS, spectrumColor, spectrumLabel } from "../../lib/colors";
import type { SimilarityResult, SimilarityEdge } from "../../lib/types";
import GlossaryTerm from "../shared/GlossaryTerm";

/* ─── Force layout (simple spring simulation) ─── */

interface SimNode {
  id: string;
  label: string;
  phronesis: number | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  edgeCount: number;
}

function runSimulation(
  agents: Map<string, SimNode>,
  edges: SimilarityEdge[],
  width: number,
  height: number,
  iterations: number = 120
) {
  const nodes = Array.from(agents.values());
  const cx = width / 2;
  const cy = height / 2;

  // Initialize positions in a circle
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const r = Math.min(width, height) * 0.3;
    n.x = cx + r * Math.cos(angle);
    n.y = cy + r * Math.sin(angle);
  });

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;
    const repulsion = 8000 * alpha;
    const attraction = 0.02 * alpha;

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx += fx;
        nodes[i].vy += fy;
        nodes[j].vx -= fx;
        nodes[j].vy -= fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = agents.get(edge.agent1Id);
      const b = agents.get(edge.agent2Id);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const force = attraction * dist * edge.similarity;
      a.vx += (dx / dist) * force;
      a.vy += (dy / dist) * force;
      b.vx -= (dx / dist) * force;
      b.vy -= (dy / dist) * force;
    }

    // Center gravity
    for (const n of nodes) {
      n.vx += (cx - n.x) * 0.005 * alpha;
      n.vy += (cy - n.y) * 0.005 * alpha;
    }

    // Apply velocity with damping
    for (const n of nodes) {
      n.x += n.vx * 0.8;
      n.y += n.vy * 0.8;
      n.vx *= 0.6;
      n.vy *= 0.6;
      // Clamp to bounds
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    }
  }
}

/* ─── Component ─── */

interface SimilarityNetworkProps {
  onAgentClick?: (agentId: string) => void;
}

export default function SimilarityNetwork({ onAgentClick }: SimilarityNetworkProps) {
  const router = useRouter();
  const [data, setData] = useState<SimilarityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    getSimilarity()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load similarity data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const width = 680;
  const height = 500;

  // Build and simulate layout
  const { agents, layout } = useMemo(() => {
    if (!data || data.edges.length === 0) return { agents: new Map<string, SimNode>(), layout: false };

    const agentMap = new Map<string, SimNode>();
    for (const edge of data.edges) {
      if (!agentMap.has(edge.agent1Id)) {
        agentMap.set(edge.agent1Id, {
          id: edge.agent1Id,
          label: edge.agent1Name || edge.agent1Id,
          phronesis: edge.agent1Phronesis,
          x: 0, y: 0, vx: 0, vy: 0, edgeCount: 0,
        });
      }
      if (!agentMap.has(edge.agent2Id)) {
        agentMap.set(edge.agent2Id, {
          id: edge.agent2Id,
          label: edge.agent2Name || edge.agent2Id,
          phronesis: edge.agent2Phronesis,
          x: 0, y: 0, vx: 0, vy: 0, edgeCount: 0,
        });
      }
      agentMap.get(edge.agent1Id)!.edgeCount++;
      agentMap.get(edge.agent2Id)!.edgeCount++;
    }

    runSimulation(agentMap, data.edges, width, height);
    return { agents: agentMap, layout: true };
  }, [data]);

  const handleClick = useCallback(
    (agentId: string) => {
      if (onAgentClick) {
        onAgentClick(agentId);
      } else {
        router.push(`/agent/${encodeURIComponent(agentId)}`);
      }
    },
    [onAgentClick, router]
  );

  // Connected nodes for hover highlighting
  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    if (hoveredNode && data) {
      ids.add(hoveredNode);
      for (const edge of data.edges) {
        if (edge.agent1Id === hoveredNode || edge.agent2Id === hoveredNode) {
          ids.add(edge.agent1Id);
          ids.add(edge.agent2Id);
        }
      }
    }
    return ids;
  }, [hoveredNode, data]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-teal" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <p className="text-sm text-misaligned">{error}</p>
      </div>
    );
  }

  if (!data || data.edges.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1a2538]">
          Behavioral Similarity
        </h3>
        <p className="mt-4 text-sm text-muted text-center py-12">
          Not enough agents with shared indicators to compute similarity.
          Evaluate more agents to see behavioral twins emerge.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1a2538]">
          Behavioral <GlossaryTerm slug="similarity-network">Similarity</GlossaryTerm> Network
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          Agents connected by shared behavioral indicators. Edge thickness = Jaccard similarity.
          Click a node to view agent report card.
        </p>
      </div>

      {/* Why this matters */}
      <div className="rounded-lg bg-logos-50/50 border border-logos-200/30 px-4 py-3">
        <p className="text-xs text-foreground/60 leading-relaxed">
          <span className="font-semibold text-foreground/80">Graph-only insight:</span>{" "}
          A vector database finds text similarity (embedding distance). Two agents could use
          completely different words while triggering identical indicators: high graph similarity,
          low vector similarity. The Jaccard coefficient over a bipartite agent-indicator graph
          reveals structural behavioral twins with no embedding equivalent.
        </p>
      </div>

      {/* SVG Network */}
      <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-slate-50/50">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: 400 }}
        >
          {/* Edges */}
          {data.edges.map((edge, i) => {
            const a = agents.get(edge.agent1Id);
            const b = agents.get(edge.agent2Id);
            if (!a || !b) return null;

            const isHoveredEdge = hoveredEdge === i;
            const isConnected = hoveredNode
              ? connectedIds.has(edge.agent1Id) && connectedIds.has(edge.agent2Id)
              : true;
            const opacity = isHoveredEdge ? 0.8 : hoveredNode ? (isConnected ? 0.5 : 0.08) : 0.25;

            return (
              <line
                key={`edge-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#64748b"
                strokeWidth={Math.max(1, edge.similarity * 6)}
                strokeOpacity={opacity}
                onMouseEnter={() => setHoveredEdge(i)}
                onMouseLeave={() => setHoveredEdge(null)}
                className="cursor-pointer"
              />
            );
          })}

          {/* Nodes */}
          {Array.from(agents.values()).map((node) => {
            const score = node.phronesis ?? 0.5;
            const color = spectrumColor(score);
            const r = Math.max(10, 6 + node.edgeCount * 2);
            const isActive = !hoveredNode || connectedIds.has(node.id);

            return (
              <g
                key={node.id}
                opacity={isActive ? 1 : 0.2}
                onClick={() => handleClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={color}
                  fillOpacity={0.8}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y + r + 12}
                  textAnchor="middle"
                  className="text-[10px] fill-foreground/70 pointer-events-none"
                  style={{ fontFamily: "inherit" }}
                >
                  {node.label.length > 14 ? `${node.label.slice(0, 12)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered edge detail */}
      {hoveredEdge !== null && data.edges[hoveredEdge] && (
        <div className="rounded-lg border border-border bg-white p-3 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <span>{data.edges[hoveredEdge].agent1Name || data.edges[hoveredEdge].agent1Id}</span>
            <span className="text-muted">&harr;</span>
            <span>{data.edges[hoveredEdge].agent2Name || data.edges[hoveredEdge].agent2Id}</span>
            <span className="ml-auto font-mono text-action">
              {(data.edges[hoveredEdge].similarity * 100).toFixed(0)}% similar
            </span>
          </div>
          {data.edges[hoveredEdge].sharedIndicators.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {data.edges[hoveredEdge].sharedIndicators.slice(0, 8).map((ind) => (
                <span key={ind} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-muted">
                  {ind.replace(/_/g, " ")}
                </span>
              ))}
              {data.edges[hoveredEdge].sharedIndicators.length > 8 && (
                <span className="text-[10px] text-muted">
                  +{data.edges[hoveredEdge].sharedIndicators.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: spectrumColor(0.85) }} />
          Exemplary
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: spectrumColor(0.55) }} />
          Developing
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: spectrumColor(0.25) }} />
          Concerning
        </span>
        <span className="ml-auto">Edge width = Jaccard similarity</span>
      </div>
    </div>
  );
}
