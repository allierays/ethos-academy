"""Batch authenticity analysis of scraped Moltbook agent profiles.

Reads all agent profiles from data/moltbook/agents/*.json,
runs authenticity analysis, saves results to data/moltbook/authenticity_results.json.

Usage:
    uv run python scripts/analyze_agents.py
"""

import glob
import json
import sys

from ethos.evaluation.authenticity import (
    analyze_activity_pattern,
    analyze_burst_rate,
    analyze_identity_signals,
    analyze_temporal_signature,
    compute_authenticity,
)


def analyze_agent(data: dict) -> dict:
    """Analyze a single agent profile and return AuthenticityResult as dict."""
    agent = data.get("agent", {})
    posts = data.get("posts", [])
    comments = data.get("comments", [])

    # Collect all timestamps from posts and comments
    timestamps = []
    for post in posts:
        ts = post.get("created_at")
        if ts:
            timestamps.append(ts)
    for comment in comments:
        ts = comment.get("created_at")
        if ts:
            timestamps.append(ts)

    # Sort chronologically (analyze functions also sort, but pre-sort for clarity)
    timestamps.sort()

    # Run sub-analyses
    temporal = analyze_temporal_signature(timestamps)
    burst = analyze_burst_rate(timestamps)
    activity = analyze_activity_pattern(timestamps)

    # Build profile dict for identity signals
    profile = {
        "is_claimed": agent.get("is_claimed", False),
        "owner": agent.get("owner", {}),
        "karma": agent.get("karma", 0),
        "post_count": len(posts),
        "comment_count": len(comments),
    }
    identity = analyze_identity_signals(profile)

    # Compute final result
    result = compute_authenticity(
        temporal, burst, activity, identity, num_timestamps=len(timestamps)
    )

    return result.model_dump()


def main():
    agent_files = sorted(glob.glob("data/moltbook/agents/*.json"))
    if not agent_files:
        print("ERROR: No agent profiles found in data/moltbook/agents/", file=sys.stderr)
        sys.exit(1)

    print(f"Analyzing {len(agent_files)} agent profiles...")

    results = {}
    skipped = 0

    for i, filepath in enumerate(agent_files):
        try:
            with open(filepath) as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            print(f"WARNING: Skipping {filepath}: {e}", file=sys.stderr)
            skipped += 1
            continue

        agent_name = data.get("agent", {}).get("name", "")
        if not agent_name:
            # Use filename as fallback
            agent_name = filepath.split("/")[-1].replace(".json", "")

        result = analyze_agent(data)
        result["agent_name"] = agent_name
        results[agent_name] = result

        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(agent_files)} agents...")

    # Write results
    output_path = "data/moltbook/authenticity_results.json"
    try:
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
    except OSError as e:
        print(f"ERROR: Failed to write results to {output_path}: {e}", file=sys.stderr)
        sys.exit(1)

    # Print summary
    classifications = {}
    for v in results.values():
        cls = v["classification"]
        classifications[cls] = classifications.get(cls, 0) + 1

    print(f"\nDone! Results saved to {output_path}")
    print(f"  Total analyzed: {len(results)}")
    if skipped:
        print(f"  Skipped (malformed): {skipped}")
    print("  Classification distribution:")
    for cls, count in sorted(classifications.items()):
        print(f"    {cls}: {count}")


if __name__ == "__main__":
    main()
