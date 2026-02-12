export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Score AI agent messages for honesty, accuracy, and intent.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card title="Evaluate" description="Score an incoming message across 12 behavioral traits." />
        <Card title="Reflect" description="Examine your own agent's outgoing messages over time." />
        <Card title="Insights" description="Opus-powered behavioral analysis and pattern detection." />
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="text-lg font-semibold">Quick Evaluate</h2>
        <p className="mt-1 text-sm text-muted">
          Paste a message below to score it. The evaluator panel with radar chart is coming in the next update.
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-background p-8 text-center text-sm text-muted">
          Evaluator panel coming soon
        </div>
      </div>
    </div>
  );
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
