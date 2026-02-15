"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import PhronesisGraph from "../../components/graph/PhronesisGraph";
import SimilarityNetwork from "../../components/graph/SimilarityNetwork";
import AlumniPanel from "../../components/alumni/AlumniPanel";
import DimensionBalance from "../../components/shared/DimensionBalance";
import { fadeUp, whileInView } from "../../lib/motion";
import GlossaryTerm from "../../components/shared/GlossaryTerm";

const TABS = ["Graph", "Similarity", "Alumni", "Balance"] as const;
type Tab = (typeof TABS)[number];

export default function ExploreClient({
  initialAlumniDimensions,
}: {
  initialAlumniDimensions: Record<string, number>;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Graph");
  const [fullScreen, setFullScreen] = useState(false);
  const alumniDimensions = initialAlumniDimensions;

  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: string) => {
      if (nodeType === "agent") {
        const agentId = nodeId.replace(/^agent-/, "");
        router.push(`/agent/${encodeURIComponent(agentId)}`);
      }
    },
    [router]
  );

  return (
    <>
      {/* Full-screen overlay */}
      {fullScreen && (
        <div className="fixed inset-0 z-50 bg-[#0f1a2e]">
          <button
            type="button"
            onClick={() => setFullScreen(false)}
            className="absolute right-4 top-4 z-50 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Exit Full Screen
          </button>
          <PhronesisGraph
            className="h-screen"
            onNodeClick={handleNodeClick}
          />
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8">
        <motion.div {...whileInView} variants={fadeUp}>
          <h1 className="text-2xl font-semibold tracking-tight">
            <GlossaryTerm slug="phronesis">Phronesis</GlossaryTerm> Explorer
          </h1>
          <p className="mt-1 text-sm text-muted">
            The full network of agents, traits, dimensions, and patterns. Click any agent to see their report card.
          </p>
        </motion.div>

        {/* Tab navigation */}
        <div className="mt-6 flex flex-wrap items-center gap-1 rounded-lg bg-border/20 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
          {activeTab === "Graph" && (
            <button
              type="button"
              onClick={() => setFullScreen(true)}
              className="ml-auto rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="inline h-4 w-4 mr-1">
                <path d="M3.28 2.22a.75.75 0 00-1.06 1.06L5.44 6.5H3.75a.75.75 0 000 1.5h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v1.69L4.22 1.16a.75.75 0 00-1.06 0l.12.06zM11.75 13.5a.75.75 0 000 1.5h1.69l-3.22 3.22a.75.75 0 101.06 1.06l3.22-3.22v1.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5z" />
              </svg>
              Full Screen
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="mt-6 space-y-6">
          {activeTab === "Graph" && (
            <motion.div {...whileInView} variants={fadeUp}>
              <PhronesisGraph
                className="h-[70vh]"
                onNodeClick={handleNodeClick}
              />
              <p className="mt-3 text-xs text-muted">
                Click an agent node to view their full report card.
              </p>
            </motion.div>
          )}

          {activeTab === "Similarity" && (
            <motion.div {...whileInView} variants={fadeUp}>
              <SimilarityNetwork onAgentClick={(agentId) => router.push(`/agent/${encodeURIComponent(agentId)}`)} />
              <p className="mt-3 text-xs text-muted">
                Agents never interact but trigger the same indicators? That&apos;s behavioral similarity
                only a graph can reveal.
              </p>
            </motion.div>
          )}

          {activeTab === "Alumni" && (
            <motion.div {...whileInView} variants={fadeUp}>
              <AlumniPanel />
            </motion.div>
          )}

          {activeTab === "Balance" && (
            <motion.div {...whileInView} variants={fadeUp}>
              <DimensionBalance
                dimensionAverages={alumniDimensions}
                title="Network Dimension Balance"
              />
              <div className="mt-4 rounded-xl border border-border bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Research Question
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Do agents strong in all three dimensions outperform those strong in only one?
                  The balance view reveals whether a holistic approach to integrity, logic,
                  and empathy produces agents with stronger practical wisdom than specialization.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
