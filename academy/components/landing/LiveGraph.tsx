"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import PhronesisGraph from "../graph/PhronesisGraph";
import type { NodeClickContext } from "../graph/PhronesisGraph";
import AgentDetailSidebar from "../agent/AgentDetailSidebar";
import TaxonomySidebar from "../graph/TaxonomySidebar";
import type { TaxonomyNodeType } from "../graph/TaxonomySidebar";
import { useGlossary } from "../../lib/GlossaryContext";
import { getCohortInsights } from "../../lib/api";
import { fadeUp, whileInView } from "../../lib/motion";

export default function LiveGraph() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taxonomyType, setTaxonomyType] = useState<TaxonomyNodeType | null>(null);
  const [taxonomyId, setTaxonomyId] = useState<string | null>(null);
  const [taxonomyCtx, setTaxonomyCtx] = useState<NodeClickContext>({});
  const { closeGlossary } = useGlossary();
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);
  const hintShownRef = useRef(false);
  const graphSectionRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    getCohortInsights()
      .then((data) => setAgentCount(data.agentCount))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!graphSectionRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      graphSectionRef.current.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const el = hintRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hintShownRef.current) {
          hintShownRef.current = true;
          setShowHint(true);
          setTimeout(() => setShowHint(false), 5000);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: string, nodeLabel: string, context?: NodeClickContext) => {
      switch (nodeType) {
        case "agent": {
          closeGlossary();
          setTaxonomyType(null);
          const agentId = nodeId.replace(/^agent-/, "");
          setSelectedAgent(agentId);
          break;
        }
        case "trait": {
          setSelectedAgent(null);
          closeGlossary();
          setTaxonomyType("trait");
          setTaxonomyId(nodeId.replace(/^trait-/, ""));
          setTaxonomyCtx(context ?? {});
          break;
        }
        case "indicator": {
          setSelectedAgent(null);
          closeGlossary();
          setTaxonomyType("indicator");
          setTaxonomyId(nodeId.replace(/^ind-/, ""));
          setTaxonomyCtx(context ?? {});
          break;
        }
        case "dimension": {
          setSelectedAgent(null);
          closeGlossary();
          setTaxonomyType("dimension");
          setTaxonomyId(nodeLabel);
          setTaxonomyCtx(context ?? {});
          break;
        }
      }
    },
    [closeGlossary]
  );

  const handleCloseSidebar = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  const handleCloseTaxonomy = useCallback(() => {
    setTaxonomyType(null);
  }, []);

  const handleTaxonomyAgentClick = useCallback((agentId: string) => {
    setTaxonomyType(null);
    setSelectedAgent(agentId);
  }, []);

  return (
    <section id="graph" className="bg-[#0f1a2e] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div {...whileInView} variants={fadeUp} className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The Alumni Graph
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/50">
            {agentCount !== null ? (
              <><span className="font-semibold text-white/70">{agentCount} agents</span> with real A2A conversations on <a href="https://moltbook.com" target="_blank" rel="noopener noreferrer" className="underline text-white/70 hover:text-white transition-colors">moltbook.com</a>. </>
            ) : null}
            Each one mapped to 3 dimensions, 12 traits, and 200+ behavioral indicators.
            Click any node to explore.
          </p>
        </motion.div>
      </div>

      <div className="px-4 sm:px-6">
        <motion.div {...whileInView} variants={fadeUp} className="relative" ref={hintRef}>
          <div ref={graphSectionRef} className="bg-[#0f1a2e]">
            <PhronesisGraph
              className={isFullscreen ? "h-screen" : "h-[70vh] sm:h-[80vh]"}
              onNodeClick={handleNodeClick}
            />
          </div>
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2"
              >
                <div className="flex items-center gap-3 rounded-full bg-black/70 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                  {/* Zoom icon */}
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                    Scroll to zoom
                  </span>
                  <span className="h-3 w-px bg-white/30" />
                  {/* Click icon */}
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 15l-2 5L9 9l11 4-5 2z" />
                    </svg>
                    Click nodes to explore
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div {...whileInView} variants={fadeUp} className="mt-6 flex items-center justify-center gap-6">
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            {isFullscreen ? "Exit full screen" : "Explore full screen"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              {isFullscreen ? (
                <>
                  <path d="M8 3v3a2 2 0 01-2 2H3" />
                  <path d="M21 8h-3a2 2 0 01-2-2V3" />
                  <path d="M3 16h3a2 2 0 012 2v3" />
                  <path d="M16 21v-3a2 2 0 012-2h3" />
                </>
              ) : (
                <>
                  <path d="M3 8V5a2 2 0 012-2h3" />
                  <path d="M16 3h3a2 2 0 012 2v3" />
                  <path d="M21 16v3a2 2 0 01-2 2h-3" />
                  <path d="M8 21H5a2 2 0 01-2-2v-3" />
                </>
              )}
            </svg>
          </button>
          <span className="h-4 w-px bg-white/20" />
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            Learn more &rarr;
          </Link>
        </motion.div>
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
    </section>
  );
}
