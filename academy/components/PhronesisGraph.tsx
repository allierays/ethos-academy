"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGraph } from "../lib/api";
import type { GraphData, GraphNode as EthosGraphNode, GraphRel } from "../lib/types";

/* -------------------------------------------------------------------------- */
/*  NVL is imported dynamically to avoid SSR issues (canvas/WebGL)            */
/* -------------------------------------------------------------------------- */

interface NvlNode {
  id: string;
  color?: string;
  size?: number;
  caption?: string;
  pinned?: boolean;
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
/*  Node color + size mapping (from docs/ideas/phronesis-graph.md)            */
/* -------------------------------------------------------------------------- */

const DIMENSION_COLORS: Record<string, string> = {
  ethos: "#0d9488",
  logos: "#3b82f6",
  pathos: "#f59e0b",
};

const ALIGNMENT_COLORS: Record<string, string> = {
  aligned: "#10b981",
  drifting: "#f59e0b",
  misaligned: "#ef4444",
  violation: "#dc2626",
};

const PATTERN_SEVERITY_COLORS: Record<string, string> = {
  info: "#f59e0b",
  warning: "#ef4444",
  critical: "#dc2626",
};

function getNodeColor(node: EthosGraphNode): string {
  const { type, properties } = node;

  switch (type) {
    case "dimension":
      return DIMENSION_COLORS[node.label] ?? "#0d9488";
    case "trait": {
      const polarity = properties.polarity as string | undefined;
      if (polarity === "negative") return "#ef4444";
      const dim = properties.dimension as string | undefined;
      return dim ? (DIMENSION_COLORS[dim] ?? "#94a3b8") : "#94a3b8";
    }
    case "constitutional_value":
      return "#8b5cf6";
    case "pattern": {
      const severity = properties.severity as string | undefined;
      return severity
        ? (PATTERN_SEVERITY_COLORS[severity] ?? "#f59e0b")
        : "#f59e0b";
    }
    case "indicator":
      return "#94a3b8";
    case "agent": {
      const status = properties.alignmentStatus as string | undefined;
      return status
        ? (ALIGNMENT_COLORS[status] ?? "#10b981")
        : "#10b981";
    }
    case "evaluation":
      return "rgba(13, 148, 136, 0.5)";
    default:
      return "#94a3b8";
  }
}

function getNodeSize(node: EthosGraphNode): number {
  switch (node.type) {
    case "dimension":
      return 40;
    case "trait":
      return 25;
    case "constitutional_value":
      return 30;
    case "pattern":
      return 20;
    case "indicator":
      return 8;
    case "agent": {
      const count = (node.properties.evaluationCount as number) ?? 0;
      return Math.min(35, 15 + count * 2);
    }
    case "evaluation":
      return 6;
    default:
      return 10;
  }
}

function getNodeCaption(node: EthosGraphNode): string {
  switch (node.type) {
    case "dimension":
      return node.caption || node.label;
    case "trait":
      return node.label;
    case "constitutional_value":
      return node.caption || node.label;
    case "pattern":
      return node.label;
    case "agent":
      return node.label;
    case "indicator":
      return "";
    case "evaluation":
      return "";
    default:
      return node.label;
  }
}

/* -------------------------------------------------------------------------- */
/*  Relationship color + width mapping                                        */
/* -------------------------------------------------------------------------- */

const REL_STYLES: Record<string, { color: string; width: number }> = {
  BELONGS_TO: { color: "#94a3b8", width: 1 },
  UPHOLDS: { color: "#8b5cf6", width: 1.5 },
  COMPOSED_OF: { color: "#f59e0b", width: 1 },
  EVALUATED: { color: "#0d9488", width: 1 },
  DETECTED: { color: "#ef4444", width: 1 },
};

/* -------------------------------------------------------------------------- */
/*  Transform API data → NVL format                                           */
/* -------------------------------------------------------------------------- */

function toNvlNodes(nodes: EthosGraphNode[]): NvlNode[] {
  return nodes.map((n) => ({
    id: n.id,
    color: getNodeColor(n),
    size: getNodeSize(n),
    caption: getNodeCaption(n),
  }));
}

function toNvlRelationships(rels: GraphRel[]): NvlRelationship[] {
  return rels.map((r) => {
    const style = REL_STYLES[r.type] ?? { color: "#cbd5e1", width: 1 };
    return {
      id: r.id,
      from: r.fromId,
      to: r.toId,
      color: style.color,
      width: style.width,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

interface PhronesisGraphProps {
  onNodeClick?: (nodeId: string, nodeType: string) => void;
}

export default function PhronesisGraph({ onNodeClick }: PhronesisGraphProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nvlRef = useRef<React.ComponentType<any> | null>(null);
  const [nvlReady, setNvlReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamically import NVL (SSR-safe)
  useEffect(() => {
    import("@neo4j-nvl/react")
      .then((mod) => {
        nvlRef.current = mod.InteractiveNvlWrapper;
        setNvlReady(true);
      })
      .catch((err) => {
        console.error("Failed to load NVL:", err);
        setError("Failed to load graph visualization library");
      });
  }, []);

  // Fetch graph data
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getGraph();
        if (!cancelled) {
          setGraphData(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load graph";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNodeClick = useCallback(
    (_: unknown, node: { id: string }) => {
      if (!onNodeClick || !graphData) return;
      const ethosNode = graphData.nodes.find((n) => n.id === node.id);
      if (ethosNode) {
        onNodeClick(ethosNode.id, ethosNode.type);
      }
    },
    [onNodeClick, graphData]
  );

  function handleRetry() {
    setLoading(true);
    setError(null);
    getGraph()
      .then(setGraphData)
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Failed to load graph";
        setError(message);
      })
      .finally(() => setLoading(false));
  }

  const NvlComponent = nvlRef.current;

  // Loading state
  if (loading || !nvlReady || !NvlComponent) {
    return (
      <div
        className="flex h-[600px] items-center justify-center rounded-xl border border-border bg-white"
        data-testid="graph-loading"
      >
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-action border-t-transparent" />
          <p className="mt-3 text-sm text-muted">Loading Phronesis Graph...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="flex h-[600px] items-center justify-center rounded-xl border border-border bg-white"
        data-testid="graph-error"
      >
        <div className="text-center">
          <p className="text-sm text-misaligned">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-3 rounded-lg bg-action px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-action-hover"
            data-testid="graph-retry"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div
        className="flex h-[600px] items-center justify-center rounded-xl border border-border bg-white"
        data-testid="graph-empty"
      >
        <div className="text-center">
          <p className="text-sm text-muted">
            No graph data yet. Seed evaluations first.
          </p>
        </div>
      </div>
    );
  }

  const nvlNodes = toNvlNodes(graphData.nodes);
  const nvlRels = toNvlRelationships(graphData.relationships);

  return (
    <div
      ref={containerRef}
      className="relative h-[600px] rounded-xl border border-border bg-white"
      data-testid="phronesis-graph"
    >
      <NvlComponent
        nodes={nvlNodes}
        rels={nvlRels}
        layout="forceDirected"
        nvlOptions={{
          renderer: "canvas",
          initialZoom: 1,
          minZoom: 0.1,
          maxZoom: 5,
          allowDynamicMinZoom: true,
        }}
        mouseEventCallbacks={{
          onNodeClick: handleNodeClick,
        }}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Node count legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 rounded-lg bg-white/90 px-3 py-2 text-xs text-muted backdrop-blur-sm">
        <span>
          Nodes: {graphData.nodes.length}
        </span>
        <span>
          Agents: {graphData.nodes.filter((n) => n.type === "agent").length}
        </span>
        <span>
          Evaluations:{" "}
          {graphData.nodes.filter((n) => n.type === "evaluation").length}
        </span>
      </div>
    </div>
  );
}
