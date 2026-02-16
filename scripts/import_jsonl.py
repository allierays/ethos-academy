"""Import JSONL evaluation results into the local Neo4j graph.

Usage:
    uv run python -m scripts.import_jsonl --agent Clawdie
    uv run python -m scripts.import_jsonl --all
    uv run python -m scripts.import_jsonl --agent Clawdie --agent DogJarvis
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
from pathlib import Path

from ethos_academy.graph.service import graph_context
from ethos_academy.graph.write import store_evaluation
from ethos_academy.shared.models import (
    DetectedIndicator,
    EvaluationResult,
    IntentClassification,
    TraitScore,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

JSONL_PATH = Path("data/results/batch_all.jsonl")

# Map indicator ID prefix to trait name
PREFIX_TO_TRAIT = {
    "VIR": "virtue",
    "GDW": "goodwill",
    "MAN": "manipulation",
    "DEC": "deception",
    "ACC": "accuracy",
    "RSN": "reasoning",
    "FAB": "fabrication",
    "BLG": "broken_logic",
    "REC": "recognition",
    "CMP": "compassion",
    "DIS": "dismissal",
    "EXP": "exploitation",
}

# Map trait name to dimension
TRAIT_TO_DIMENSION = {
    "virtue": "ethos",
    "goodwill": "ethos",
    "manipulation": "ethos",
    "deception": "ethos",
    "accuracy": "logos",
    "reasoning": "logos",
    "fabrication": "logos",
    "broken_logic": "logos",
    "recognition": "pathos",
    "compassion": "pathos",
    "dismissal": "pathos",
    "exploitation": "pathos",
}

# Map trait name to polarity
TRAIT_POLARITY = {
    "virtue": "protective",
    "goodwill": "protective",
    "manipulation": "threat",
    "deception": "threat",
    "accuracy": "protective",
    "reasoning": "protective",
    "fabrication": "threat",
    "broken_logic": "threat",
    "recognition": "protective",
    "compassion": "protective",
    "dismissal": "threat",
    "exploitation": "threat",
}


def trait_from_id(indicator_id: str) -> str:
    prefix = indicator_id.split("-")[0] if "-" in indicator_id else ""
    return PREFIX_TO_TRAIT.get(prefix, "unknown")


def build_evaluation_result(eval_data: dict) -> EvaluationResult:
    """Reconstruct an EvaluationResult from JSONL evaluation data."""
    raw_traits = eval_data.get("traits", {})
    traits: dict[str, TraitScore] = {}
    for name, score in raw_traits.items():
        traits[name] = TraitScore(
            name=name,
            dimension=TRAIT_TO_DIMENSION.get(name, "unknown"),
            polarity=TRAIT_POLARITY.get(name, "unknown"),
            score=score,
        )

    raw_indicators = eval_data.get("detected_indicators", [])
    indicators: list[DetectedIndicator] = []
    for ind in raw_indicators:
        indicators.append(
            DetectedIndicator(
                id=ind.get("id", ""),
                name=ind.get("name", ""),
                trait=ind.get("trait", trait_from_id(ind.get("id", ""))),
                confidence=ind.get("confidence", 0.0),
                severity=ind.get("severity", ind.get("confidence", 0.0)),
                evidence=ind.get("evidence", ""),
            )
        )

    intent_data = eval_data.get("intent_classification")
    intent = IntentClassification(**intent_data) if intent_data else None

    return EvaluationResult(
        evaluation_id=eval_data.get("evaluation_id", ""),
        ethos=eval_data.get("ethos", 0.0),
        logos=eval_data.get("logos", 0.0),
        pathos=eval_data.get("pathos", 0.0),
        phronesis=eval_data.get("phronesis", "unknown"),
        alignment_status=eval_data.get("alignment_status", "unknown"),
        flags=eval_data.get("flags", []),
        traits=traits,
        detected_indicators=indicators,
        routing_tier=eval_data.get("routing_tier", "standard"),
        keyword_density=eval_data.get("keyword_density", 0.0),
        model_used=eval_data.get("model_used", ""),
        intent_classification=intent,
        scoring_reasoning=eval_data.get("scoring_reasoning", ""),
    )


async def import_entries(entries: list[dict]) -> int:
    """Import a list of JSONL entries into the graph. Returns count imported."""
    imported = 0
    async with graph_context() as service:
        if not service.connected:
            logger.error("Cannot connect to Neo4j")
            return 0

        for entry in entries:
            eval_data = entry["evaluation"]
            result = build_evaluation_result(eval_data)
            agent_id = entry.get("author_name", "")
            content = entry.get("content", entry.get("content_preview", ""))

            try:
                await store_evaluation(
                    service,
                    agent_id=agent_id,
                    result=result,
                    message_hash=entry.get("content_hash", ""),
                    message_content=content,
                    phronesis=eval_data.get("phronesis", "unknown"),
                    agent_name=entry.get("author_name", ""),
                    message_timestamp=entry.get("created_at", ""),
                    direction="outbound",
                )
                imported += 1
                logger.info(
                    "Imported: %s | %s | %s",
                    agent_id,
                    eval_data.get("alignment_status"),
                    entry.get("post_title", "")[:50],
                )
            except Exception as exc:
                logger.error("Failed to import %s: %s", agent_id, exc)

    return imported


def load_entries(agents: list[str] | None = None) -> list[dict]:
    """Load JSONL entries, optionally filtered by agent name."""
    entries = []
    with open(JSONL_PATH) as f:
        for line in f:
            entry = json.loads(line)
            if agents is None or entry.get("author_name") in agents:
                entries.append(entry)
    return entries


async def main():
    parser = argparse.ArgumentParser(description="Import JSONL evaluations into Neo4j")
    parser.add_argument("--agent", action="append", help="Agent name(s) to import")
    parser.add_argument("--all", action="store_true", help="Import all agents")
    args = parser.parse_args()

    if not args.all and not args.agent:
        parser.error("Specify --agent NAME or --all")

    agents = None if args.all else args.agent
    entries = load_entries(agents)
    logger.info("Found %d entries to import", len(entries))

    if not entries:
        logger.warning("No entries found")
        return

    count = await import_entries(entries)
    logger.info("Imported %d/%d evaluations", count, len(entries))


if __name__ == "__main__":
    asyncio.run(main())
