"""Insights engine — Opus-powered temporal behavioral analysis.

Fetches agent history + alumni averages from graph, sends to Opus,
returns structured InsightsResult. This is the Opus 4.6 showcase.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from ethos.evaluation.claude_client import call_claude
from ethos.evaluation.insights_prompts import build_insights_prompt
from ethos.graph.alumni import get_alumni_averages
from ethos.graph.read import get_evaluation_history
from ethos.graph.service import GraphService
from ethos.shared.models import Insight, InsightsResult

logger = logging.getLogger(__name__)


def _parse_insights_response(raw: str, agent_id: str) -> InsightsResult:
    """Parse Opus JSON response into InsightsResult."""
    try:
        # Strip markdown fences if present
        text = raw.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove first and last fence lines
            lines = [line for line in lines if not line.strip().startswith("```")]
            text = "\n".join(lines)

        data = json.loads(text)

        insights = []
        for item in data.get("insights", []):
            insights.append(
                Insight(
                    trait=item.get("trait", ""),
                    severity=item.get("severity", "info"),
                    message=item.get("message", ""),
                    evidence=item.get("evidence", {}),
                )
            )

        return InsightsResult(
            agent_id=agent_id,
            generated_at=datetime.now(timezone.utc).isoformat(),
            summary=data.get("summary", ""),
            insights=insights,
            stats=data.get("stats", {}),
        )
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        logger.warning("Failed to parse insights response: %s", exc)
        return InsightsResult(
            agent_id=agent_id,
            generated_at=datetime.now(timezone.utc).isoformat(),
            summary="Failed to parse insights response",
        )


def insights(agent_id: str) -> InsightsResult:
    """Generate Opus-powered behavioral insights for an agent.

    Fetches the agent's last 20 evaluations and alumni averages from
    the graph, sends to Opus for temporal analysis, and returns
    structured InsightsResult.

    Args:
        agent_id: The agent to analyze.

    Returns:
        InsightsResult with summary, insights, and stats.
    """
    generated_at = datetime.now(timezone.utc).isoformat()

    # Connect to graph
    try:
        service = GraphService()
        service.connect()

        if not service.connected:
            return InsightsResult(
                agent_id=agent_id,
                generated_at=generated_at,
                summary="Graph unavailable",
            )

        # Fetch agent history
        evaluations = get_evaluation_history(service, agent_id, limit=20)
        if not evaluations:
            service.close()
            return InsightsResult(
                agent_id=agent_id,
                generated_at=generated_at,
                summary="No evaluation history found",
            )

        # Fetch alumni averages
        alumni_data = get_alumni_averages(service)
        alumni_averages = alumni_data.get("trait_averages", {})

        service.close()
    except Exception as exc:
        logger.warning("Graph unavailable for insights: %s", exc)
        return InsightsResult(
            agent_id=agent_id,
            generated_at=generated_at,
            summary="Graph unavailable",
        )

    # Build prompt and call Opus
    system_prompt, user_prompt = build_insights_prompt(
        agent_id=agent_id,
        evaluations=evaluations,
        alumni_averages=alumni_averages,
    )

    try:
        raw_response = call_claude(system_prompt, user_prompt, tier="deep")
    except Exception as exc:
        logger.warning("Opus insights call failed: %s", exc)
        return InsightsResult(
            agent_id=agent_id,
            generated_at=generated_at,
            summary=f"Insights generation failed: {exc}",
        )

    return _parse_insights_response(raw_response, agent_id)
