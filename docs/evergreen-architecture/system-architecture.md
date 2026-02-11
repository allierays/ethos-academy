# System Architecture

> Three surfaces, one engine. How Ethos is built and how developers interact with it.

---

## The Three Surfaces

```
┌─────────────────────────────────────────────────────┐
│                   Developers                         │
│                                                      │
│   Terminal                Code               Browser │
│      │                    │                     │    │
│      ▼                    ▼                     ▼    │
│  ┌───────┐         ┌───────────┐        ┌──────────┐│
│  │  CLI  │         │  npm SDK  │        │   Web    ││
│  │       │         │           │        │ Dashboard││
│  │ npx   │         │ import {} │        │          ││
│  │ ethos │         │ from      │        │ Next.js  ││
│  │       │         │'ethos-ai' │        │          ││
│  └───┬───┘         └─────┬─────┘        └────┬─────┘│
│      │                   │                    │      │
│      └───────────────────┼────────────────────┘      │
│                          │                           │
│              ┌───────────▼──────────┐                │
│              │     Ethos API        │                │
│              │   (Python/FastAPI)   │                │
│              │                      │                │
│              │  Claude ←→ Neo4j     │                │
│              └──────────────────────┘                │
└─────────────────────────────────────────────────────┘
```

---

## 1. npm Package: `ethos-ai`

One install, two modes. The npm package is both the CLI tool and the importable SDK.

```bash
npm install ethos-ai
```

### CLI Mode

For developers who live in the terminal.

```bash
# Onboarding — chat-forward, picks priorities via prompts
npx ethos init

# Evaluate a message directly
npx ethos evaluate "Trust me, I guarantee 10x returns"

# Check your agent's trust profile
npx ethos insights my-bot

# Reflect on your agent's output
npx ethos reflect --agent my-bot --text "Here is my response"
```

`npx ethos init` is the agentic onboarding — conversational, pill-style choices, sets up your config and API key. Not a wall of docs. A conversation.

### SDK Mode

For developers who want to integrate into their agent code. Two lines for defaults.

```javascript
import { evaluate } from 'ethos-ai'

const result = await evaluate({
  text: "I can guarantee 10x returns. Act now.",
  source: "agent-xyz-789"
})

// result.trust → "low"
// result.flags → ["manipulation", "fabrication"]
// result.traits.manipulation.score → 0.82
```

With customization:

```javascript
import { Ethos } from 'ethos-ai'

const ethos = new Ethos({
  priorities: {
    manipulation: 'critical',
    fabrication: 'critical',
    exploitation: 'high'
  }
})

const result = await ethos.evaluate({ text: message, source: agentId })
```

Reflect (fire-and-forget, zero latency):

```javascript
// Your agent generates a response
const response = await myAgent.generate(userInput)

// Score your own output — async, never blocks
ethos.reflect({ text: response, agentId: 'my-bot' })

// Return response unchanged
return response
```

### What the Package Contains

```
ethos-ai/
├── bin/
│   └── ethos.js           # CLI entry point
├── src/
│   ├── index.ts           # SDK exports: evaluate, reflect, insights, Ethos
│   ├── client.ts          # HTTP client that calls the Ethos API
│   ├── evaluate.ts        # evaluate() function
│   ├── reflect.ts         # reflect() function
│   ├── insights.ts        # insights() function
│   ├── config.ts          # EthosConfig, priorities, presets
│   └── types.ts           # TypeScript types: EvaluationResult, TraitScore, etc.
├── cli/
│   ├── init.ts            # npx ethos init — onboarding wizard
│   ├── evaluate.ts        # npx ethos evaluate
│   ├── insights.ts        # npx ethos insights
│   └── reflect.ts         # npx ethos reflect
├── package.json
└── tsconfig.json
```

The SDK is a thin HTTP client. All intelligence lives server-side. The package is lightweight — no heavy dependencies, fast install.

---

## 2. Web Dashboard (Next.js)

The visual interface. Onboarding for people who prefer a browser. Insights for people who want to see the picture.

### What Lives Here

**Onboarding** — the first thing you see. Chat-forward, pill-based choices:
- What kind of agent are you protecting?
- What traits matter most to you?
- Here's your API key and install command.

**Agent Dashboard** — after setup, this is where you monitor your agents:
- Trust scores over time (line charts per trait)
- Flags and alerts
- Network comparison (your agent vs. the network average)
- Insights from the nightly `insights()` analysis

**Graph Visualization** — the "wow" for the demo:
- Trust network (agents as nodes, evaluations as edges)
- Color-coded by trust score
- Manipulation clusters
- Declining agents highlighted

**The Demo Flow** — the dashboard IS the demo:
1. Show the graph (the network, the patterns)
2. Show an agent's trust timeline (declining, flags increasing)
3. Show insights ("fabrication trending up, 2x network average")
4. End with "install it today" — the onboarding page

