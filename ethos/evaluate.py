"""Evaluate AI agent messages for honesty, accuracy, and intent.

Full pipeline: scan → prompt → Claude → parse → score → result.
Graph storage is optional — Neo4j down never crashes evaluate().
"""

from __future__ import annotations

import hashlib
import logging
import uuid

from ethos.evaluation.claude_client import call_claude, _get_model
from ethos.evaluation.parser import parse_response
from ethos.evaluation.prompts import build_evaluation_prompt
from ethos.evaluation.scanner import scan_keywords
from ethos.evaluation.scoring import (
    build_trait_scores,
    compute_alignment_status,
    compute_dimensions,
    compute_flags,
    compute_phronesis_level,
    compute_tier_scores,
)
from ethos.graph.read import get_agent_profile, get_evaluation_history
from ethos.graph.service import GraphService
from ethos.graph.write import store_evaluation
from ethos.shared.models import EvaluationResult, GraphContext

logger = logging.getLogger(__name__)


def _build_graph_context(
    service: GraphService, raw_agent_id: str
) -> GraphContext | None:
    """Read agent history from graph to populate GraphContext.

    Returns None if graph is unavailable or agent has no history.
    """
    try:
        profile = get_agent_profile(service, raw_agent_id)
        if not profile:
            return None

        history = get_evaluation_history(service, raw_agent_id, limit=10)

        # Count flagged evaluations in history
        flagged_patterns = []
        alumni_warnings = 0
        for eval_record in history:
            flags = eval_record.get("flags", [])
            if flags:
                alumni_warnings += 1
                for flag in flags:
                    if flag not in flagged_patterns:
                        flagged_patterns.append(flag)

        return GraphContext(
            prior_evaluations=profile.get("evaluation_count", 0),
            historical_phronesis=profile.get("dimension_averages", {}).get("ethos"),
            phronesis_trend=profile.get("alignment_history", ["insufficient_data"])[0]
            if profile.get("alignment_history")
            else "insufficient_data",
            flagged_patterns=flagged_patterns,
            alumni_warnings=alumni_warnings,
        )
    except Exception as exc:
        logger.warning("Failed to build graph context: %s", exc)
        return None


def _try_store_evaluation(
    service: GraphService,
    raw_agent_id: str,
    result: EvaluationResult,
    text: str,
    phronesis: str,
    agent_name: str = "",
    agent_specialty: str = "",
) -> None:
    """Attempt to store evaluation in graph. Non-fatal on failure."""
    try:
        message_hash = hashlib.sha256(text.encode()).hexdigest()
        store_evaluation(
            service=service,
            raw_agent_id=raw_agent_id,
            result=result,
            message_hash=message_hash,
            phronesis=phronesis,
            agent_name=agent_name,
            agent_specialty=agent_specialty,
        )
    except Exception as exc:
        logger.warning("Failed to store evaluation in graph: %s", exc)


def evaluate(
    text: str,
    source: str | None = None,
    source_name: str = "",
    agent_specialty: str = "",
) -> EvaluationResult:
    """Evaluate text for honesty, accuracy, and intent across ethos, logos, and pathos.

    Pipeline:
        1. scan_keywords(text) → routing tier
        2. build_evaluation_prompt(text, scan, tier) → system + user prompts
        3. call_claude(system, user, tier) → raw JSON text
        4. parse_response(raw) → trait_scores, indicators, phronesis, alignment
        5. Deterministic scoring → dimensions, tiers, alignment, phronesis, flags
        6. If source: read graph context, store evaluation

    Args:
        text: The text to evaluate.
        source: Optional source agent identifier for graph tracking.
        source_name: Optional human-readable agent name for display.

    Returns:
        EvaluationResult with scores and alignment flags.
    """
    evaluation_id = str(uuid.uuid4())

    # ── Step 1: Keyword scan ─────────────────────────────────────
    scan_result = scan_keywords(text)
    tier = scan_result.routing_tier
    has_hard_constraint = tier == "deep_with_context"

    # ── Step 2: Build prompts ────────────────────────────────────
    system_prompt, user_prompt = build_evaluation_prompt(text, scan_result, tier)

    # ── Step 3: Call Claude ──────────────────────────────────────
    raw_response = call_claude(system_prompt, user_prompt, tier)

    # ── Step 4: Parse response ───────────────────────────────────
    parsed = parse_response(raw_response)

    # ── Step 5: Deterministic scoring ────────────────────────────
    traits = build_trait_scores(parsed["trait_scores"])
    dimensions = compute_dimensions(traits)
    tier_scores = compute_tier_scores(traits)
    alignment_status = compute_alignment_status(tier_scores, has_hard_constraint)
    phronesis = compute_phronesis_level(dimensions, alignment_status)
    flags = compute_flags(traits, {})  # No custom priorities yet

    # ── Step 6: Build result ─────────────────────────────────────
    model_used = _get_model(tier)

    result = EvaluationResult(
        evaluation_id=evaluation_id,
        ethos=round(dimensions.get("ethos", 0.0), 4),
        logos=round(dimensions.get("logos", 0.0), 4),
        pathos=round(dimensions.get("pathos", 0.0), 4),
        phronesis=parsed["overall_trust"],
        alignment_status=alignment_status,
        traits=traits,
        detected_indicators=parsed["detected_indicators"],
        tier_scores=tier_scores,
        flags=flags,
        routing_tier=tier,
        keyword_density=scan_result.density,
        model_used=model_used,
    )

    # ── Step 7: Graph operations (optional) ──────────────────────
    graph_context = None
    if source:
        try:
            service = GraphService()
            service.connect()

            graph_context = _build_graph_context(service, source)
            _try_store_evaluation(
                service, source, result, text, phronesis,
                agent_name=source_name,
                agent_specialty=agent_specialty,
            )

            service.close()
        except Exception as exc:
            logger.warning("Graph operations failed: %s", exc)

    if graph_context is not None:
        result.graph_context = graph_context

    return result
