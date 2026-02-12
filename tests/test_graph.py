"""TDD tests for ethos.graph domain — GraphService, write, read, network.

Unit tests that mock the Neo4j driver. Integration tests live in test_graph_integration.py.
"""

from unittest.mock import MagicMock, AsyncMock, patch

import pytest

from ethos.shared.models import EvaluationResult


# ── GraphService ─────────────────────────────────────────────────────

class TestGraphService:
    """GraphService manages Neo4j driver lifecycle (async)."""

    def test_init_without_config(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        assert gs._driver is None

    async def test_connect_and_close(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        with patch("ethos.graph.service.AsyncGraphDatabase") as mock_gdb:
            mock_driver = AsyncMock()
            mock_gdb.driver.return_value = mock_driver
            await gs.connect(uri="bolt://localhost:7694", user="neo4j", password="password")
            mock_gdb.driver.assert_called_once()
            assert gs._driver is not None
            await gs.close()
            mock_driver.close.assert_called_once()

    async def test_close_when_not_connected(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        await gs.close()  # Should not raise

    async def test_connect_failure_returns_none(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        with patch("ethos.graph.service.AsyncGraphDatabase") as mock_gdb:
            mock_driver = AsyncMock()
            mock_driver.verify_connectivity.side_effect = Exception("Connection refused")
            mock_gdb.driver.return_value = mock_driver
            await gs.connect(uri="bolt://bad:9999", user="neo4j", password="password")
            assert gs._driver is None

    async def test_execute_query_delegates(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        mock_driver = AsyncMock()
        gs._driver = mock_driver
        mock_driver.execute_query.return_value = ([], None, None)
        await gs.execute_query("RETURN 1")
        mock_driver.execute_query.assert_called_once()

    async def test_execute_query_when_not_connected(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await gs.execute_query("RETURN 1")
        assert result == ([], None, None)


# ── write.py ─────────────────────────────────────────────────────────

class TestStoreEvaluation:
    """store_evaluation() merges Agent and Evaluation nodes."""

    async def test_store_calls_execute_query(self):
        from ethos.graph.write import store_evaluation
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.return_value = ([], None, None)

        result = EvaluationResult(
            evaluation_id="eval-123",
            ethos=0.8, logos=0.7, pathos=0.6,
            phronesis="trustworthy",
            routing_tier="standard",
        )
        await store_evaluation(gs, "agent-001", result)
        assert gs._driver.execute_query.called

    async def test_store_graceful_on_failure(self):
        from ethos.graph.write import store_evaluation
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")

        result = EvaluationResult(evaluation_id="eval-456")
        # Should not raise
        await store_evaluation(gs, "agent-001", result)

    async def test_store_when_not_connected(self):
        from ethos.graph.write import store_evaluation
        from ethos.graph.service import GraphService
        gs = GraphService()  # No driver
        result = EvaluationResult(evaluation_id="eval-789")
        # Should not raise
        await store_evaluation(gs, "agent-001", result)

    async def test_store_hashes_agent_id(self):
        from ethos.graph.write import store_evaluation
        from ethos.graph.service import GraphService
        from ethos.identity.hashing import hash_agent_id
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.return_value = ([], None, None)

        result = EvaluationResult(evaluation_id="eval-hash")
        await store_evaluation(gs, "agent-001", result)

        # Check that the agent_id passed to Cypher is hashed
        call_args = gs._driver.execute_query.call_args
        expected_hash = hash_agent_id("agent-001")
        assert expected_hash in str(call_args)


# ── read.py ──────────────────────────────────────────────────────────

class TestGetEvaluationHistory:
    """get_evaluation_history() returns list of evaluation dicts."""

    async def test_returns_list(self):
        from ethos.graph.read import get_evaluation_history
        from ethos.graph.service import GraphService
        gs = GraphService()  # No driver
        result = await get_evaluation_history(gs, "agent-001")
        assert isinstance(result, list)

    async def test_returns_empty_when_not_connected(self):
        from ethos.graph.read import get_evaluation_history
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_evaluation_history(gs, "agent-001")
        assert result == []

    async def test_returns_empty_on_failure(self):
        from ethos.graph.read import get_evaluation_history
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = await get_evaluation_history(gs, "agent-001")
        assert result == []

    async def test_default_limit(self):
        from ethos.graph.read import get_evaluation_history
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.return_value = ([], None, None)
        await get_evaluation_history(gs, "agent-001")
        call_args = str(gs._driver.execute_query.call_args)
        assert "10" in call_args  # default limit=10


class TestGetAgentProfile:
    """get_agent_profile() returns dict with agent stats."""

    async def test_returns_dict(self):
        from ethos.graph.read import get_agent_profile
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_agent_profile(gs, "agent-001")
        assert isinstance(result, dict)

    async def test_returns_empty_when_not_connected(self):
        from ethos.graph.read import get_agent_profile
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_agent_profile(gs, "agent-001")
        assert result == {}

    async def test_returns_empty_on_failure(self):
        from ethos.graph.read import get_agent_profile
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = await get_agent_profile(gs, "agent-001")
        assert result == {}


# ── alumni.py ────────────────────────────────────────────────────────

class TestGetAlumniAverages:
    """get_alumni_averages() returns per-trait averages across all agents."""

    async def test_returns_dict(self):
        from ethos.graph.alumni import get_alumni_averages
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_alumni_averages(gs)
        assert isinstance(result, dict)

    async def test_returns_empty_when_not_connected(self):
        from ethos.graph.alumni import get_alumni_averages
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_alumni_averages(gs)
        assert result == {}

    async def test_returns_empty_on_failure(self):
        from ethos.graph.alumni import get_alumni_averages
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = await get_alumni_averages(gs)
        assert result == {}


# ── balance.py ────────────────────────────────────────────────────────

class TestGetAgentBalance:
    """get_agent_balance() returns dimension balance analysis for one agent."""

    async def test_returns_dict(self):
        from ethos.graph.balance import get_agent_balance
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_agent_balance(gs, "agent-001")
        assert isinstance(result, dict)

    async def test_returns_empty_when_not_connected(self):
        from ethos.graph.balance import get_agent_balance
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_agent_balance(gs, "agent-001")
        assert result == {}

    async def test_returns_empty_on_failure(self):
        from ethos.graph.balance import get_agent_balance
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = await get_agent_balance(gs, "agent-001")
        assert result == {}


class TestGetBalanceVsPhronesis:
    """get_balance_vs_phronesis() returns balance-phronesis correlation across agents."""

    async def test_returns_list(self):
        from ethos.graph.balance import get_balance_vs_phronesis
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_balance_vs_phronesis(gs)
        assert isinstance(result, list)

    async def test_returns_empty_when_not_connected(self):
        from ethos.graph.balance import get_balance_vs_phronesis
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_balance_vs_phronesis(gs)
        assert result == []

    async def test_returns_empty_on_failure(self):
        from ethos.graph.balance import get_balance_vs_phronesis
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = await get_balance_vs_phronesis(gs)
        assert result == []


class TestGetDimensionGaps:
    """get_dimension_gaps() finds agents with significant dimension gaps."""

    async def test_returns_list(self):
        from ethos.graph.balance import get_dimension_gaps
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_dimension_gaps(gs)
        assert isinstance(result, list)

    async def test_returns_empty_when_not_connected(self):
        from ethos.graph.balance import get_dimension_gaps
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_dimension_gaps(gs)
        assert result == []

    async def test_returns_empty_on_failure(self):
        from ethos.graph.balance import get_dimension_gaps
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = await get_dimension_gaps(gs)
        assert result == []


class TestGetAlumniBalanceDistribution:
    """get_alumni_balance_distribution() returns network-wide balance stats."""

    async def test_returns_dict(self):
        from ethos.graph.balance import get_alumni_balance_distribution
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_alumni_balance_distribution(gs)
        assert isinstance(result, dict)

    async def test_returns_empty_when_not_connected(self):
        from ethos.graph.balance import get_alumni_balance_distribution
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = await get_alumni_balance_distribution(gs)
        assert result == {}

    async def test_returns_empty_on_failure(self):
        from ethos.graph.balance import get_alumni_balance_distribution
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = AsyncMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = await get_alumni_balance_distribution(gs)
        assert result == {}


# ── Re-exports ───────────────────────────────────────────────────────

class TestReExports:
    """ethos/graph/__init__.py re-exports GraphService."""

    def test_import_graph_service(self):
        from ethos.graph import GraphService
        assert GraphService is not None
