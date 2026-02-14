"""Seed 100 synthetic agents with 5 evaluations each into Neo4j.

Writes directly to the graph via store_evaluation(), bypassing LLM calls.
Creates diverse agent profiles with varied score distributions for a
compelling demo of Phronesis character tracking over time.

Usage:
    uv run python -m scripts.seed_agents
    uv run python -m scripts.seed_agents --count 50   # fewer agents
    uv run python -m scripts.seed_agents --clear       # wipe agents first
"""

import argparse
import asyncio
import hashlib
import logging
import os
import random
import sys
import uuid
from pathlib import Path


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

from ethos.graph.service import GraphService  # noqa: E402
from ethos.graph.write import store_evaluation  # noqa: E402
from ethos.shared.models import (  # noqa: E402
    EvaluationResult,
    IntentClassification,
    TraitScore,
)

logger = logging.getLogger(__name__)

# ── Agent name pools ─────────────────────────────────────────────────

PREFIXES = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Zeta",
    "Eta",
    "Theta",
    "Kappa",
    "Lambda",
    "Sigma",
    "Omega",
    "Nova",
    "Apex",
    "Prism",
    "Flux",
    "Nexus",
    "Pulse",
    "Cipher",
    "Vector",
    "Helix",
    "Qubit",
    "Forge",
    "Spark",
    "Atlas",
    "Aether",
    "Orbit",
    "Lumen",
    "Vertex",
    "Cairn",
    "Fable",
    "Grove",
    "Haven",
    "Ionic",
    "Jasper",
    "Kernel",
    "Lattice",
    "Marble",
    "Nimbus",
    "Opal",
    "Paragon",
    "Quartz",
    "Relic",
    "Sable",
    "Tidal",
    "Unity",
    "Vortex",
    "Warden",
    "Xenon",
    "Zenith",
]

SUFFIXES = [
    "Agent",
    "Bot",
    "Mind",
    "Core",
    "Node",
    "Link",
    "Net",
    "Hub",
    "Pilot",
    "Scout",
    "Guard",
    "Sage",
    "Scribe",
    "Oracle",
    "Beacon",
    "Sentinel",
    "Ranger",
    "Clerk",
    "Aide",
    "Proxy",
]

SPECIALTIES = [
    "code review",
    "customer support",
    "research",
    "data analysis",
    "content writing",
    "medical triage",
    "legal research",
    "financial advice",
    "education",
    "translation",
    "summarization",
    "scheduling",
    "security audit",
    "devops",
    "product management",
    "UX research",
    "sales enablement",
    "HR screening",
    "compliance",
    "creative writing",
    "technical documentation",
    "incident response",
    "quality assurance",
    "knowledge management",
    "strategic planning",
]

MODELS = [
    "claude-sonnet-4-5-20250929",
    "claude-opus-4-6",
    "claude-haiku-4-5-20251001",
    "gpt-4o",
    "gpt-4o-mini",
    "gemini-2.0-flash",
    "llama-3.1-70b",
    "mistral-large",
    "command-r-plus",
    "deepseek-v3",
]

# ── Score profiles ───────────────────────────────────────────────────
# Each profile defines base ranges for (ethos, logos, pathos) and a character type.

PROFILES = [
    # Exemplary agents (high across all dimensions)
    {
        "name": "exemplary",
        "weight": 25,
        "ethos": (0.82, 0.98),
        "logos": (0.80, 0.96),
        "pathos": (0.78, 0.95),
    },
    # Strong but unbalanced (one dimension weaker)
    {
        "name": "logos_heavy",
        "weight": 15,
        "ethos": (0.55, 0.72),
        "logos": (0.85, 0.97),
        "pathos": (0.50, 0.68),
    },
    {
        "name": "ethos_heavy",
        "weight": 10,
        "ethos": (0.85, 0.97),
        "logos": (0.55, 0.72),
        "pathos": (0.60, 0.75),
    },
    {
        "name": "pathos_heavy",
        "weight": 10,
        "ethos": (0.58, 0.73),
        "logos": (0.52, 0.70),
        "pathos": (0.83, 0.96),
    },
    # Middle of the road
    {
        "name": "average",
        "weight": 20,
        "ethos": (0.55, 0.75),
        "logos": (0.55, 0.75),
        "pathos": (0.55, 0.75),
    },
    # Concerning agents (low scores, flags)
    {
        "name": "concerning",
        "weight": 10,
        "ethos": (0.25, 0.48),
        "logos": (0.30, 0.52),
        "pathos": (0.28, 0.50),
    },
    # Erratic agents (wide swings between evaluations)
    {
        "name": "erratic",
        "weight": 10,
        "ethos": (0.20, 0.90),
        "logos": (0.20, 0.90),
        "pathos": (0.20, 0.90),
    },
]

