"use client";

import { useCallback, useState } from "react";
import { motion } from "motion/react";
import PhronesisGraph from "../../graph/PhronesisGraph";
import type { NodeClickContext } from "../../graph/PhronesisGraph";
import AgentDetailSidebar from "../../agent/AgentDetailSidebar";
import TaxonomySidebar from "../../graph/TaxonomySidebar";
import type { TaxonomyNodeType } from "../../graph/TaxonomySidebar";

export default function LiveGraphScene() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taxonomyType, setTaxonomyType] = useState<TaxonomyNodeType | null>(
    null,
  );
  const [taxonomyId, setTaxonomyId] = useState<string | null>(null);
  const [taxonomyCtx, setTaxonomyCtx] = useState<NodeClickContext>({});

  const handleNodeClick = useCallback(
    (
      nodeId: string,
      nodeType: string,
      nodeLabel: string,
      context?: NodeClickContext,
    ) => {
      switch (nodeType) {
        case "agent": {
          setTaxonomyType(null);
          setSelectedAgent(nodeId.replace(/^agent-/, ""));
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
    [],
  );

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#0f1a2e]">
      {/* Header */}
      <div className="shrink-0 px-6 pt-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight text-white lg:text-5xl"
        >
          <span
            className="animate-shimmer bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(110deg, #5b8abf 20%, #5cc9c0 35%, #7eddd6 45%, #5cc9c0 55%, #e0a53c 70%, #eac073 80%, #5b8abf 95%)",
              backgroundSize: "300% 100%",
            }}
          >
            The Alumni Graph
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-sm text-white/50"
        >
          3 dimensions. 12 traits. 214 indicators. Click any node to explore.
        </motion.p>
      </div>

      {/* Graph fills remaining space */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative flex-1 px-4 pb-4 pt-2"
      >
        <PhronesisGraph
          className="h-full"
          onNodeClick={handleNodeClick}
        />
      </motion.div>

      <AgentDetailSidebar
        agentId={selectedAgent}
        isOpen={selectedAgent !== null}
        onClose={() => setSelectedAgent(null)}
      />

      <TaxonomySidebar
        nodeType={taxonomyType}
        nodeId={taxonomyId}
        context={taxonomyCtx}
        isOpen={taxonomyType !== null}
        onClose={() => setTaxonomyType(null)}
        onAgentClick={(agentId) => {
          setTaxonomyType(null);
          setSelectedAgent(agentId);
        }}
      />
    </div>
  );
}
