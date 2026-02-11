# Project Guide for Claude

## Project Overview

Ethos is an open-source Python package and API for evaluating AI agent messages for trustworthiness across ethos, logos, and pathos dimensions.

*Better agents. Better data. Better alignment.*

## Tech Stack

- **Language**: Python 3.11+
- **Package manager**: uv
- **API**: FastAPI + Uvicorn
- **Database**: Neo4j (graph)
- **LLM**: Anthropic SDK (Claude)
- **Validation**: Pydantic v2
- **Testing**: pytest + httpx

## Project Structure

```
ethos/                   # Python package
├── __init__.py          # Exports: evaluate, reflect, models
├── models.py            # Pydantic models (EvaluationResult, ReflectionResult)
├── evaluate.py          # evaluate(text, source?) -> EvaluationResult
├── reflect.py           # reflect(agent_id) -> ReflectionResult
├── prompts.py           # LLM prompt templates
└── graph.py             # Neo4j integration
api/
└── main.py              # FastAPI app (GET /health, POST /evaluate, POST /reflect)
tests/
└── test_evaluate.py     # Test suite
scripts/
└── seed_graph.py        # Sample data seeder
dashboard/               # Future: visualization UI
```

## Naming Conventions

- **Files**: `snake_case.py`
- **Functions/Variables**: `snake_case`
- **Classes/Models**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE`

## Commands

```bash
# Run tests
uv run pytest -v

# Start dev server
uv run uvicorn api.main:app --reload

# Seed sample data
uv run python -m scripts.seed_graph

# Import check
uv run python -c "from ethos import evaluate, reflect"

# Docker
docker compose build
docker compose up -d        # API on :8917, Neo4j browser on :7491
docker compose down
```

## Environment Variables

Copy `.env.example` to `.env`. Required:
- `ANTHROPIC_API_KEY` — Claude API key
- `NEO4J_URI` — default `bolt://localhost:7687` (Docker overrides to `bolt://neo4j:7687`)
- `NEO4J_USER` / `NEO4J_PASSWORD`

## Key Models

- `EvaluationResult(ethos, logos, pathos, flags, trust)` — floats 0-1, trust is str
- `ReflectionResult(compassion, honesty, accuracy, trend)` — floats 0-1, trend is str

## Do

- Use `uv run` for all Python commands (not bare `python`)
- Use Pydantic `Field(ge=0.0, le=1.0)` for score bounds
- Keep evaluation and reflection logic in their own modules
- Write tests for all new functionality

## Do NOT

- Hardcode API keys — use `.env` via environment variables
- Import from `api` inside the `ethos` package (one-way dependency)
- Use `Any` type — create proper Pydantic models

<!-- agentic-loop-detected -->
## Detected Project Info

- Runtime: Node.js + Python
- Framework: FastAPI
- Testing: pytest
- Python: Use `uv run python` (not bare `python`)

*Auto-detected by agentic-loop. Edit freely.*

<!-- my-dna -->
## DNA

### Core Values
- Respect / Kindness - treat people well, in code and communication
- Simplicity / Clarity - avoid jargon, make things understandable

### Voice
Minimal and precise. Say less, mean more.

### Project
- **Priority:** Ship it - hackathon pace, get it working
- **Audience:** Anthropic hackathon - technical judges and participants
- **Tone:** Professional - clean, trustworthy, serious

## Hackathon Context

**Event:** [Claude Code Hackathon](https://cerebralvalley.ai/e/claude-code-hackathon/details)

**Problem Statement:** Amplify Human Judgment — Build AI that makes researchers, professionals, and decision-makers dramatically more capable without taking them out of the loop. The best AI doesn't replace human expertise. It sharpens it.

**How Ethos fits:** Ethos amplifies human judgment by scoring AI agent messages for trustworthiness (ethos, logos, pathos). It flags manipulation and builds trust graphs over time — keeping humans informed, not replaced.

### Judging Criteria

1. **Demo (30%)** — Working, impressive, holds up live. Genuinely cool to watch.
2. **Impact (25%)** — Real-world potential. Who benefits, how much does it matter? Could this become something people use?
3. **Opus 4.6 Use (25%)** — Creative, beyond basic integration. Surface capabilities that surprise.
4. **Depth & Execution (20%)** — Push past the first idea. Sound engineering, real craft, not a quick hack.

### What This Means for Development

- **Demo first.** Every feature must be demoable. If it can't be shown live, deprioritize it.
- **Use Opus 4.6 deeply.** Evaluation logic should leverage Claude's reasoning in non-obvious ways — structured prompting, multi-pass analysis, self-reflection patterns.
- **Show the graph.** Neo4j trust graphs over time are the "wow" factor. Make trust visible.
- **Keep humans in the loop.** Ethos scores inform, not decide. The human always has final say.
