"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGraph } from "../../lib/api";
import {
  DIMENSION_COLORS,
  DIMENSION_LABELS,
  DIMENSION_RGB,
  TRAIT_DIMENSIONS,
  spectrumColor,
} from "../../lib/colors";
import type { GraphData, GraphNode as EthosGraphNode, GraphRel } from "../../lib/types";
import GraphHelpButton from "../shared/GraphHelpButton";

/* -------------------------------------------------------------------------- */
/*  NVL type interfaces                                                       */
/* -------------------------------------------------------------------------- */

interface NvlNode {
  id: string;
  color?: string;
  size?: number;
  caption?: string;
  captionColor?: string;
  pinned?: boolean;
  x?: number;
  y?: number;
}

interface NvlRelationship {
  id: string;
  from: string;
  to: string;
  color?: string;
  width?: number;
  caption?: string;
}

/* -------------------------------------------------------------------------- */
/*  Node styling                                                              */
/* -------------------------------------------------------------------------- */

function resolveDimension(node: EthosGraphNode): string | undefined {
  const dim = node.properties.dimension as string | undefined;
  if (dim && DIMENSION_COLORS[dim]) return dim;

  const trait = node.properties.trait as string | undefined;
  if (trait) {
    const traitDim = TRAIT_DIMENSIONS[trait];
    if (traitDim) return traitDim;
  }

  const labelDim = TRAIT_DIMENSIONS[node.label];
  if (labelDim) return labelDim;

  return undefined;
}

function getDimensionRgb(node: EthosGraphNode): string {
  const dim = resolveDimension(node);
  return dim ? (DIMENSION_RGB[dim] ?? "0,0,0") : "0,0,0";
}

function getDimensionColor(node: EthosGraphNode): string | undefined {
  const dim = resolveDimension(node);
  return dim ? DIMENSION_COLORS[dim] : undefined;
}

function getNodeColor(node: EthosGraphNode): string {
  switch (node.type) {
    case "academy":
      return "#394646";
    case "dimension":
      return DIMENSION_COLORS[node.label] ?? "#389590";
    case "trait":
      return getDimensionColor(node) ?? "#94a3b8";
    case "indicator":
      return getDimensionColor(node) ?? "#94a3b8";
    case "agent": {
      const score = node.properties.phronesisScore as number | undefined;
      if (score != null) return spectrumColor(score);
      return "#94a3b8";
    }
    default:
      return "#94a3b8";
  }
}

function getNodeSize(node: EthosGraphNode): number {
  switch (node.type) {
    case "academy":
      return 80;
    case "dimension":
      return 55;
    case "trait":
      return 28;
    case "indicator": {
      const raw = (node.properties.size as number) ?? 5;
      return Math.max(12, raw);
    }
    case "agent": {
      const count = (node.properties.indicatorCount as number) ?? 0;
      return Math.min(30, 14 + count * 0.4);
    }
    default:
      return 10;
  }
}

function getNodeCaption(node: EthosGraphNode): string {
  switch (node.type) {
    case "academy":
      return "Ethos Academy\nPhronesis";
    case "dimension":
      return DIMENSION_LABELS[node.label] ?? node.label;
    case "trait":
      return node.caption;
    case "indicator": {
      const detCount = (node.properties.detectionCount as number) ?? 0;
      if (detCount > 0) return `${node.caption} (${detCount})`;
      return node.caption;
    }
    case "agent":
      return node.caption;
    default:
      return node.label;
  }
}

function getCaptionColor(node: EthosGraphNode): string {
  if (node.type === "indicator") {
    const detCount = (node.properties.detectionCount as number) ?? 0;
    return detCount === 0 ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.7)";
  }
  if (node.type === "agent") return "rgba(0,0,0,0.65)";
  if (node.type === "academy") return "#ffffff";
  return "#394646";
}

/* -------------------------------------------------------------------------- */
/*  Transform API data → NVL format                                           */
/* -------------------------------------------------------------------------- */

