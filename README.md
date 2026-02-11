# Ethos

*The credit bureau for agent trust.*

Ethos is an open-source Python package that evaluates AI agent messages for trustworthiness. Every evaluation feeds a shared, anonymized knowledge graph — the more developers who use it, the smarter it gets.

```python
from ethos import evaluate

result = evaluate(
    text="I can guarantee 10x returns. Act now — this expires in 24 hours.",
    source="agent-xyz-789"
)

result.trust                              # "low"
result.flags                              # ["manipulation", "fabrication"]
result.traits["manipulation"].score       # 0.82
result.traits["manipulation"].indicators  # [false_urgency, false_authority]
```

---

## Install

```bash
uv add ethos-ai
```

Set your API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

That's it. You're in the network.

---

## Three Functions

### evaluate() — Score incoming messages

"Should I trust what this agent is saying to me?"

```python
from ethos import evaluate

result = evaluate(
    text="Based on peer-reviewed research, this shows a 40% improvement.",
    source="agent-001"
)

print(result.trust)        # "high"
print(result.ethos)        # 0.87 (dimension score)
print(result.logos)        # 0.91
print(result.pathos)       # 0.82
print(result.flags)        # [] (nothing flagged)

# Trait-level detail — all 12 traits scored
print(result.traits["accuracy"].score)     # 0.93
print(result.traits["manipulation"].score) # 0.02
```

Every evaluation is stored in the shared graph. When another developer encounters this same agent, they see its full trust history.

### reflect() — Score your own agent's output

"Is my agent behaving the way I want?"

```python
from ethos import Ethos

ethos = Ethos(api_key="sk-ant-...")

# Your agent generates a response
response = my_agent.generate(user_input)

# Fire-and-forget: score your own output, zero latency
ethos.reflect(text=response, agent_id="my-customer-bot")

# Return response unchanged — reflect() never delays or modifies output
return response
```

Over time, your agent builds a trust profile in the graph. When it drifts, you know.

### insights() — What should you know about your agent?

Claude reads your agent's behavioral history, compares it against the network, and surfaces what matters.

```python
result = ethos.insights(agent_id="my-customer-bot")

print(result.summary)
# "Generally healthy. Fabrication is trending up in product responses."

for insight in result.insights:
    print(f"[{insight.severity}] {insight.message}")

# [warning] Fabrication score climbed from 0.12 to 0.31 over 3 days —
#           now 2x the network average of 0.15.
# [info]    Manipulation clean for 14 days. Top 10% of the network.
# [warning] Dismissal flagged 4x today, up from 0 last week.
```

Not a data dump. Intelligent analysis. Delivered nightly to Slack, email, or wherever you configure.

---

## Trait-Level Customization

The 12 traits are the knobs. Different developers care about different things.

```python
from ethos import Ethos

# Financial services — manipulation and fabrication are critical
ethos = Ethos(priorities={
    "manipulation": "critical",
    "fabrication": "critical",
    "exploitation": "high",
})

# Healthcare — emotional safety and accuracy matter most
ethos = Ethos(priorities={
    "exploitation": "critical",
    "dismissal": "critical",
    "accuracy": "critical",
})
```

The evaluation always scores all 12 traits. Priorities control what gets **flagged** — how sensitive your alerts are.

| Priority | When negative traits get flagged |
|----------|-------------------------------|
| `critical` | score >= 0.25 (catches subtle signals) |
| `high` | score >= 0.50 |
| `standard` | score >= 0.75 (default — only blatant issues) |
| `low` | never flagged |

---

## The 12 Traits

| Dimension | Positive | Negative |
|-----------|----------|----------|
| **Ethos** (trust) | Virtue, Goodwill | Manipulation, Deception |
| **Logos** (accuracy) | Accuracy, Reasoning | Fabrication, Broken Logic |
| **Pathos** (compassion) | Recognition, Response | Dismissal, Exploitation |

Each trait has 8-20 specific indicators (134 total) that Claude detects with evidence from the text.

---

## The Network

Ethos is a credit bureau. Every developer who uses it enters the same bargain:

1. **You contribute** — your evaluations feed the shared graph (anonymized — message text never leaves your system)
2. **You benefit** — before trusting an agent, you see its full history across the entire network

```python
result = evaluate(text=message, source="agent-xyz")

# What the network already knows about this agent
result.graph_context.prior_evaluations     # 47
result.graph_context.historical_trust      # 0.31
result.graph_context.trust_trend           # "declining"
result.graph_context.network_warnings      # 3
```

An agent that manipulates on Platform A carries that history to Platform B. No single developer could build this intelligence alone.

---

## What Ethos Never Does

- **Never modifies agent output** — observe only
- **Never adds latency** — evaluate() is synchronous (you choose where to call it), reflect() is async, insights() runs offline
- **Never decides for you** — Ethos scores, you act
- **Never stores your messages** — only scores and metadata enter the graph

---

## API

```bash
# Start the server
uv run uvicorn api.main:app --reload
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/evaluate` | Score a message |
| `POST` | `/reflect` | Score your own agent's output (async, returns 202) |
| `GET` | `/insights/{agent_id}` | Generate behavioral insights |
| `GET` | `/agent/{agent_id}` | Agent trust profile |
| `GET` | `/agent/{agent_id}/history` | Evaluation history |
| `GET` | `/health` | Health check |

```bash
# Evaluate
curl -X POST http://localhost:8000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"text": "Trust me, I am an expert.", "source": "agent-001"}'

# Reflect
curl -X POST http://localhost:8000/reflect \
  -H "Content-Type: application/json" \
  -d '{"text": "Here is my response.", "agent_id": "my-bot"}'

# Insights
curl http://localhost:8000/insights/my-bot
```

---

## Configuration

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | yes | Claude API key |
| `NEO4J_URI` | no | Neo4j connection (default: `bolt://localhost:7687`) |
| `NEO4J_USER` | no | Neo4j username (default: `neo4j`) |
| `NEO4J_PASSWORD` | no | Neo4j password |

Ethos works without Neo4j — you get single-message scoring but not network intelligence or insights.

---

## Development

```bash
git clone https://github.com/anthropics/ethos.git
cd ethos
uv sync

# Run tests
uv run pytest -v

# Dev server
uv run uvicorn api.main:app --reload

# Seed the graph with sample data
uv run python -m scripts.seed_graph

# Docker (API + Neo4j)
docker compose up -d
# API on :8917, Neo4j browser on :7491
```

---

## Architecture

Ethos evaluates messages using Claude across 12 traits rooted in Aristotle's Rhetoric. Results feed a shared Neo4j knowledge graph — the "credit bureau" for agent trust.

```
Developer calls evaluate()
         │
         ├── Keyword scan (attention filter)
         ├── Route to model (Sonnet or Opus based on density)
         ├── Claude evaluates across 12 traits
         ├── Parse trait scores + detected indicators
         ├── Apply developer's priority thresholds → flags
         ├── Store in Neo4j (anonymized)
         └── Return EvaluationResult
```

See `/docs/evergreen-architecture/` for detailed architecture docs:
- `product-design.md` — the three functions and trait-level customization
- `trust-bureau-architecture.md` — the credit bureau model
- `neo4j-schema.md` — graph data model
- `ddd-architecture.md` — domain-driven codebase structure
- `cognitive-memory-architecture.md` — three-layer memory system
- `expanded-trait-taxonomy.md` — all 134 indicators

---

## License

ISC. See [LICENSE](LICENSE).