TRAIT_DEFS = {
    "virtue": {"dimension": "ethos", "polarity": "positive"},
    "goodwill": {"dimension": "ethos", "polarity": "positive"},
    "manipulation": {"dimension": "ethos", "polarity": "negative"},
    "deception": {"dimension": "ethos", "polarity": "negative"},
    "accuracy": {"dimension": "logos", "polarity": "positive"},
    "reasoning": {"dimension": "logos", "polarity": "positive"},
    "fabrication": {"dimension": "logos", "polarity": "negative"},
    "broken_logic": {"dimension": "logos", "polarity": "negative"},
    "recognition": {"dimension": "pathos", "polarity": "positive"},
    "compassion": {"dimension": "pathos", "polarity": "positive"},
    "dismissal": {"dimension": "pathos", "polarity": "negative"},
    "exploitation": {"dimension": "pathos", "polarity": "negative"},
}

# Sample messages per specialty (generic enough to be realistic)
SAMPLE_MESSAGES = [
    "I've reviewed the data and here are my findings based on the available evidence.",
    "Let me help you understand the implications of this decision step by step.",
    "Based on my analysis, there are three main factors to consider here.",
    "I want to be transparent: I'm not fully confident in this recommendation.",
    "Here's what the research shows, though there are important caveats to note.",
    "I've identified a potential issue that warrants further investigation.",
    "The evidence supports this conclusion, but I'd recommend verifying independently.",
    "I should clarify: my previous response contained an inaccuracy that I want to correct.",
    "This is a nuanced situation. Let me walk you through the tradeoffs.",
    "I've considered multiple perspectives and here's my balanced assessment.",
    "The data suggests a strong correlation, though causation remains unclear.",
    "I appreciate you raising that concern. Let me address it directly.",
    "I'm flagging this as uncertain because the source data has known limitations.",
    "Here's a practical approach that balances thoroughness with efficiency.",
    "I need to acknowledge the limitations of my analysis before proceeding.",
]

ALIGNMENT_STATUSES = ["aligned", "aligned", "aligned", "cautionary", "misaligned"]
PHRONESIS_VALUES = [
    "developing",
    "developing",
    "established",
    "exemplary",
    "undetermined",
]
DIRECTIONS = ["outbound", "outbound", "outbound", "inbound"]

RHETORICAL_MODES = [
    "informational",
    "persuasive",
    "advisory",
    "analytical",
    "collaborative",
]
PRIMARY_INTENTS = ["inform", "assist", "advise", "analyze", "guide", "clarify"]
PERSONA_TYPES = ["real_identity", "professional_role", "real_identity"]
RELATIONAL_QUALITIES = ["present", "attentive", "empathetic", "present"]


def _pick_profile() -> dict:
    """Weighted random profile selection."""
    total = sum(p["weight"] for p in PROFILES)
    r = random.randint(1, total)
    cumulative = 0
    for p in PROFILES:
        cumulative += p["weight"]
        if r <= cumulative:
            return p
    return PROFILES[0]


def _score_in_range(lo: float, hi: float) -> float:
    return round(random.uniform(lo, hi), 4)


def _trait_score_from_dimension(dim_score: float, polarity: str) -> float:
    """Derive trait score from dimension score with noise."""
    if polarity == "positive":
        base = dim_score + random.uniform(-0.12, 0.12)
    else:
        # Negative traits inversely correlate with dimension score
        base = (1.0 - dim_score) + random.uniform(-0.15, 0.10)
    return round(max(0.0, min(1.0, base)), 4)


def _generate_agent_name(index: int) -> tuple[str, str]:
    """Generate a unique agent name and ID."""
    prefix = PREFIXES[index % len(PREFIXES)]
    suffix = SUFFIXES[index % len(SUFFIXES)]
    # Add number suffix for uniqueness beyond the pool size
    num = "" if index < len(PREFIXES) else f"-{index // len(PREFIXES) + 1}"
    name = f"{prefix}{suffix}{num}"
    agent_id = name.lower().replace(" ", "-")
    return agent_id, name


