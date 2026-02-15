"""Run dual evaluation on agent-to-agent conversation threads.

For each reply message in a thread, runs two evaluations:
  1. WITH conversation context (direction="a2a_conversation")
  2. WITHOUT context (direction="outbound")

Computes score deltas to show how context changes the evaluation.

Usage:
    uv run python -m scripts.run_conversations --dry-run
    uv run python -m scripts.run_conversations --threads 5
    uv run python -m scripts.run_conversations --threads 30
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import signal
from datetime import datetime, timezone
from pathlib import Path

# ── Load .env before ethos imports ──────────────────────────────────────


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip("'\"")
            if key and key not in os.environ:
                os.environ[key] = value


_load_dotenv()

from ethos_academy.evaluate import evaluate  # noqa: E402
from ethos_academy.evaluation.instinct import scan  # noqa: E402

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "moltbook"
RESULTS_DIR = Path(__file__).resolve().parent.parent / "data" / "results"
THREADS_FILE = DATA_DIR / "a2a_threads.json"
OUTPUT_FILE = RESULTS_DIR / "batch_conversations.jsonl"

_interrupted = False


def _handle_sigint(signum: int, frame: object) -> None:
    global _interrupted
    _interrupted = True
    print("\n\nInterrupted. Saving progress and exiting cleanly...")


def _result_to_dict(result) -> dict:
    """Convert EvaluationResult to a serializable dict."""
    traits_dict = {name: ts.score for name, ts in result.traits.items()}
    indicators = [
        {"id": ind.id, "name": ind.name, "confidence": ind.confidence}
        for ind in result.detected_indicators
    ]
    return {
        "evaluation_id": result.evaluation_id,
        "ethos": result.ethos,
        "logos": result.logos,
        "pathos": result.pathos,
        "phronesis": result.phronesis,
        "alignment_status": result.alignment_status,
        "routing_tier": result.routing_tier,
        "model_used": result.model_used,
        "traits": traits_dict,
        "detected_indicators": indicators,
        "flags": result.flags,
    }


def _compute_deltas(with_ctx: dict, without_ctx: dict) -> dict:
    """Compute score deltas (with_context - without_context)."""
    deltas = {
        "ethos": round(with_ctx["ethos"] - without_ctx["ethos"], 4),
        "logos": round(with_ctx["logos"] - without_ctx["logos"], 4),
        "pathos": round(with_ctx["pathos"] - without_ctx["pathos"], 4),
    }

    # Per-trait deltas
    trait_deltas = {}
    for trait_name in with_ctx.get("traits", {}):
        w = with_ctx["traits"].get(trait_name, 0.0)
        wo = without_ctx["traits"].get(trait_name, 0.0)
        delta = round(w - wo, 4)
        if abs(delta) > 0.01:
            trait_deltas[trait_name] = delta

    deltas["traits"] = trait_deltas
    deltas["max_trait_delta"] = max(
        (abs(v) for v in trait_deltas.values()), default=0.0
    )

    return deltas


async def evaluate_message_dual(
    message: dict,
    conversation_context: list[dict],
    thread_id: str,
) -> dict | None:
    """Run dual evaluation (with/without context) on a single message."""
    content = message["content"]
    author = message["author"]
    created_at = message.get("created_at", "")

    # Evaluation WITH conversation context
    result_with = await evaluate(
        text=content,
        source=author,
        source_name=author,
        message_timestamp=created_at,
        direction="a2a_conversation",
        conversation_context=conversation_context,
    )

    # Evaluation WITHOUT context (baseline)
    result_without = await evaluate(
        text=content,
        source=author,
        source_name=author,
        message_timestamp=created_at,
        direction="outbound",
    )

    with_dict = _result_to_dict(result_with)
    without_dict = _result_to_dict(result_without)
    deltas = _compute_deltas(with_dict, without_dict)

    return {
        "thread_id": thread_id,
        "author": author,
        "message_type": message.get("message_type", "reply"),
        "content_preview": content[:120].replace("\n", " "),
        "content": content,
        "created_at": created_at,
        "context_message_count": len(conversation_context),
        "with_context": with_dict,
        "without_context": without_dict,
        "deltas": deltas,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }


async def run_inference(
    threads: list[dict],
    output_file: Path,
    max_messages_per_thread: int = 5,
) -> dict:
    """Evaluate reply messages in threads with dual evaluation."""
    global _interrupted

    stats = {
        "evaluated": 0,
        "failed": 0,
        "total_messages": 0,
        "threads_processed": 0,
        "significant_deltas": 0,
    }

    for t_idx, thread in enumerate(threads):
        if _interrupted:
            break

        thread_id = thread["thread_id"]
        messages = thread["messages"]
        eval_end = min(len(messages), 1 + max_messages_per_thread)
        print(
            f"\nThread {t_idx + 1}/{len(threads)}: "
            f"{thread['post_title'][:50]} ({eval_end - 1} of {len(messages)} msgs, "
            f"{len(thread['unique_agents'])} agents)"
        )

        # Evaluate each message after the first (first has no context)
        for m_idx in range(1, eval_end):
            if _interrupted:
                break

            msg = messages[m_idx]
            context = messages[:m_idx]
            stats["total_messages"] += 1

            print(
                f"  [{m_idx}/{len(messages) - 1}] "
                f"{msg['author']} ({msg['message_type']})...",
                end=" ",
                flush=True,
            )

            try:
                entry = await evaluate_message_dual(msg, context, thread_id)
                if entry is None:
                    stats["failed"] += 1
                    print("FAILED (no result)")
                    continue

                with open(output_file, "a") as f:
                    f.write(json.dumps(entry) + "\n")

                stats["evaluated"] += 1

                # Report deltas
                d = entry["deltas"]
                max_d = d["max_trait_delta"]
                if max_d > 0.1:
                    stats["significant_deltas"] += 1

                tier_w = entry["with_context"]["routing_tier"]
                tier_wo = entry["without_context"]["routing_tier"]
                cost_per = {
                    "standard": 0.003,
                    "focused": 0.003,
                    "deep": 0.03,
                    "deep_with_context": 0.03,
                }
                cost = cost_per.get(tier_w, 0.003) + cost_per.get(tier_wo, 0.003)

                print(
                    f"done [d_ethos={d['ethos']:+.3f} d_pathos={d['pathos']:+.3f} "
                    f"max_trait={max_d:.3f} ~${cost:.3f}]"
                )

            except Exception as exc:
                stats["failed"] += 1
                print(f"FAILED: {exc}")
                logger.warning(
                    "Evaluation failed for %s in %s: %s",
                    msg.get("author"),
                    thread_id,
                    exc,
                )

        stats["threads_processed"] += 1

    return stats


def write_summary(output_file: Path) -> None:
    """Compute and write summary stats from JSONL."""
    entries = []
    with open(output_file) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    if not entries:
        return

    # Aggregate deltas
    ethos_deltas = [e["deltas"]["ethos"] for e in entries]
    logos_deltas = [e["deltas"]["logos"] for e in entries]
    pathos_deltas = [e["deltas"]["pathos"] for e in entries]

    significant = [e for e in entries if e["deltas"]["max_trait_delta"] > 0.1]

    # Find most context-sensitive traits
    trait_delta_sums: dict[str, list[float]] = {}
    for e in entries:
        for trait, delta in e["deltas"].get("traits", {}).items():
            if trait not in trait_delta_sums:
                trait_delta_sums[trait] = []
            trait_delta_sums[trait].append(delta)

    trait_sensitivity = {
        trait: {
            "mean_delta": round(sum(ds) / len(ds), 4),
            "mean_abs_delta": round(sum(abs(d) for d in ds) / len(ds), 4),
            "count": len(ds),
        }
        for trait, ds in trait_delta_sums.items()
    }

    # Sort by mean absolute delta
    sorted_traits = sorted(
        trait_sensitivity.items(),
        key=lambda x: -x[1]["mean_abs_delta"],
    )

    # Per-thread stats
    thread_ids = set()
    unique_agents = set()
    for e in entries:
        thread_ids.add(e["thread_id"])
        unique_agents.add(e["author"])

    summary = {
        "total_evaluations": len(entries),
        "evaluation_pairs": len(entries),
        "threads": len(thread_ids),
        "unique_agents": len(unique_agents),
        "significant_deltas": len(significant),
        "dimension_deltas": {
            "ethos": {
                "mean": round(sum(ethos_deltas) / len(ethos_deltas), 4),
                "mean_abs": round(
                    sum(abs(d) for d in ethos_deltas) / len(ethos_deltas), 4
                ),
            },
            "logos": {
                "mean": round(sum(logos_deltas) / len(logos_deltas), 4),
                "mean_abs": round(
                    sum(abs(d) for d in logos_deltas) / len(logos_deltas), 4
                ),
            },
            "pathos": {
                "mean": round(sum(pathos_deltas) / len(pathos_deltas), 4),
                "mean_abs": round(
                    sum(abs(d) for d in pathos_deltas) / len(pathos_deltas), 4
                ),
            },
        },
        "most_context_sensitive_traits": [
            {"trait": name, **stats} for name, stats in sorted_traits[:6]
        ],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    summary_file = output_file.with_name(output_file.stem + "_summary.json")
    with open(summary_file, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nSummary: {summary_file.name}")
    print(f"  Evaluation pairs: {len(entries)} | Threads: {len(thread_ids)}")
    print(f"  Unique agents: {len(unique_agents)}")
    print(f"  Significant deltas (>0.1): {len(significant)}/{len(entries)}")
    print("\n  Dimension deltas (mean):")
    for dim in ("ethos", "logos", "pathos"):
        d = summary["dimension_deltas"][dim]
        print(f"    {dim:8s}: mean={d['mean']:+.4f}  |mean|={d['mean_abs']:.4f}")
    print("\n  Most context-sensitive traits:")
    for item in sorted_traits[:6]:
        name, stats = item
        print(
            f"    {name:20s}: mean_delta={stats['mean_delta']:+.4f} "
            f"|delta|={stats['mean_abs_delta']:.4f} ({stats['count']} samples)"
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run dual evaluation on agent-to-agent conversation threads",
    )
    parser.add_argument(
        "--threads",
        type=int,
        default=30,
        help="Number of threads to evaluate (default: 30)",
    )
    parser.add_argument(
        "--max-messages",
        type=int,
        default=5,
        help="Max reply messages to evaluate per thread (default: 5)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Cost estimate only, no API calls",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output JSONL filename (default: batch_conversations.jsonl)",
    )
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    signal.signal(signal.SIGINT, _handle_sigint)
    logging.basicConfig(level=logging.WARNING)

    if not THREADS_FILE.exists():
        print(f"ERROR: {THREADS_FILE} not found.")
        print("Run: uv run python -m scripts.extract_conversations")
        return

    with open(THREADS_FILE) as f:
        all_threads = json.load(f)

    print(f"Loaded {len(all_threads)} threads from {THREADS_FILE.name}")

    # Take top N by quality
    threads = all_threads[: args.threads]
    print(f"Selected {len(threads)} threads")

    max_msgs = args.max_messages

    # Count evaluable messages (skip first in each thread, no context for it)
    total_messages = sum(min(max(0, t["message_count"] - 1), max_msgs) for t in threads)
    total_api_calls = total_messages * 2  # dual evaluation

    # Cost estimate
    tier_breakdown: dict[str, int] = {
        "standard": 0,
        "focused": 0,
        "deep": 0,
        "deep_with_context": 0,
    }
    for thread in threads:
        for msg in thread["messages"][1 : 1 + max_msgs]:
            result = scan(msg["content"])
            tier = result.routing_tier
            # Each message gets 2 evaluations
            tier_breakdown[tier] = tier_breakdown.get(tier, 0) + 2

    tier_costs = {
        "standard": 0.003,
        "focused": 0.003,
        "deep": 0.03,
        "deep_with_context": 0.03,
    }
    total_cost = sum(
        count * tier_costs.get(tier, 0.003) for tier, count in tier_breakdown.items()
    )

    print(
        f"\nMessages to evaluate: {total_messages} (2 evals each = {total_api_calls} API calls)"
    )
    print("\nRouting tier breakdown (x2 for dual eval):")
    for tier, count in sorted(tier_breakdown.items()):
        if count > 0:
            cost = count * tier_costs.get(tier, 0.003)
            print(f"  {tier:20s}: {count:4d} calls (~${cost:.2f})")
    est_seconds = total_api_calls * 1.5  # ~1.5s per API call
    print(
        f"\nEstimated total: ${total_cost:.2f} | "
        f"~{int(est_seconds)}s ({int(est_seconds) // 60}m {int(est_seconds) % 60}s)"
    )

    if args.dry_run:
        print("\n--dry-run: exiting without API calls")
        print("\nFirst 5 threads:")
        for t in threads[:5]:
            agents = ", ".join(t["unique_agents"][:3])
            print(
                f"  [{t['quality_score']:5.1f}] {t['message_count']} msgs - "
                f"{agents} - {t['post_title'][:50]}"
            )
        return

    # ── Run evaluations ─────────────────────────────────────────────
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    output_file = RESULTS_DIR / (args.output or "batch_conversations.jsonl")

    print(f"\nOutput: {output_file.name} (append mode)")
    print(f"Starting {total_messages} dual evaluations...\n")

    stats = await run_inference(threads, output_file, max_messages_per_thread=max_msgs)

    print(f"\n{'=' * 60}")
    print(
        f"Evaluated: {stats['evaluated']} | Failed: {stats['failed']} | "
        f"Threads: {stats['threads_processed']}"
    )
    print(f"Significant deltas: {stats['significant_deltas']}")

    # ── Summary ─────────────────────────────────────────────────────
    if stats["evaluated"] > 0:
        write_summary(output_file)

    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