function toNvlNodes(nodes: EthosGraphNode[]): NvlNode[] {
  return nodes.map((n) => {
    const nvlNode: NvlNode = {
      id: n.id,
      color: getNodeColor(n),
      size: getNodeSize(n),
      caption: getNodeCaption(n),
      captionColor: getCaptionColor(n),
    };
    // Pin the academy node at the origin so the force layout radiates from center
    if (n.type === "academy") {
      nvlNode.pinned = true;
      nvlNode.x = 0;
      nvlNode.y = 0;
    } else if (n.properties.pinned) {
      nvlNode.pinned = true;
      nvlNode.x = n.properties.x as number;
      nvlNode.y = n.properties.y as number;
    }
    return nvlNode;
  });
}

function toNvlRelationships(
  rels: GraphRel[],
  nodeIds: Set<string>,
  nodeMap: Map<string, EthosGraphNode>,
): NvlRelationship[] {
  return rels
    .filter((r) => nodeIds.has(r.fromId) && nodeIds.has(r.toId))
    .map((r) => {
      // Academy → Dimension: strong structural lines
      if (r.type === "HAS_DIMENSION") {
        const toNode = nodeMap.get(r.toId);
        const dim = toNode?.label;
        const rgb = dim ? (DIMENSION_RGB[dim] ?? "0,0,0") : "0,0,0";
        return {
          id: r.id, from: r.fromId, to: r.toId,
          color: `rgba(${rgb},0.6)`, width: 2,
        };
      }

      // Dimension → Trait: dimension-colored
      if (r.type === "BELONGS_TO") {
        const toNode = nodeMap.get(r.toId);
        const rgb = toNode ? getDimensionRgb(toNode) : "0,0,0";
        return {
          id: r.id, from: r.fromId, to: r.toId,
          color: `rgba(${rgb},0.35)`, width: 1.5,
        };
      }

      // Trait → Indicator: colored by dimension, brightness by detection count
      if (r.type === "INDICATES") {
        const weight = (r.properties.weight as number) ?? 0;
        const toNode = nodeMap.get(r.toId);
        const rgb = toNode ? getDimensionRgb(toNode) : "0,0,0";

        if (weight === 0) {
          return {
            id: r.id, from: r.fromId, to: r.toId,
            color: "rgba(0,0,0,0.04)", width: 0.2,
          };
        }
        const opacity = Math.min(0.5, 0.1 + (weight / 220) * 0.4);
        const width = Math.min(2, 0.3 + (weight / 220) * 1.7);
        return {
          id: r.id, from: r.fromId, to: r.toId,
          color: `rgba(${rgb},${opacity.toFixed(2)})`,
          width: Math.round(width * 10) / 10,
        };
      }

      // Agent → Indicator (TRIGGERED): neutral gray with weight-based opacity
      if (r.type === "TRIGGERED") {
        const weight = (r.properties.weight as number) ?? 1;
        const opacity = Math.min(0.45, 0.08 + (weight / 50) * 0.37);
        const width = Math.min(1.5, 0.3 + (weight / 50) * 1.2);
        return {
          id: r.id, from: r.fromId, to: r.toId,
          color: `rgba(57,70,70,${opacity.toFixed(2)})`,
          width: Math.round(width * 10) / 10,
        };
      }

      return {
        id: r.id, from: r.fromId, to: r.toId,
        color: "rgba(0,0,0,0.08)", width: 0.5,
      };
    });
}

/* -------------------------------------------------------------------------- */
/*  NVL controls ref                                                          */
/* -------------------------------------------------------------------------- */