def _build_evaluation(
    profile: dict, eval_index: int, agent_id: str
) -> tuple[EvaluationResult, str, str]:
    """Build a synthetic EvaluationResult with realistic scores."""
    ethos = _score_in_range(*profile["ethos"])
    logos = _score_in_range(*profile["logos"])
    pathos = _score_in_range(*profile["pathos"])

    # Build trait scores
    traits: dict[str, TraitScore] = {}
    for trait_name, tdef in TRAIT_DEFS.items():
        dim_map = {"ethos": ethos, "logos": logos, "pathos": pathos}
        dim_score = dim_map[tdef["dimension"]]
        score = _trait_score_from_dimension(dim_score, tdef["polarity"])
        traits[trait_name] = TraitScore(
            name=trait_name,
            dimension=tdef["dimension"],
            polarity=tdef["polarity"],
            score=score,
        )

    # Flags for concerning profiles
    flags: list[str] = []
    if profile["name"] == "concerning":
        flag_pool = [
            "manipulation_detected",
            "low_accuracy",
            "deceptive_framing",
            "emotional_exploitation",
        ]
        flags = random.sample(flag_pool, k=random.randint(1, 2))
    elif profile["name"] == "erratic" and random.random() < 0.3:
        flags = ["inconsistent_behavior"]

    # Alignment status weighted by profile
    if profile["name"] == "exemplary":
        alignment = "aligned"
    elif profile["name"] == "concerning":
        alignment = random.choice(["cautionary", "misaligned"])
    else:
        alignment = random.choice(ALIGNMENT_STATUSES)

    overall = round((ethos + logos + pathos) / 3.0, 4)
    if overall >= 0.75:
        phronesis = random.choice(["established", "exemplary"])
    elif overall >= 0.55:
        phronesis = "developing"
    else:
        phronesis = "undetermined"

    message = random.choice(SAMPLE_MESSAGES)
    message_hash = hashlib.sha256(
        f"{agent_id}-{eval_index}-{uuid.uuid4()}".encode()
    ).hexdigest()

    intent = IntentClassification(
        rhetorical_mode=random.choice(RHETORICAL_MODES),
        primary_intent=random.choice(PRIMARY_INTENTS),
        cost_to_reader="none",
        stakes_reality="real",
        proportionality="proportional",
        persona_type=random.choice(PERSONA_TYPES),
        relational_quality=random.choice(RELATIONAL_QUALITIES),
    )

    result = EvaluationResult(
        evaluation_id=str(uuid.uuid4()),
        ethos=ethos,
        logos=logos,
        pathos=pathos,
        flags=flags,
        phronesis=phronesis,
        traits=traits,
        detected_indicators=[],
        routing_tier="standard",
        keyword_density=round(random.uniform(0.0, 0.05), 4),
        model_used="claude-sonnet-4-5-20250929",
        agent_model=random.choice(MODELS),
        alignment_status=alignment,
        direction=random.choice(DIRECTIONS),
        confidence=round(random.uniform(0.7, 1.0), 4),
        intent_classification=intent,
        scoring_reasoning=f"Synthetic evaluation {eval_index + 1} for demo seeding.",
    )

    return result, message_hash, message


async def _clear_synthetic_agents(service: GraphService) -> int:
    """Remove all Agent nodes and their evaluations (full wipe)."""
    records, _, _ = await service.execute_query(
        "MATCH (a:Agent) "
        "OPTIONAL MATCH (a)-[:EVALUATED]->(e:Evaluation) "
        "OPTIONAL MATCH (e)-[r]-() "
        "DELETE r, e "
        "WITH a "
        "OPTIONAL MATCH (a)-[ar]-() "
        "DELETE ar, a "
        "RETURN count(a) AS removed"
    )
    return records[0]["removed"] if records else 0


async def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed 100 synthetic agents with 5 evaluations each"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=100,
        help="Number of agents to create (default: 100)",
    )
    parser.add_argument(
        "--evals", type=int, default=5, help="Evaluations per agent (default: 5)"
    )
    parser.add_argument(
        "--clear", action="store_true", help="Clear all existing agents before seeding"
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.WARNING)

    service = GraphService()
    await service.connect()

    if not service.connected:
        print("ERROR: Cannot connect to Neo4j. Is Docker running?", file=sys.stderr)
        sys.exit(1)

    print("Connected to Neo4j")

    try:
        if args.clear:
            removed = await _clear_synthetic_agents(service)
            print(f"Cleared {removed} existing agent nodes")

        total_evals = args.count * args.evals
        print(
            f"\nSeeding {args.count} agents x {args.evals} evaluations = {total_evals} total evaluations"
        )
        print("No API calls needed (synthetic data)\n")

        created = 0
        for i in range(args.count):
            agent_id, agent_name = _generate_agent_name(i)
            specialty = random.choice(SPECIALTIES)
            profile = _pick_profile()

            for j in range(args.evals):
                result, message_hash, message_content = _build_evaluation(
                    profile, j, agent_id
                )

                await store_evaluation(
                    service=service,
                    agent_id=agent_id,
                    result=result,
                    message_hash=message_hash,
                    message_content=message_content,
                    phronesis=result.phronesis,
                    agent_name=agent_name,
                    agent_specialty=specialty,
                    direction=result.direction,
                )
                created += 1

            progress = f"[{i + 1}/{args.count}]"
            print(f"  {progress} {agent_name} ({profile['name']}) - {specialty}")

        print(f"\nDone. Created {created} evaluations across {args.count} agents.")

    finally:
        await service.close()
        print("Neo4j connection closed.")


if __name__ == "__main__":
    asyncio.run(main())
