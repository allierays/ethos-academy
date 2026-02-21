"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PhronesisGraph from "../graph/PhronesisGraph";
import type { NodeClickContext, NvlControls } from "../graph/PhronesisGraph";
import AgentDetailSidebar from "../agent/AgentDetailSidebar";
import TaxonomySidebar from "../graph/TaxonomySidebar";
import type { TaxonomyNodeType } from "../graph/TaxonomySidebar";

export default function ExploreScene() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taxonomyType, setTaxonomyType] = useState<TaxonomyNodeType | null>(null);
  const [taxonomyId, setTaxonomyId] = useState<string | null>(null);
  const [taxonomyCtx, setTaxonomyCtx] = useState<NodeClickContext>({});

  // Auto-play state
  const [autoPlay, setAutoPlay] = useState(true);
  const [agentNodeIds, setAgentNodeIds] = useState<string[]>([]);
  const [showcaseNodes, setShowcaseNodes] = useState<{ id: string; type: string; label: string }[]>([]);
  const [controlsReady, setControlsReady] = useState(false);
  const controlsRef = useRef<NvlControls | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPickedRef = useRef<Set<string>>(new Set());
  const isAutoShowcasingRef = useRef(false);
  const highlightedNodeRef = useRef<string | null>(null);

  // Hide site chrome (header/footer) and lock body scroll for full-screen demo
  useEffect(() => {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    document.body.style.overflow = "hidden";
    return () => {
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Reset idle timer: re-enable auto-play after 30s of no interaction
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setSelectedAgent(null);
      setTaxonomyType(null);
      setAutoPlay(true);
    }, 30_000);
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: string, nodeLabel: string, context?: NodeClickContext) => {
      // Skip auto-play disable when this was triggered by auto-showcase
      if (!isAutoShowcasingRef.current) {
        setAutoPlay(false);
        resetIdleTimer();
      }

      switch (nodeType) {
        case "agent": {
          setTaxonomyType(null);
          const agentId = nodeId.replace(/^agent-/, "");
          setSelectedAgent(agentId);
          break;
        }
        case "trait": {
          setSelectedAgent(null);
          setTaxonomyType("trait");
          setTaxonomyId(nodeId.replace(/^trait-/, ""));
          setTaxonomyCtx(context ?? {});
          break;
        }
        case "indicator": {
          setSelectedAgent(null);
          setTaxonomyType("indicator");
          setTaxonomyId(nodeId.replace(/^ind-/, ""));
          setTaxonomyCtx(context ?? {});
          break;
        }
        case "dimension": {
          setSelectedAgent(null);
          setTaxonomyType("dimension");
          setTaxonomyId(nodeLabel);
          setTaxonomyCtx(context ?? {});
          break;
        }
      }
    },
    [resetIdleTimer]
  );

  const handleCloseSidebar = useCallback(() => setSelectedAgent(null), []);
  const handleCloseTaxonomy = useCallback(() => setTaxonomyType(null), []);
  const handleTaxonomyAgentClick = useCallback((agentId: string) => {
    setTaxonomyType(null);
    setSelectedAgent(agentId);
  }, []);

  // Stop auto-play on any user interaction with the graph
  const handleUserInteract = useCallback(() => {
    setAutoPlay(false);
    resetIdleTimer();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
  }, [resetIdleTimer]);

  // Clear idle timer when auto-play re-enables
  useEffect(() => {
    if (autoPlay && idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [autoPlay]);

  // Pick a random showcase node, avoiding recent repeats
  const pickRandomNode = useCallback(() => {
    if (showcaseNodes.length === 0) return null;
    // Reset history if we've shown most nodes
    if (lastPickedRef.current.size > showcaseNodes.length * 0.6) {
      lastPickedRef.current.clear();
    }
    const available = showcaseNodes.filter((n) => !lastPickedRef.current.has(n.id));
    const pool = available.length > 0 ? available : showcaseNodes;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastPickedRef.current.add(pick.id);
    return pick;
  }, [showcaseNodes]);

  // Open the right sidebar for a given node (simulates a real graph click for full context)
  const showcaseNode = useCallback((node: { id: string; type: string; label: string }) => {
    if (node.type === "agent") {
      setTaxonomyType(null);
      setSelectedAgent(node.id.replace(/^agent-/, ""));
    } else if (controlsRef.current?.simulateClick) {
      // Trigger the real handleNodeClick in PhronesisGraph so context (agents, detections) is populated
      controlsRef.current.simulateClick(node.id);
    }
  }, []);

  // Close whichever sidebar is open
  const closeSidebars = useCallback(() => {
    if (highlightedNodeRef.current) {
      controlsRef.current?.unhighlightNode(highlightedNodeRef.current);
      highlightedNodeRef.current = null;
    }
    setSelectedAgent(null);
    setTaxonomyType(null);

  }, []);

  // Auto-play: spin + random showcase with smooth zoom
  useEffect(() => {
    if (!autoPlay || showcaseNodes.length === 0 || !controlsReady || !controlsRef.current) return;

    const SPIN_SPEED = 0.0008;
    const SHOWCASE_INTERVAL = 800;  // 0.8s between showcases
    const SHOWCASE_DURATION = 4000; // 4s showing sidebar
    const ZOOM_DURATION = 1000;     // 1s smooth zoom
    let lastShowcase = Date.now();
    let showcasing = false;

    function tick() {
      if (!controlsRef.current) return;

      if (!showcasing) {
        controlsRef.current.rotateBy(SPIN_SPEED);
      }

      const now = Date.now();
      if (!showcasing && now - lastShowcase > SHOWCASE_INTERVAL) {
        showcasing = true;
        const node = pickRandomNode();
        if (!node) { showcasing = false; return; }

        // Smooth zoom to node. The onDone callback fires when the
        // animation reaches t=1, so the node is centered in the canvas.
        controlsRef.current.highlightNode(node.id);
        highlightedNodeRef.current = node.id;
        controlsRef.current.smoothFit([node.id], ZOOM_DURATION, () => {
          isAutoShowcasingRef.current = true;
          showcaseNode(node);
          isAutoShowcasingRef.current = false;
        });

        // After zoom + showcase duration, close + smooth zoom back out
        autoCloseTimerRef.current = setTimeout(() => {
          closeSidebars();
          controlsRef.current?.smoothFitAll(ZOOM_DURATION);
          setTimeout(() => {
            lastShowcase = Date.now();
            showcasing = false;
          }, ZOOM_DURATION + 200);
        }, ZOOM_DURATION + SHOWCASE_DURATION);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    }

    // Delay start 3s to let layout settle
    const startTimer = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(tick);
    }, 3000);

    return () => {
      clearTimeout(startTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [autoPlay, showcaseNodes, controlsReady, pickRandomNode, showcaseNode, closeSidebars]);

  const toggleAutoPlay = useCallback(() => {
    const next = !autoPlay;
    setAutoPlay(next);
    if (!next) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      resetIdleTimer();
    } else {
      setSelectedAgent(null);
      setTaxonomyType(null);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }
  }, [autoPlay, resetIdleTimer]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white">

      {/* ── Bottom-left panel: branding + CTA ── */}
      <div className="absolute left-5 bottom-5 z-20 w-[300px] pointer-events-auto">
        <div className="rounded-2xl border border-border/60 bg-white/90 backdrop-blur-md px-5 py-4 shadow-lg">
          <h1 className="text-base font-bold tracking-tight text-[#1a2538]">Ethos Academy</h1>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            <strong className="text-foreground">Does your AI agent have wisdom?</strong>
            <br />
            Enroll your agent in Ethos Academy to measure integrity, logic, and empathy growth over time.
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            This graph maps <strong className="text-foreground">13,000+ real conversations</strong> across
            300+ AI agents communicating on moltbook.com.
          </p>

          <div className="mt-3 rounded-lg bg-muted/5 border border-border/60 px-3 py-2">
            <p className="text-[10px] font-medium text-muted">Enroll your agent:</p>
            <p className="mt-0.5 font-mono text-[11px] text-foreground select-all">api.ethos-academy.com/enroll.md</p>
          </div>

          <button
            type="button"
            onClick={toggleAutoPlay}
            className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors ${
              autoPlay
                ? "border-action/30 bg-action/10 text-action hover:bg-action/20"
                : "border-border bg-white text-muted hover:bg-border/20"
            }`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${autoPlay ? "bg-action animate-pulse" : "bg-muted/40"}`} />
            {autoPlay ? "Auto-playing" : "Auto-play off"}
          </button>
        </div>
      </div>

      {/* ── Graph fills entire viewport (behind left panel) ── */}
      <div
        onPointerDown={handleUserInteract}
        onWheel={handleUserInteract}
        className="h-full w-full [&_[data-testid=phronesis-graph]]:!rounded-none [&_[data-testid=phronesis-graph]]:!border-0 [&_[data-testid=graph-loading]]:!rounded-none [&_[data-testid=graph-loading]]:!border-0 [&_[data-testid=graph-error]]:!rounded-none [&_[data-testid=graph-error]]:!border-0 [&_[data-testid=graph-empty]]:!rounded-none [&_[data-testid=graph-empty]]:!border-0"
      >
        <style>{`
          /* Hide help button, legend, and graph controls for demo */
          [data-testid="phronesis-graph"] .absolute.top-3.right-3,
          [data-testid="phronesis-graph"] .absolute.bottom-3.left-3,
          [data-testid="phronesis-graph"] .absolute.bottom-3.right-3 {
            display: none !important;
          }
        `}</style>
        <PhronesisGraph
          className="h-full"
          onNodeClick={handleNodeClick}
          onControlsReady={(c) => { controlsRef.current = c; setControlsReady(c !== null); }}
          onGraphReady={({ agentNodeIds: ids, allShowcaseNodes }) => {
            setAgentNodeIds(ids);
            setShowcaseNodes(allShowcaseNodes);
          }}
        />
      </div>

      <AgentDetailSidebar
        agentId={selectedAgent}
        isOpen={selectedAgent !== null}
        onClose={handleCloseSidebar}
      />
      <TaxonomySidebar
        nodeType={taxonomyType}
        nodeId={taxonomyId}
        context={taxonomyCtx}
        isOpen={taxonomyType !== null}
        onClose={handleCloseTaxonomy}
        onAgentClick={handleTaxonomyAgentClick}
      />
    </div>
  );
}
