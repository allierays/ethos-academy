"""Tests for new/enhanced MCP insight tools.

Tests: list_all_agents sorting, search_evaluations, get_alumni_insights, get_agent_deep_dive.
All tests mock the graph layer. Never call real Neo4j in tests.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock, patch

from ethos_academy.agents import _sort_agents, list_agents
from ethos_academy.graph_insights import (
    get_agent_deep_dive,
    get_alumni_insights,
    search_evaluations_insight,
)
from ethos_academy.shared.models import AgentSummary


# ── Helpers ──────────────────────────────────────────────────────────


def _mock_graph_context(connected=True):
    """Create a mock async graph_context context manager."""
    mock_service = MagicMock()
    mock_service.connected = connected

    @asynccontextmanager
    async def mock_ctx():
        yield mock_service

    return mock_ctx, mock_service


def _make_agent(
    agent_id: str,
    eval_count: int = 10,
    alignment_rate: float = 0.8,
    ethos: float = 0.7,
    logos: float = 0.8,
    pathos: float = 0.6,
) -> AgentSummary:
    return AgentSummary(
        agent_id=agent_id,
        agent_name=agent_id,
        evaluation_count=eval_count,
        alignment_rate=alignment_rate,
        dimension_averages={"ethos": ethos, "logos": logos, "pathos": pathos},
        trait_averages={"virtue": 0.7, "manipulation": 0.2},
    )


# ── _sort_agents tests ──────────────────────────────────────────────


class TestSortAgents:
    def test_sort_by_evaluation_count_desc(self):
        agents = [_make_agent("a", eval_count=5), _make_agent("b", eval_count=10)]
        result = _sort_agents(agents, "evaluation_count", reverse=True)
        assert result[0].agent_id == "b"

    def test_sort_by_alignment_rate_asc(self):
        agents = [
            _make_agent("high", alignment_rate=0.9),
            _make_agent("low", alignment_rate=0.3),
        ]
        result = _sort_agents(agents, "alignment_rate", reverse=False)
        assert result[0].agent_id == "low"

    def test_sort_by_ethos(self):
        agents = [
            _make_agent("low", ethos=0.3),
            _make_agent("high", ethos=0.9),
        ]
        result = _sort_agents(agents, "ethos", reverse=True)
        assert result[0].agent_id == "high"

    def test_sort_by_phronesis(self):
        agents = [
            _make_agent("low", ethos=0.3, logos=0.3, pathos=0.3),
            _make_agent("high", ethos=0.9, logos=0.9, pathos=0.9),
        ]
        result = _sort_agents(agents, "phronesis", reverse=True)
        assert result[0].agent_id == "high"

    def test_sort_by_trait_name(self):
        a1 = _make_agent("a")
        a1.trait_averages = {"manipulation": 0.1}
        a2 = _make_agent("b")
        a2.trait_averages = {"manipulation": 0.8}
        result = _sort_agents([a1, a2], "manipulation", reverse=True)
        assert result[0].agent_id == "b"

    def test_unknown_sort_defaults_to_eval_count(self):
        agents = [_make_agent("a", eval_count=5), _make_agent("b", eval_count=10)]
        result = _sort_agents(agents, "nonexistent_field", reverse=True)
        assert result[0].agent_id == "b"


# ── list_agents with sorting tests ───────────────────────────────────


class TestListAgentsSorting:
    async def test_returns_sorted_by_alignment_rate(self):
        mock_ctx, _ = _mock_graph_context(connected=True)
        raw_agents = [
            {
                "agent_id": "low-align",
                "agent_name": "Low",
                "evaluation_count": 5,
                "latest_alignment_status": "drifting",
                "alignment_rate": 0.3,
                "avg_ethos": 0.5,
                "avg_logos": 0.5,
                "avg_pathos": 0.5,
                "trait_averages": {},
            },
            {
                "agent_id": "high-align",
                "agent_name": "High",
                "evaluation_count": 5,
                "latest_alignment_status": "aligned",
                "alignment_rate": 0.9,
                "avg_ethos": 0.8,
                "avg_logos": 0.8,
                "avg_pathos": 0.8,
                "trait_averages": {},
            },
        ]

        with (
            patch("ethos_academy.agents.graph_context", mock_ctx),
            patch(
                "ethos_academy.agents.get_all_agents",
                new_callable=AsyncMock,
                return_value=raw_agents,
            ),
        ):
            result = await list_agents(sort_by="alignment_rate", order="desc")

        assert len(result) == 2
        assert result[0].agent_id == "high-align"
        assert result[0].alignment_rate == 0.9

    async def test_limit_works(self):
        mock_ctx, _ = _mock_graph_context(connected=True)
        raw_agents = [
            {"agent_id": f"agent-{i}", "evaluation_count": i, "trait_averages": {}}
            for i in range(5)
        ]

        with (
            patch("ethos_academy.agents.graph_context", mock_ctx),
            patch(
                "ethos_academy.agents.get_all_agents",
                new_callable=AsyncMock,
                return_value=raw_agents,
            ),
        ):
            result = await list_agents(
                sort_by="evaluation_count", order="desc", limit=2
            )

        assert len(result) == 2


# ── search_evaluations_insight tests ─────────────────────────────────


class TestSearchEvaluationsInsight:
    async def test_single_eval_lookup(self):
        mock_ctx, _ = _mock_graph_context(connected=True)
        mock_eval = {
            "evaluation_id": "eval-1",
            "ethos": 0.8,
            "flags": ["manipulation"],
        }

        with (
            patch("ethos_academy.graph_insights.graph_context", mock_ctx),
            patch(
                "ethos_academy.graph_insights.get_evaluation_by_id",
                new_callable=AsyncMock,
                return_value=mock_eval,
            ),
        ):
            result = await search_evaluations_insight(evaluation_id="eval-1")

        assert result["total_count"] == 1
        assert result["flagged_count"] == 1
        assert result["results"][0]["evaluation_id"] == "eval-1"

    async def test_single_eval_not_found(self):
        mock_ctx, _ = _mock_graph_context(connected=True)

        with (
            patch("ethos_academy.graph_insights.graph_context", mock_ctx),
            patch(
                "ethos_academy.graph_insights.get_evaluation_by_id",
                new_callable=AsyncMock,
                return_value=None,
            ),
        ):
            result = await search_evaluations_insight(evaluation_id="nonexistent")

        assert result["total_count"] == 0
        assert result["results"] == []

    async def test_search_by_alignment_status(self):
        mock_ctx, _ = _mock_graph_context(connected=True)
        items = [
            {"evaluation_id": "e1", "flags": [], "alignment_status": "misaligned"},
        ]

        with (
            patch("ethos_academy.graph_insights.graph_context", mock_ctx),
            patch(
                "ethos_academy.graph_insights.resolve_agent_id",
                new_callable=AsyncMock,
                return_value="agent-1",
            ),
            patch(
                "ethos_academy.graph_insights.search_evaluations",
                new_callable=AsyncMock,
                return_value=(items, 1),
            ),
        ):
            result = await search_evaluations_insight(
                agent_id="agent-1", alignment_status="misaligned"
            )

        assert result["total_count"] == 1
        assert result["clean_count"] == 1  # empty flags list is clean

    async def test_handles_graph_failure(self):
        @asynccontextmanager
        async def failing_ctx():
            raise RuntimeError("Connection refused")
            yield  # noqa: unreachable

        with patch("ethos_academy.graph_insights.graph_context", failing_ctx):
            result = await search_evaluations_insight(query="test")

        assert result["total_count"] == 0
        assert result["results"] == []


# ── get_alumni_insights tests ────────────────────────────────────────


class TestGetAlumniInsights:
    async def test_returns_all_sections(self):
        mock_ctx, _ = _mock_graph_context(connected=True)

        with (
            patch("ethos_academy.graph_insights.graph_context", mock_ctx),
            patch(
                "ethos_academy.graph_insights.get_depth_distribution",
                new_callable=AsyncMock,
                return_value={
                    "tiers": [{"tier": "STANDARD", "count": 10}],
                    "statuses": [{"status": "aligned", "count": 8}],
                },
            ),
            patch(
                "ethos_academy.graph_insights.get_indicator_frequency",
                new_callable=AsyncMock,
                return_value=[
                    {"indicator_id": "IND-001", "name": "Test", "detection_count": 5}
                ],
            ),
            patch(
                "ethos_academy.graph_insights.get_alumni_balance_distribution",
                new_callable=AsyncMock,
                return_value={"balanced": 5, "moderate": 3, "lopsided": 1},
            ),
            patch(
                "ethos_academy.graph_insights.get_balance_vs_phronesis",
                new_callable=AsyncMock,
                return_value=[{"balance_category": "balanced", "avg_phronesis": 0.8}],
            ),
            patch(
                "ethos_academy.graph_insights.get_dimension_correlation",
                new_callable=AsyncMock,
                return_value={
                    "r_ethos_logos": 0.7,
                    "r_ethos_pathos": 0.6,
                    "r_logos_pathos": 0.5,
                },
            ),
            patch(
                "ethos_academy.graph_insights.get_dimension_gaps",
                new_callable=AsyncMock,
                return_value=[
                    {"agent_id": "a1", "weak_dimension": "pathos", "gap_size": 0.25}
                ],
            ),
            patch(
                "ethos_academy.graph_insights.get_alumni_trend_data",
                new_callable=AsyncMock,
                return_value={
                    "direction": "improving",
                    "early_half": {"avg_ethos": 0.6},
                    "recent_half": {"avg_ethos": 0.8},
                },
            ),
        ):
            result = await get_alumni_insights()

        assert "alignment_distribution" in result
        assert "tier_distribution" in result
        assert "indicator_frequency" in result
        assert "balance" in result
        assert "alumni_trend" in result
        assert result["alignment_distribution"][0]["status"] == "aligned"
        assert result["alumni_trend"]["direction"] == "improving"

    async def test_handles_graph_failure(self):
        @asynccontextmanager
        async def failing_ctx():
            raise RuntimeError("Connection refused")
            yield  # noqa: unreachable

        with patch("ethos_academy.graph_insights.graph_context", failing_ctx):
            result = await get_alumni_insights()

        assert result["alignment_distribution"] == []
        assert result["alumni_trend"] == {}


# ── get_agent_deep_dive tests ────────────────────────────────────────


class TestGetAgentDeepDive:
    async def test_returns_all_sections(self):
        mock_ctx, _ = _mock_graph_context(connected=True)

        with (
            patch("ethos_academy.graph_insights.graph_context", mock_ctx),
            patch(
                "ethos_academy.graph_insights.resolve_agent_id",
                new_callable=AsyncMock,
                return_value="test-agent",
            ),
            patch(
                "ethos_academy.graph_insights.get_agent_highlights",
                new_callable=AsyncMock,
                return_value={
                    "exemplary": [{"evaluation_id": "e1", "overall": 0.9}],
                    "concerning": [],
                },
            ),
            patch(
                "ethos_academy.graph_insights.get_agent_balance",
                new_callable=AsyncMock,
                return_value={
                    "avg_ethos": 0.8,
                    "avg_logos": 0.7,
                    "avg_pathos": 0.6,
                    "spread": 0.2,
                    "balance_category": "moderate",
                },
            ),
            patch(
                "ethos_academy.graph_insights.get_agent_signature",
                new_callable=AsyncMock,
                return_value={
                    "std_ethos": 0.05,
                    "std_logos": 0.08,
                    "std_pathos": 0.06,
                    "stored_variance": 0.1,
                    "stored_balance": 0.85,
                },
            ),
            patch(
                "ethos_academy.graph_insights.get_exam_dimensions",
                new_callable=AsyncMock,
                return_value={
                    "avg_ethos": 0.75,
                    "avg_logos": 0.65,
                    "avg_pathos": 0.55,
                },
            ),
            patch(
                "ethos_academy.graph_insights.get_agent_profile",
                new_callable=AsyncMock,
                return_value={
                    "dimension_averages": {"ethos": 0.8, "logos": 0.7, "pathos": 0.6},
                },
            ),
        ):
            result = await get_agent_deep_dive("test-agent")

        assert result["agent_id"] == "test-agent"
        assert "highlights" in result
        assert result["highlights"]["exemplary"][0]["evaluation_id"] == "e1"
        assert "balance" in result
        assert result["balance"]["balance_category"] == "moderate"
        assert "consistency" in result
        assert result["consistency"]["std_ethos"] == 0.05
        assert "narrative_gap" in result
        assert result["narrative_gap"]["verdict"] in (
            "consistent",
            "minor_gap",
            "significant_gap",
        )

    async def test_narrative_gap_without_exam(self):
        mock_ctx, _ = _mock_graph_context(connected=True)

        with (
            patch("ethos_academy.graph_insights.graph_context", mock_ctx),
            patch(
                "ethos_academy.graph_insights.resolve_agent_id",
                new_callable=AsyncMock,
                return_value="no-exam-agent",
            ),
            patch(
                "ethos_academy.graph_insights.get_agent_highlights",
                new_callable=AsyncMock,
                return_value={"exemplary": [], "concerning": []},
            ),
            patch(
                "ethos_academy.graph_insights.get_agent_balance",
                new_callable=AsyncMock,
                return_value={},
            ),
            patch(
                "ethos_academy.graph_insights.get_agent_signature",
                new_callable=AsyncMock,
                return_value={},
            ),
            patch(
                "ethos_academy.graph_insights.get_exam_dimensions",
                new_callable=AsyncMock,
                return_value={},
            ),
            patch(
                "ethos_academy.graph_insights.get_agent_profile",
                new_callable=AsyncMock,
                return_value={
                    "dimension_averages": {"ethos": 0.8, "logos": 0.7, "pathos": 0.6}
                },
            ),
        ):
            result = await get_agent_deep_dive("no-exam-agent")

        # No exam data means no narrative gap
        assert result["narrative_gap"] == {}
        assert result["consistency"] == {}

    async def test_handles_graph_failure(self):
        @asynccontextmanager
        async def failing_ctx():
            raise RuntimeError("Connection refused")
            yield  # noqa: unreachable

        with patch("ethos_academy.graph_insights.graph_context", failing_ctx):
            result = await get_agent_deep_dive("test-agent")

        assert result["agent_id"] == "test-agent"
        assert result["highlights"] == {"exemplary": [], "concerning": []}
        assert result["balance"] == {}
