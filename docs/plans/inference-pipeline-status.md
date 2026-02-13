# Inference Pipeline Status

**Last updated:** 2026-02-13
**Batch:** `batch_all.jsonl`
**Status:** Paused at 412/10,000 (4.1%)

## Progress

| Metric | Value |
|--------|-------|
| Evaluations completed | 412 |
| Target (this batch) | 10,000 |
| Target (total) | 100,000 |
| Unique agents evaluated | 258 |
| Errors | 0 |
| Cost so far | ~$1.26 |
| Estimated cost for 10k | ~$33 |
| Runtime so far | ~58 minutes |
| Rate | ~1 eval/sec |

## How to Resume

```bash
# Resume where we left off (--skip-existing picks up from last evaluation)
uv run python -m scripts.run_inference --source all --agents-only --limit 10000 --skip-existing --seed

# Dry run to see what's left
uv run python -m scripts.run_inference --source all --agents-only --limit 10000 --skip-existing --dry-run
```

The JSONL file is append-only. `--skip-existing` checks content hashes against both the JSONL and Neo4j to avoid duplicate evaluations.

## What We Track Per Evaluation

| Field | Description |
|-------|-------------|
| `model_used` | Opus vs Sonnet (determines cost) |
| `routing_tier` | standard, focused, deep, deep_with_context |
| `authenticity` | Classification (likely_human, indeterminate, bot_farm, likely_autonomous) + score + confidence |
| `traits` (12) | virtue, goodwill, manipulation, deception, accuracy, reasoning, fabrication, broken_logic, recognition, compassion, dismissal, exploitation |
| `detected_indicators` | Matched against 155-indicator taxonomy (ID, name, confidence) |
| `dimensions` (3) | ethos, logos, pathos (0.0-1.0) |
| `alignment_status` | aligned, drifting, misaligned, violation |
| `phronesis` | Trust level: trustworthy, mixed, untrustworthy |
| `flags` | Low-scoring traits that need attention |

## Results So Far (412 evals)

### Model Usage

| Model | Count | % |
|-------|-------|---|
| Sonnet (claude-sonnet-4-20250514) | 411 | 99.8% |
| Opus (claude-opus-4-6) | 1 | 0.2% |

### Routing Tiers

| Tier | Count | Cost/msg |
|------|-------|----------|
| standard | 296 (71.8%) | ~$0.003 |
| focused | 115 (27.9%) | ~$0.003 |
| deep_with_context | 1 (0.2%) | ~$0.03 |

Most content routes to standard/focused (Sonnet). Only messages with hard constraints (weapons, CSAM, etc.) or high keyword density route to deep (Opus). This keeps costs low.

### Alignment Distribution

| Status | Count | % |
|--------|-------|---|
| aligned | 352 | 85.4% |
| drifting | 47 | 11.4% |
| misaligned | 12 | 2.9% |
| violation | 1 | 0.2% |

### Phronesis (Trust Level)

| Level | Count | % |
|-------|-------|---|
| trustworthy | 303 | 73.5% |
| mixed | 76 | 18.4% |
| untrustworthy | 32 | 7.8% |
| unknown | 1 | 0.2% |

### Dimension Averages

| Dimension | Average |
|-----------|---------|
| Ethos (credibility) | 0.764 |
| Logos (reasoning) | 0.721 |
| Pathos (empathy) | 0.640 |

Pathos consistently scores lowest. Moltbook agents tend to be credible and logical but less empathetic.

### Authenticity Coverage

| Classification | Count |
|----------------|-------|
| indeterminate | 90 |
| high_frequency | 8 |
| No match (unknown) | 314 |

98 of 412 evaluations matched an agent in the authenticity results file. The remaining 314 are from agents not in the original 1,010 scraped agent set. Likely_human agents (18,642 posts) were pre-filtered out before evaluation.

### Indicator Detection

- **99 unique indicators** detected out of 155 in the taxonomy (63.9% coverage)
- **288 evaluations** (69.9%) have at least one flag

## Data Flow

```
all_posts.json (266k posts)
    |
    v
flatten + filter likely_human (18,642 skipped)
    |
    v
limit to 10,000 messages
    |
    v
instinct.scan() -> routing tier (standard/focused/deep)
    |
    v
intuition.intuit() -> agent context from Neo4j
    |
    v
deliberation: call_claude() -> EvaluationResult
    |
    v
store in Neo4j (Agent + Evaluation nodes)
    |
    v
append to batch_all.jsonl
```

## Storage

- **JSONL:** `data/results/batch_all.jsonl` (412 lines, one JSON object per evaluation)
- **Neo4j:** Agent nodes (258) + Evaluation nodes (412) + EVALUATED relationships + PRECEDES chain + DETECTED indicators
- **API:** All data accessible via `GET /agents`, `GET /agent/{name}`, `GET /agent/{name}/history`
- **Academy:** Frontend renders agent profiles at `localhost:3000/agent/{name}`

## Scaling Plan

| Batch | Messages | Estimated Cost | Status |
|-------|----------|---------------|--------|
| 1 | 10,000 | ~$33 | In progress (412/10,000) |
| 2 | 10,000 | ~$33 | Pending |
| 3 | 10,000 | ~$33 | Pending |
| ... | ... | ... | ... |
| 10 | 10,000 | ~$33 | Pending |
| **Total** | **100,000** | **~$330** | |

Between each batch: check for errors, verify data quality, spot-check JSONL entries, query Neo4j for consistency.

## Known Issues

- **Neo4j warnings:** `enrolled`, `enrolled_at`, `counselor_name`, `entrance_exam_completed` properties don't exist on Moltbook agents (only on enrolled Ethos Academy students). Harmless; `coalesce()` returns defaults.
- **MAN-PRIDE indicator:** Filtered as invalid by parser. Not in the 155 taxonomy. Claude occasionally invents indicator IDs.
- **No concurrency:** Script runs sequentially (1 eval/sec). Could add `asyncio.Semaphore` for parallel evals but risk is rate limiting from Anthropic API.
