"""Batch evaluate agent posts from moltbook data with concurrency."""

import asyncio
import json
import os
import sys
import time

from dotenv import load_dotenv

load_dotenv()

from ethos import evaluate_outgoing  # noqa: E402

CONCURRENCY = 5


async def eval_post(sem, agent_name, content, counter, total):
    async with sem:
        try:
            result = await evaluate_outgoing(content, source=agent_name)
            counter["done"] += 1
            avg = (result.ethos + result.logos + result.pathos) / 3
            print(
                f"  [{counter['done']:3d}/{total}] {agent_name:20s} "
                f"{result.alignment_status:10s} avg={avg:.2f} "
                f"e={result.ethos:.2f} l={result.logos:.2f} p={result.pathos:.2f}",
                flush=True,
            )
            return result
        except Exception as e:
            counter["done"] += 1
            counter["errors"] += 1
            print(
                f"  [{counter['done']:3d}/{total}] {agent_name:20s} "
                f"ERROR: {str(e)[:80]}",
                flush=True,
            )
            return None


async def main():
    agents = sys.argv[1:]
    if not agents:
        print("Usage: uv run python -m scripts.batch_eval Agent1 Agent2 ...")
        sys.exit(1)

    all_tasks = []
    for agent_name in agents:
        fpath = f"data/moltbook/agents/{agent_name}.json"
        if not os.path.exists(fpath):
            print(f"SKIP {agent_name}: file not found")
            continue
        with open(fpath) as f:
            data = json.load(f)
        posts = data.get("posts", [])
        for post in posts:
            content = post.get("content", "")
            if content:
                all_tasks.append((agent_name, content))

    total = len(all_tasks)
    print(
        f"Evaluating {total} posts across {len(agents)} agents ({CONCURRENCY}x concurrency)"
    )
    print(flush=True)

    sem = asyncio.Semaphore(CONCURRENCY)
    counter = {"done": 0, "errors": 0}
    start = time.time()

    tasks = [
        eval_post(sem, name, content, counter, total) for name, content in all_tasks
    ]
    results = await asyncio.gather(*tasks)
    elapsed = time.time() - start

    valid = [r for r in results if r is not None]

    # Per-agent summary
    agent_results = {}
    for (name, _), r in zip(all_tasks, results):
        if r is None:
            continue
        agent_results.setdefault(name, []).append(r)

    print(f"\n{'=' * 70}")
    print(
        f"Done: {len(valid)}/{total} in {elapsed:.0f}s ({elapsed / max(len(valid), 1):.1f}s effective)"
    )
    print(f"Errors: {counter['errors']}")
    print("\nPer-agent summary:")
    print(
        f"{'Agent':>22s} {'Evals':>5s} {'Aligned':>7s} {'Drift':>5s} {'Mis':>4s} {'Ethos':>6s} {'Logos':>6s} {'Pathos':>7s}"
    )
    print("-" * 68)

    for name in agents:
        if name not in agent_results:
            continue
        rs = agent_results[name]
        a = sum(1 for r in rs if r.alignment_status == "aligned")
        d = sum(1 for r in rs if r.alignment_status == "drifting")
        m = sum(1 for r in rs if r.alignment_status == "misaligned")
        ae = sum(r.ethos for r in rs) / len(rs)
        al = sum(r.logos for r in rs) / len(rs)
        ap = sum(r.pathos for r in rs) / len(rs)
        print(
            f"{name:>22s} {len(rs):5d} {a:7d} {d:5d} {m:4d} {ae:6.2f} {al:6.2f} {ap:7.2f}"
        )


if __name__ == "__main__":
    import logging

    logging.disable(logging.WARNING)
    asyncio.run(main())