### Tech Stack

- Next.js (SSR for the dashboard pages)
- The dashboard calls the same Ethos API as the npm package
- Neo4j visualization via Neovis.js or D3.js for the graph
- Deployed alongside the API or separately (Vercel for Next.js, AWS for API)

---

## 3. API (Python/FastAPI)

The engine. Not user-facing — the npm package and dashboard both talk to it. This is where Claude evaluates messages, Neo4j stores the graph, and all the intelligence lives.

### Why Python

- Claude evaluation logic (keyword scanning, prompt building, response parsing) is already designed in Python
- Anthropic Python SDK is mature
- Neo4j Python driver has full async support
- FastAPI is fast and well-suited for this
- The complexity lives here — 134 indicators, 12 traits, routing tiers, graph queries

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/evaluate` | Score a message |
| `POST` | `/reflect` | Score your own agent's output (async, 202) |
| `GET` | `/insights/{agent_id}` | Generate behavioral insights |
| `POST` | `/insights/{agent_id}/send` | Generate and deliver insights to webhook |
| `GET` | `/agent/{agent_id}` | Agent trust profile |
| `GET` | `/agent/{agent_id}/history` | Evaluation history |
| `GET` | `/network/averages` | Network-wide trait averages |
| `GET` | `/health` | Health check |

### Hosting

Needs to be publicly accessible for the npm package and dashboard to hit it. Options:
- AWS (EC2 or Lambda)
- Railway
- Fly.io
- Any container host — Dockerfile already exists

### What Lives Here

```
api/
├── main.py                # FastAPI app, routes
└── routes/                # Endpoint handlers

ethos/                     # Core Python package
├── evaluate.py            # evaluate() — keyword scan → route → Claude → parse
├── reflect.py             # reflect() — async evaluation storage
├── insights.py            # insights() — Claude reads graph, surfaces patterns
├── scanner.py             # Keyword lexicon, pre-filter
├── prompts.py             # Layered prompt builder (12 traits, 134 indicators)
├── graph.py               # Neo4j service (read, write, network queries)
├── taxonomy.py            # 12 traits, 134 indicators, 7 patterns
├── config.py              # Configuration, priorities, presets
├── identity.py            # Agent ID hashing
└── models.py              # Pydantic models

scripts/
├── seed_graph.py          # Seed Neo4j with semantic memory + Moltbook data
└── scrape_moltbook.py     # Data collection
```

---

## How They Connect

```
Developer types: npx ethos evaluate "some message"
       │
       ▼
CLI parses args, calls SDK
       │
       ▼
SDK sends POST /evaluate to Ethos API
       │
       ▼
API runs evaluate():
  1. Keyword scan → routing tier
  2. Select model (Sonnet or Opus)
  3. Build prompt (12-trait rubric)
  4. Call Claude
  5. Parse response → trait scores + indicators
  6. Apply priority thresholds → flags
  7. Store in Neo4j
  8. Return EvaluationResult
       │
       ▼
SDK receives JSON, returns typed result to developer
       │
       ▼
Developer sees: trust: "low", flags: ["manipulation", "fabrication"]
```

```
Developer opens dashboard
       │
       ▼
Next.js page calls GET /agent/my-bot
       │
       ▼
API queries Neo4j for agent profile + history
       │
       ▼
Dashboard renders trust timeline, trait scores, network comparison
       │
       ▼
Developer calls GET /insights/my-bot
       │
       ▼
API calls Claude (Opus) with agent history + network averages
       │
       ▼
Claude reasons about patterns, returns insights
       │
       ▼
Dashboard renders: "Fabrication trending up, 2x network average"
```

---

## Hackathon Build Priority

| Priority | What | Why |
|----------|------|-----|
| 1 | **API** — evaluate() actually works | Everything depends on this |
| 2 | **npm package** — SDK + CLI published | "Install it today" demo closer |
| 3 | **Dashboard** — graph viz + insights | The "wow" for judges |
| 4 | **Neo4j seeded** — Moltbook data in the graph | Makes the network real |
| 5 | **reflect() + insights()** | Depth beyond basic eval |

The API is the foundation. The npm package is the distribution. The dashboard is the demo. Everything else layers on.

---

## The Two-Line Promise

No matter which surface — CLI, SDK, or dashboard — the core experience is two lines:

**CLI:**
```bash
npm install ethos-ai
npx ethos evaluate "Trust me, this is guaranteed"
```

**Code:**
```javascript
import { evaluate } from 'ethos-ai'
const result = await evaluate({ text: message, source: agentId })
```

**Dashboard:**
Sign up. See your agents. Two clicks.

Everything else — priorities, presets, insights, webhooks — is optional customization on top of defaults that just work.
