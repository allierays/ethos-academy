"use client";

import { useCallback, useState } from "react";
import PhronesisGraph from "../../components/PhronesisGraph";
import AgentDetailSidebar from "../../components/AgentDetailSidebar";

export default function GraphPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: string) => {
      if (nodeType === "agent") {
        const agentId = nodeId.replace(/^agent-/, "");
        setSelectedAgentId(agentId);
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    setSelectedAgentId(null);
  }, []);

  return (
    <div className="space-y-6" data-testid="graph-page">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Phronesis Graph
        </h1>
        <p className="mt-1 text-sm text-muted">
          The six-layer Ethos taxonomy connected to live agent evaluations.
        </p>
      </div>

      <div className="relative flex">
        <div
          className={`transition-all duration-300 ${
            selectedAgentId ? "w-[calc(100%-320px)]" : "w-full"
          }`}
        >
          <PhronesisGraph onNodeClick={handleNodeClick} />
        </div>

        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-[600px] transition-transform duration-300 ${
            selectedAgentId
              ? "translate-x-0"
              : "translate-x-full pointer-events-none"
          }`}
        >
          {selectedAgentId && (
            <AgentDetailSidebar
              agentId={selectedAgentId}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