export interface NvlControls {
  panBy: (dx: number, dy: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitAll: () => void;
  setPan: (x: number, y: number) => void;
  getPan: () => { x: number; y: number };
  fit: (nodeIds: string[]) => void;
  smoothFit: (nodeIds: string[], durationMs?: number, onDone?: () => void) => void;
  smoothFitAll: (durationMs?: number) => void;
  rotateBy: (angle: number) => void;
  getNodeScreenPos: (nodeId: string) => { x: number; y: number } | null;
  highlightNode: (nodeId: string) => void;
  unhighlightNode: (nodeId: string) => void;
  simulateClick?: (nodeId: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  Pan / zoom control buttons                                                */
/* -------------------------------------------------------------------------- */

const ARROW_BTN =
  "flex h-7 w-7 items-center justify-center rounded bg-white/80 text-gray-500 shadow-sm border border-gray-200 hover:bg-white hover:text-gray-700 transition-colors active:bg-gray-100";

function GraphControls({ controls }: { controls: NvlControls | null }) {
  const PAN_STEP = 120;
  if (!controls) return null;

  return (
    <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1 select-none z-10">
      {/* Directional pad */}
      <button type="button" className={ARROW_BTN} onClick={() => controls.panBy(0, PAN_STEP)} aria-label="Pan up" title="Pan up">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      </button>
      <div className="flex gap-1">
        <button type="button" className={ARROW_BTN} onClick={() => controls.panBy(PAN_STEP, 0)} aria-label="Pan left" title="Pan left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <button type="button" className={ARROW_BTN} onClick={() => controls.fitAll()} aria-label="Fit graph" title="Fit to view">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </button>
        <button type="button" className={ARROW_BTN} onClick={() => controls.panBy(-PAN_STEP, 0)} aria-label="Pan right" title="Pan right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
      <button type="button" className={ARROW_BTN} onClick={() => controls.panBy(0, -PAN_STEP)} aria-label="Pan down" title="Pan down">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </button>
      {/* Zoom buttons */}
      <div className="mt-1 flex gap-1">
        <button type="button" className={ARROW_BTN} onClick={() => controls.zoomIn()} aria-label="Zoom in" title="Zoom in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button type="button" className={ARROW_BTN} onClick={() => controls.zoomOut()} aria-label="Zoom out" title="Zoom out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Inner NVL component — only mounts after data + NVL are ready             */
/* -------------------------------------------------------------------------- */

interface NvlRendererProps {
  nodes: NvlNode[];
  rels: NvlRelationship[];
  onNodeClick?: (event: unknown, node: { id: string }) => void;
  onControlsReady?: (controls: NvlControls | null) => void;
}

function NvlRenderer({ nodes, rels, onNodeClick, onControlsReady }: NvlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nvlInstanceRef = useRef<unknown>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interactionsRef = useRef<any[]>([]);
  const onNodeClickRef = useRef(onNodeClick);
  onNodeClickRef.current = onNodeClick;
  const onControlsReadyRef = useRef(onControlsReady);
  onControlsReadyRef.current = onControlsReady;

  useEffect(() => {
    let destroyed = false;
    const container = containerRef.current;

    async function init() {
      if (!container) return;

      try {
        const [{ default: NVL }, handlers] = await Promise.all([
          import("@neo4j-nvl/base"),
          import("@neo4j-nvl/interaction-handlers"),
        ]);

        if (destroyed || !container) return;

        container.innerHTML = "";

        const nodeIds = nodes.map((n) => n.id);

        container.style.cursor = "grab";

        // Store initial viewport after layout for smoothFitAll
        let homePan = { x: 0, y: 0 };
        let homeZoom = 0.25;

        const nvl = new NVL(container, nodes, rels, {
          layout: "d3Force",
          renderer: "canvas",
          initialZoom: 0.25,
          minZoom: 0.05,
          maxZoom: 12,
          allowDynamicMinZoom: true,
          disableWebGL: true,
          callbacks: {
            onLayoutDone: () => {
              if (destroyed) return;
              nvl.fit(nodeIds);
              // Capture the "home" viewport after fit completes
              setTimeout(() => {
                try {
                  homePan = (nvl as any).getPan();
                  homeZoom = (nvl as any).getScale();
                } catch { /* ignore */ }
              }, 200);
            },
          },
        });

        nvlInstanceRef.current = nvl;

        // Track highlighted node for restore
        let highlightedId: string | null = null;
        let highlightedOriginal: { size?: number; color?: string } | null = null;

        // Expose controls for pan/zoom buttons
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nvlAny = nvl as any;
        onControlsReadyRef.current?.({
          panBy: (dx: number, dy: number) => {
            try {
              const pan = nvlAny.getPan();
              nvlAny.setPan(pan.x + dx, pan.y + dy);
            } catch { /* ignore */ }
          },
          zoomIn: () => {
            try {
              const scale = nvlAny.getScale();
              nvlAny.setZoom(scale * 1.4);
            } catch { /* ignore */ }
          },
          zoomOut: () => {
            try {
              const scale = nvlAny.getScale();
              nvlAny.setZoom(scale / 1.4);
            } catch { /* ignore */ }
          },
          fitAll: () => {
            try { nvlAny.fit(nodeIds); } catch { /* ignore */ }
          },
          setPan: (x: number, y: number) => {
            try { nvlAny.setPan(x, y); } catch { /* ignore */ }
          },
          getPan: () => {
            try { return nvlAny.getPan(); } catch { return { x: 0, y: 0 }; }
          },
          fit: (ids: string[]) => {
            try { nvlAny.fit(ids); } catch { /* ignore */ }
          },
          smoothFit: (ids: string[], durationMs = 1200, onDone?: () => void) => {
            try {
              const startPan = nvlAny.getPan();
              const startZoom = nvlAny.getScale();

              // Hide canvas while we sample NVL's fit target (prevents flash).
              const el = containerRef.current;
              if (el) el.style.opacity = "0";

              nvlAny.fit(ids);
              setTimeout(() => {
                const endPan = nvlAny.getPan();
                const endZoom = Math.min(nvlAny.getScale(), homeZoom * 6);

                // Restore start position and show canvas.
                nvlAny.setZoom(startZoom);
                nvlAny.setPan(startPan.x, startPan.y);
                if (el) el.style.opacity = "1";

                const startTime = performance.now();
                function step() {
                  const t = Math.min(1, (performance.now() - startTime) / durationMs);
                  const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                  const z = startZoom + (endZoom - startZoom) * ease;
                  const px = startPan.x + (endPan.x - startPan.x) * ease;
                  const py = startPan.y + (endPan.y - startPan.y) * ease;
                  nvlAny.setZoom(z); nvlAny.setPan(px, py);
                  if (t < 1) {
                    requestAnimationFrame(step);
                  } else {
                    onDone?.();
                  }
                }
                requestAnimationFrame(step);
              }, 50);
            } catch { /* ignore */ }
          },
          smoothFitAll: (durationMs = 1200) => {
            try {
              const startPan = nvlAny.getPan();
              const startZoom = nvlAny.getScale();
              const startTime = performance.now();
              function step() {
                const t = Math.min(1, (performance.now() - startTime) / durationMs);
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                const z = startZoom + (homeZoom - startZoom) * ease;
                const px = startPan.x + (homePan.x - startPan.x) * ease;
                const py = startPan.y + (homePan.y - startPan.y) * ease;
                nvlAny.setZoom(z); nvlAny.setPan(px, py);
                if (t < 1) requestAnimationFrame(step);
              }
              requestAnimationFrame(step);
            } catch { /* ignore */ }
          },
          rotateBy: (angle: number) => {
            try {
              const current = nvlAny.getNodes();
              if (!current || current.length === 0) return;
              // Find the academy node as rotation center
              const center = current.find((n: NvlNode) => n.id === "academy");
              const cx = center?.x ?? 0;
              const cy = center?.y ?? 0;
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              const updated = current
                .filter((n: NvlNode) => n.id !== "academy" && n.x != null && n.y != null)
                .map((n: NvlNode) => {
                  const dx = n.x! - cx;
                  const dy = n.y! - cy;
                  return {
                    id: n.id,
                    x: cx + dx * cos - dy * sin,
                    y: cy + dx * sin + dy * cos,
                  };
                });
              nvlAny.updateElementsInGraph(updated, []);
            } catch { /* ignore */ }
          },
          getNodeScreenPos: (nodeId: string) => {
            try {
              const allNodes = nvlAny.getNodes();
              const node = allNodes.find((n: NvlNode) => n.id === nodeId);
              if (!node || node.x == null || node.y == null) return null;
              const pan = nvlAny.getPan();
              const zoom = nvlAny.getScale();
              return {
                x: node.x * zoom + pan.x,
                y: node.y * zoom + pan.y,
              };
            } catch { return null; }
          },
          highlightNode: (nodeId: string) => {
            try {
              // Unhighlight previous node first
              if (highlightedId && highlightedOriginal) {
                nvlAny.updateElementsInGraph(
                  [{ id: highlightedId, size: highlightedOriginal.size, color: highlightedOriginal.color }],
                  []
                );
              }
              const allNodes = nvlAny.getNodes();
              const node = allNodes.find((n: NvlNode) => n.id === nodeId);
              if (!node) return;
              highlightedId = nodeId;
              highlightedOriginal = { size: node.size, color: node.color };
              // Make the node larger and bright white with a ring effect
              nvlAny.updateElementsInGraph(
                [{ id: nodeId, size: (node.size || 20) * 1.6, color: "#3b82f6" }],
                []
              );
            } catch { /* ignore */ }
          },
          unhighlightNode: (nodeId: string) => {
            try {
              if (highlightedId === nodeId && highlightedOriginal) {
                nvlAny.updateElementsInGraph(
                  [{ id: nodeId, size: highlightedOriginal.size, color: highlightedOriginal.color }],
                  []
                );
                highlightedId = null;
                highlightedOriginal = null;
              }
            } catch { /* ignore */ }
          },
        });

        const zoom = new handlers.ZoomInteraction(nvl);
        const pan = new handlers.PanInteraction(nvl);
        const click = new handlers.ClickInteraction(nvl);
        const hover = new handlers.HoverInteraction(nvl);

        click.updateCallback("onNodeClick", (node: { id: string }) => {
          onNodeClickRef.current?.(null, node);
        });

        hover.updateCallback("onHover", (element: unknown) => {
          container.style.cursor = element ? "pointer" : "grab";
        });

        interactionsRef.current = [zoom, pan, click, hover];

        setTimeout(() => {
          if (!destroyed && nvlInstanceRef.current) nvl.fit(nodeIds);
        }, 2500);

      } catch (err) {
        console.error("[Phronesis] NVL initialization failed:", err);
      }
    }

    init();

    return () => {
      destroyed = true;
      onControlsReadyRef.current?.(null);
      for (const handler of interactionsRef.current) {
        try { handler.destroy(); } catch { /* ignore */ }
      }
      interactionsRef.current = [];
      if (nvlInstanceRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (nvlInstanceRef.current as any).destroy();
        } catch { /* ignore */ }
        nvlInstanceRef.current = null;
      }
      if (container) container.innerHTML = "";
    };
  }, [nodes, rels]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Legend                                                                     */
/* -------------------------------------------------------------------------- */

function GraphLegend({ stats }: {
  stats: { indicators: number; detected: number; detections: number; agents: number };
}) {
  return (
    <div className="absolute bottom-3 left-3 rounded-lg bg-white/80 px-3 py-2.5 text-xs text-gray-700 shadow-sm backdrop-blur-sm border border-gray-200">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Dimensions</span>
          <div className="flex gap-3">
            {Object.entries(DIMENSION_COLORS).map(([key, color]) => (
              <span key={key} className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                {DIMENSION_LABELS[key]}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Agent Score</span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#4a5a65" }} />
              Exemplary
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#8a857a" }} />
              Developing
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#904848" }} />
              Concerning
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Indicator Size = Detection Frequency</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
              Never
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
              Some
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-gray-600" />
              Frequent
            </span>
            <span className="ml-2 text-gray-400">
              {stats.detected}/{stats.indicators} detected | {stats.detections} total
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export interface ConnectedAgentInfo {
  name: string;
  agentId: string;
  count: number;
}

export interface TraitIndicatorInfo {
  code: string;
  name: string;
  detectionCount: number;
}

export interface DimensionTraitInfo {
  name: string;
  caption: string;
  polarity: string;
  indicatorCount: number;
}

export interface NodeClickContext {
  connectedAgents?: ConnectedAgentInfo[];
  indicatorName?: string;
  dimension?: string;
  trait?: string;
  polarity?: string;
  traitIndicators?: TraitIndicatorInfo[];
  dimensionTraits?: DimensionTraitInfo[];
  dimensionLabel?: string;
}

interface PhronesisGraphProps {
  onNodeClick?: (nodeId: string, nodeType: string, nodeLabel: string, context?: NodeClickContext) => void;
  className?: string;
  onControlsReady?: (controls: NvlControls | null) => void;
  onGraphReady?: (info: { agentNodeIds: string[]; allShowcaseNodes: { id: string; type: string; label: string }[] }) => void;
}

const DEFAULT_HEIGHT = "h-[350px] sm:h-[450px] md:h-[600px]";

export default function PhronesisGraph({ onNodeClick, className, onControlsReady: onControlsReadyProp, onGraphReady }: PhronesisGraphProps) {
  const heightClass = className ?? DEFAULT_HEIGHT;
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nvlControls, setNvlControls] = useState<NvlControls | null>(null);

  // Ref to expose handleNodeClick to controls (set after handleNodeClick is created)
  const handleNodeClickRef = useRef<((_: unknown, node: { id: string }) => void) | null>(null);

  const handleControlsReady = useCallback((c: NvlControls | null) => {
    if (c) {
      c.simulateClick = (nodeId: string) => {
        handleNodeClickRef.current?.(null, { id: nodeId });
      };
    }
    setNvlControls(c);
    onControlsReadyProp?.(c);
  }, [onControlsReadyProp]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getGraph();
        if (!cancelled) setGraphData(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load graph");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleNodeClick = useCallback(
    (_: unknown, node: { id: string }) => {
      if (!onNodeClick || !graphData) return;
      const ethosNode = graphData.nodes.find((n) => n.id === node.id);
      if (!ethosNode) return;

      if (ethosNode.type === "indicator") {
        const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
        const agentCounts = new Map<string, { name: string; agentId: string; count: number }>();

        for (const rel of graphData.relationships) {
          if (rel.type === "TRIGGERED" && rel.toId === ethosNode.id) {
            const agentNode = nodeMap.get(rel.fromId);
            if (agentNode && agentNode.type === "agent") {
              const agentId = rel.fromId.replace(/^agent-/, "");
              const existing = agentCounts.get(agentId);
              const weight = (rel.properties.weight as number) ?? 1;
              if (existing) {
                existing.count += weight;
              } else {
                agentCounts.set(agentId, {
                  name: agentNode.caption,
                  agentId,
                  count: weight,
                });
              }
            }
          }
        }

        const connectedAgents = Array.from(agentCounts.values()).sort((a, b) => b.count - a.count);
        onNodeClick(ethosNode.id, ethosNode.type, ethosNode.label, {
          connectedAgents,
          indicatorName: ethosNode.caption,
          dimension: ethosNode.properties.dimension as string | undefined,
          trait: ethosNode.properties.trait as string | undefined,
          polarity: ethosNode.properties.polarity as string | undefined,
        });
        return;
      }

      if (ethosNode.type === "trait") {
        const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
        const traitIndicators: TraitIndicatorInfo[] = [];
        const indicatorIds = new Set<string>();

        for (const rel of graphData.relationships) {
          if (rel.type === "INDICATES" && rel.fromId === ethosNode.id) {
            const indNode = nodeMap.get(rel.toId);
            if (indNode) {
              indicatorIds.add(rel.toId);
              traitIndicators.push({
                code: rel.toId.replace(/^ind-/, ""),
                name: indNode.caption,
                detectionCount: (indNode.properties.detectionCount as number) ?? 0,
              });
            }
          }
        }
        traitIndicators.sort((a, b) => b.detectionCount - a.detectionCount);

        const agentCounts = new Map<string, ConnectedAgentInfo>();
        for (const rel of graphData.relationships) {
          if (rel.type === "TRIGGERED" && indicatorIds.has(rel.toId)) {
            const agentNode = nodeMap.get(rel.fromId);
            if (agentNode && agentNode.type === "agent") {
              const agentId = rel.fromId.replace(/^agent-/, "");
              const weight = (rel.properties.weight as number) ?? 1;
              const existing = agentCounts.get(agentId);
              if (existing) {
                existing.count += weight;
              } else {
                agentCounts.set(agentId, { name: agentNode.caption, agentId, count: weight });
              }
            }
          }
        }

        onNodeClick(ethosNode.id, ethosNode.type, ethosNode.label, {
          trait: ethosNode.label,
          indicatorName: ethosNode.caption,
          dimension: ethosNode.properties.dimension as string | undefined,
          polarity: ethosNode.properties.polarity as string | undefined,
          traitIndicators,
          connectedAgents: Array.from(agentCounts.values()).sort((a, b) => b.count - a.count),
        });
        return;
      }

      if (ethosNode.type === "dimension") {
        const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
        const dimensionTraits: DimensionTraitInfo[] = [];

        for (const rel of graphData.relationships) {
          if (rel.type === "BELONGS_TO" && rel.fromId === ethosNode.id) {
            const traitNode = nodeMap.get(rel.toId);
            if (traitNode && traitNode.type === "trait") {
              let indicatorCount = 0;
              for (const r2 of graphData.relationships) {
                if (r2.type === "INDICATES" && r2.fromId === traitNode.id) indicatorCount++;
              }
              dimensionTraits.push({
                name: traitNode.label,
                caption: traitNode.caption,
                polarity: (traitNode.properties.polarity as string) ?? "positive",
                indicatorCount,
              });
            }
          }
        }

        onNodeClick(ethosNode.id, ethosNode.type, ethosNode.label, {
          dimension: ethosNode.label,
          dimensionLabel: ethosNode.caption,
          dimensionTraits,
        });
        return;
      }

      onNodeClick(ethosNode.id, ethosNode.type, ethosNode.label);
    },
    [onNodeClick, graphData]
  );

  // Keep ref in sync so simulateClick always calls the latest handleNodeClick
  handleNodeClickRef.current = handleNodeClick;

  const { nvlNodes, nvlRels, stats } = useMemo(() => {
    if (!graphData || graphData.nodes.length === 0) {
      return { nvlNodes: [], nvlRels: [], stats: { indicators: 0, detected: 0, detections: 0, agents: 0 } };
    }
    const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
    const nodes = toNvlNodes(graphData.nodes);
    const nodeIds = new Set(graphData.nodes.map((n) => n.id));
    const rels = toNvlRelationships(graphData.relationships, nodeIds, nodeMap);

    const indicatorNodes = graphData.nodes.filter((n) => n.type === "indicator");
    const agentNodes = graphData.nodes.filter((n) => n.type === "agent");
    const detectedCount = indicatorNodes.filter((n) => ((n.properties.detectionCount as number) ?? 0) > 0).length;
    const totalDetections = indicatorNodes.reduce((sum, n) => sum + ((n.properties.detectionCount as number) ?? 0), 0);

    return {
      nvlNodes: nodes,
      nvlRels: rels,
      stats: {
        indicators: indicatorNodes.length,
        detected: detectedCount,
        detections: totalDetections,
        agents: agentNodes.length,
      },
    };
  }, [graphData]);

  const onGraphReadyRef = useRef(onGraphReady);
  onGraphReadyRef.current = onGraphReady;

  useEffect(() => {
    if (graphData && graphData.nodes.length > 0 && onGraphReadyRef.current) {
      const agentIds = graphData.nodes
        .filter((n) => n.type === "agent")
        .map((n) => n.id);
      const showcaseTypes = new Set(["agent", "trait", "indicator"]);
      const allShowcaseNodes = graphData.nodes
        .filter((n) => {
          if (!showcaseTypes.has(n.type)) return false;
          // Only include indicators that have been detected
          if (n.type === "indicator") return ((n.properties.detectionCount as number) ?? 0) > 0;
          return true;
        })
        .map((n) => ({ id: n.id, type: n.type, label: n.label }));
      onGraphReadyRef.current({ agentNodeIds: agentIds, allShowcaseNodes });
    }
  }, [graphData]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    getGraph()
      .then(setGraphData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load graph"))
      .finally(() => setLoading(false));
  }

  if (loading) {
    return (
      <div className={`flex ${heightClass} items-center justify-center rounded-xl border border-gray-200`} style={{ backgroundColor: "#ffffff" }} data-testid="graph-loading">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-action border-t-transparent" />
          <p className="mt-3 text-sm text-gray-400">Loading Phronesis Graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex ${heightClass} items-center justify-center rounded-xl border border-gray-200`} style={{ backgroundColor: "#ffffff" }} data-testid="graph-error">
        <div className="text-center">
          <p className="text-sm text-misaligned">{error}</p>
          <button type="button" onClick={handleRetry} className="mt-3 rounded-lg bg-action px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-action-hover" data-testid="graph-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className={`flex ${heightClass} items-center justify-center rounded-xl border border-gray-200`} style={{ backgroundColor: "#ffffff" }} data-testid="graph-empty">
        <div className="text-center">
          <p className="text-sm text-gray-400">No graph data yet. Seed evaluations first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${heightClass} rounded-xl border border-gray-200`} style={{ backgroundColor: "#ffffff" }} data-testid="phronesis-graph">
      <NvlRenderer nodes={nvlNodes} rels={nvlRels} onNodeClick={handleNodeClick} onControlsReady={handleControlsReady} />
      <div className="absolute top-3 right-3">
        <GraphHelpButton slug="guide-phronesis-graph" />
      </div>
      <GraphControls controls={nvlControls} />
      <GraphLegend stats={stats} />
    </div>
  );
}
