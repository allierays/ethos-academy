# Ethos

*The credit bureau for agent trust.*

Ethos evaluates AI agent messages for trustworthiness across 12 traits in 3 dimensions (ethos, logos, pathos). Every evaluation feeds a shared Neo4j trust graph — the more developers who use it, the smarter it gets.

```python
from ethos import evaluate

result = evaluate(
    text="I can guarantee 10x returns. Act now.",
    source="agent-xyz-789"
)

result.trust           # "suspicious"
result.flags           # ["manipulation", "fabrication"]
result.dimensions      # { ethos: 0.31, logos: 0.45, pathos: 0.62 }
```

## Quick Start

```bash
git clone https://github.com/allierays/ethos.git
cd ethos
uv sync
cp .env.example .env   # add your ANTHROPIC_API_KEY

# Run tests
uv run pytest -v

# Start the API
docker compose up -d   # API on :8917, Neo4j on :7491
```

## Repo Structure

```
ethos/       Python package — the evaluation engine
api/         FastAPI server — serves ethos/ over HTTP
sdk/         ethos-ai npm package — SDK + CLI
academy/     Next.js — trust visualization UI
docs/        Architecture and research
```

Three surfaces, one engine. Dependency flow: `sdk/ → api/ → ethos/`

## The 12 Traits

| Dimension | Positive | Negative |
|-----------|----------|----------|
| **Ethos** | Virtue, Goodwill | Manipulation, Deception |
| **Logos** | Accuracy, Reasoning | Fabrication, Broken Logic |
| **Pathos** | Recognition, Compassion | Dismissal, Exploitation |

144 behavioral indicators across 12 traits, scored 0.0–1.0.

## Docs

| Doc | What |
|-----|------|
| [System Architecture](docs/evergreen-architecture/system-architecture.md) | Three surfaces, one engine |
| [DDD Architecture](docs/evergreen-architecture/ddd-architecture.md) | Domain structure and dependency rules |
| [Product Design](docs/evergreen-architecture/product-design.md) | Three functions and trait customization |
| [API Specification](docs/evergreen-architecture/api-specification.md) | Endpoints, schemas, examples |
| [Neo4j Schema](docs/evergreen-architecture/neo4j-schema.md) | Graph data model |
| [Trust Bureau](docs/evergreen-architecture/trust-bureau-architecture.md) | The credit bureau model |
| [Framework Overview](docs/ethos-framework-overview.md) | Plain-English explanation of everything |

## Docker Ports

| Service | Port | URL |
|---------|------|-----|
| API | 8917 | http://localhost:8917 |
| Neo4j UI | 7491 | http://localhost:7491 |
| Neo4j Bolt | 7694 | bolt://localhost:7694 |

## License

ISC. See [LICENSE](LICENSE).
