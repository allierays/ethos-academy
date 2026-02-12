import type { Metadata } from "next";
import PhronesisGraph from "../../components/PhronesisGraph";

export const metadata: Metadata = {
  title: "Phronesis Graph | Ethos Academy",
  description:
    "Interactive visualization of the Ethos taxonomy — dimensions, traits, constitutional values, and agent trust data.",
};

export default function GraphPage() {
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

      <PhronesisGraph />
    </div>
  );
}
