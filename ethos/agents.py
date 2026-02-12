"""Agent domain functions — list, profile, history, cohort.

DDD layering: API calls these functions, these functions call graph/*.
API never touches graph directly.
"""

from __future__ import annotations

import logging

from ethos.graph.cohort import get_cohort_averages
from ethos.graph.read import get_agent_profile, get_all_agents, get_evaluation_history
from ethos.graph.service import GraphService
from ethos.shared.models import (
    AgentProfile,
    AgentSummary,
    CohortResult,
    EvaluationHistoryItem,
)

logger = logging.getLogger(__name__)

_TRAIT_NAMES = [
    "virtue", "goodwill", "manipulation", "deception",
    "accuracy", "reasoning", "fabrication", "broken_logic",
    "recognition", "compassion", "dismissal", "exploitation",
]


def list_agents() -> list[AgentSummary]:
    """List all agents with evaluation counts. Returns empty list if graph unavailable."""
    try:
        service = GraphService()
        service.connect()
        raw = get_all_agents(service)
        service.close()
        return [
            AgentSummary(
                agent_id=a.get("agent_id", ""),
                evaluation_count=a.get("evaluation_count", 0),
                latest_alignment_status=a.get("latest_alignment_status", "unknown"),
            )
            for a in raw
        ]
    except Exception as exc:
        logger.warning("Failed to list agents: %s", exc)
        return []


def get_agent(agent_id: str) -> AgentProfile:
    """Get agent profile with averages. Returns default AgentProfile if unavailable."""
    try:
        service = GraphService()
        service.connect()
        raw = get_agent_profile(service, agent_id)
        service.close()

        if not raw:
            return AgentProfile(agent_id=agent_id)

        return AgentProfile(
            agent_id=raw.get("agent_id", agent_id),
            agent_model=raw.get("agent_model", ""),
            created_at=str(raw.get("created_at", "")),
            evaluation_count=raw.get("evaluation_count", 0),
            dimension_averages=raw.get("dimension_averages", {}),
            trait_averages=raw.get("trait_averages", {}),
            phronesis_trend=raw.get("phronesis_trend", "insufficient_data"),
            alignment_history=raw.get("alignment_history", []),
        )
    except Exception as exc:
        logger.warning("Failed to get agent: %s", exc)
        return AgentProfile(agent_id=agent_id)


def get_agent_history(
    agent_id: str, limit: int = 50
) -> list[EvaluationHistoryItem]:
    """Get evaluation history for an agent. Returns empty list if unavailable."""
    try:
        service = GraphService()
        service.connect()
        raw = get_evaluation_history(service, agent_id, limit=limit)
        service.close()

        items = []
        for e in raw:
            trait_scores = {}
            for trait in _TRAIT_NAMES:
                val = e.get(f"trait_{trait}")
                if val is not None:
                    trait_scores[trait] = round(float(val), 4)

            flags = e.get("flags", [])
            if isinstance(flags, str):
                flags = [flags] if flags else []

            items.append(
                EvaluationHistoryItem(
                    evaluation_id=e.get("evaluation_id", ""),
                    ethos=round(float(e.get("ethos", 0)), 4),
                    logos=round(float(e.get("logos", 0)), 4),
                    pathos=round(float(e.get("pathos", 0)), 4),
                    trust=e.get("phronesis", "unknown"),
                    alignment_status=e.get("alignment_status", "unknown"),
                    flags=flags,
                    created_at=str(e.get("created_at", "")),
                    trait_scores=trait_scores,
                )
            )
        return items
    except Exception as exc:
        logger.warning("Failed to get agent history: %s", exc)
        return []


def get_cohort() -> CohortResult:
    """Get cohort-wide trait averages. Returns default CohortResult if unavailable."""
    try:
        service = GraphService()
        service.connect()
        raw = get_cohort_averages(service)
        service.close()

        if not raw:
            return CohortResult()

        return CohortResult(
            trait_averages=raw.get("trait_averages", {}),
            total_evaluations=raw.get("total_evaluations", 0),
        )
    except Exception as exc:
        logger.warning("Failed to get cohort: %s", exc)
        return CohortResult()
