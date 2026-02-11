"""TDD tests for ethos.graph domain — GraphService, write, read, network.

Unit tests that mock the Neo4j driver. Integration tests live in test_graph_integration.py.
"""

from unittest.mock import MagicMock, patch


from ethos.shared.models import EvaluationResult


# ── GraphService ─────────────────────────────────────────────────────

class TestGraphService:
    """GraphService manages Neo4j driver lifecycle (sync)."""

    def test_init_without_config(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        assert gs._driver is None

    def test_connect_and_close(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        with patch("ethos.graph.service.GraphDatabase") as mock_gdb:
            mock_driver = MagicMock()
            mock_gdb.driver.return_value = mock_driver
            gs.connect(uri="bolt://localhost:7694", user="neo4j", password="password")
            mock_gdb.driver.assert_called_once()
            assert gs._driver is not None
            gs.close()
            mock_driver.close.assert_called_once()

    def test_close_when_not_connected(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs.close()  # Should not raise

    def test_connect_failure_returns_none(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        with patch("ethos.graph.service.GraphDatabase") as mock_gdb:
            mock_gdb.driver.side_effect = Exception("Connection refused")
            gs.connect(uri="bolt://bad:9999", user="neo4j", password="password")
            assert gs._driver is None

    def test_execute_query_delegates(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        mock_driver = MagicMock()
        gs._driver = mock_driver
        mock_driver.execute_query.return_value = ([], None, None)
        gs.execute_query("RETURN 1")
        mock_driver.execute_query.assert_called_once()

    def test_execute_query_when_not_connected(self):
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = gs.execute_query("RETURN 1")
        assert result == ([], None, None)


# ── write.py ─────────────────────────────────────────────────────────

class TestStoreEvaluation:
    """store_evaluation() merges Agent and Evaluation nodes."""

    def test_store_calls_execute_query(self):
        from ethos.graph.write import store_evaluation
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.return_value = ([], None, None)

        result = EvaluationResult(
            evaluation_id="eval-123",
            ethos=0.8, logos=0.7, pathos=0.6,
            trust="trustworthy",
            routing_tier="standard",
        )
        store_evaluation(gs, "agent-001", result)
        assert gs._driver.execute_query.called

    def test_store_graceful_on_failure(self):
        from ethos.graph.write import store_evaluation
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")

        result = EvaluationResult(evaluation_id="eval-456")
        # Should not raise
        store_evaluation(gs, "agent-001", result)

    def test_store_when_not_connected(self):
        from ethos.graph.write import store_evaluation
        from ethos.graph.service import GraphService
        gs = GraphService()  # No driver
        result = EvaluationResult(evaluation_id="eval-789")
        # Should not raise
        store_evaluation(gs, "agent-001", result)

    def test_store_hashes_agent_id(self):
        from ethos.graph.write import store_evaluation
        from ethos.graph.service import GraphService
        from ethos.identity.hashing import hash_agent_id
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.return_value = ([], None, None)

        result = EvaluationResult(evaluation_id="eval-hash")
        store_evaluation(gs, "agent-001", result)

        # Check that the agent_id passed to Cypher is hashed
        call_args = gs._driver.execute_query.call_args
        expected_hash = hash_agent_id("agent-001")
        assert expected_hash in str(call_args)


# ── read.py ──────────────────────────────────────────────────────────

class TestGetEvaluationHistory:
    """get_evaluation_history() returns list of evaluation dicts."""

    def test_returns_list(self):
        from ethos.graph.read import get_evaluation_history
        from ethos.graph.service import GraphService
        gs = GraphService()  # No driver
        result = get_evaluation_history(gs, "agent-001")
        assert isinstance(result, list)

    def test_returns_empty_when_not_connected(self):
        from ethos.graph.read import get_evaluation_history
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_evaluation_history(gs, "agent-001")
        assert result == []

    def test_returns_empty_on_failure(self):
        from ethos.graph.read import get_evaluation_history
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = get_evaluation_history(gs, "agent-001")
        assert result == []

    def test_default_limit(self):
        from ethos.graph.read import get_evaluation_history
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.return_value = ([], None, None)
        get_evaluation_history(gs, "agent-001")
        call_args = str(gs._driver.execute_query.call_args)
        assert "10" in call_args  # default limit=10


class TestGetAgentProfile:
    """get_agent_profile() returns dict with agent stats."""

    def test_returns_dict(self):
        from ethos.graph.read import get_agent_profile
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_agent_profile(gs, "agent-001")
        assert isinstance(result, dict)

    def test_returns_empty_when_not_connected(self):
        from ethos.graph.read import get_agent_profile
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_agent_profile(gs, "agent-001")
        assert result == {}

    def test_returns_empty_on_failure(self):
        from ethos.graph.read import get_agent_profile
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = get_agent_profile(gs, "agent-001")
        assert result == {}


# ── cohort.py ────────────────────────────────────────────────────────

class TestGetCohortAverages:
    """get_cohort_averages() returns per-trait averages across all agents."""

    def test_returns_dict(self):
        from ethos.graph.cohort import get_cohort_averages
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_cohort_averages(gs)
        assert isinstance(result, dict)

    def test_returns_empty_when_not_connected(self):
        from ethos.graph.cohort import get_cohort_averages
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_cohort_averages(gs)
        assert result == {}

    def test_returns_empty_on_failure(self):
        from ethos.graph.cohort import get_cohort_averages
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = get_cohort_averages(gs)
        assert result == {}


# ── balance.py ────────────────────────────────────────────────────────

class TestGetAgentBalance:
    """get_agent_balance() returns dimension balance analysis for one agent."""

    def test_returns_dict(self):
        from ethos.graph.balance import get_agent_balance
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_agent_balance(gs, "agent-001")
        assert isinstance(result, dict)

    def test_returns_empty_when_not_connected(self):
        from ethos.graph.balance import get_agent_balance
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_agent_balance(gs, "agent-001")
        assert result == {}

    def test_returns_empty_on_failure(self):
        from ethos.graph.balance import get_agent_balance
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = get_agent_balance(gs, "agent-001")
        assert result == {}


class TestGetBalanceVsTrust:
    """get_balance_vs_trust() returns balance-trust correlation across agents."""

    def test_returns_list(self):
        from ethos.graph.balance import get_balance_vs_trust
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_balance_vs_trust(gs)
        assert isinstance(result, list)

    def test_returns_empty_when_not_connected(self):
        from ethos.graph.balance import get_balance_vs_trust
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_balance_vs_trust(gs)
        assert result == []

    def test_returns_empty_on_failure(self):
        from ethos.graph.balance import get_balance_vs_trust
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = get_balance_vs_trust(gs)
        assert result == []


class TestGetDimensionGaps:
    """get_dimension_gaps() finds agents with significant dimension gaps."""

    def test_returns_list(self):
        from ethos.graph.balance import get_dimension_gaps
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_dimension_gaps(gs)
        assert isinstance(result, list)

    def test_returns_empty_when_not_connected(self):
        from ethos.graph.balance import get_dimension_gaps
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_dimension_gaps(gs)
        assert result == []

    def test_returns_empty_on_failure(self):
        from ethos.graph.balance import get_dimension_gaps
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = get_dimension_gaps(gs)
        assert result == []


class TestGetCohortBalanceDistribution:
    """get_cohort_balance_distribution() returns network-wide balance stats."""

    def test_returns_dict(self):
        from ethos.graph.balance import get_cohort_balance_distribution
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_cohort_balance_distribution(gs)
        assert isinstance(result, dict)

    def test_returns_empty_when_not_connected(self):
        from ethos.graph.balance import get_cohort_balance_distribution
        from ethos.graph.service import GraphService
        gs = GraphService()
        result = get_cohort_balance_distribution(gs)
        assert result == {}

    def test_returns_empty_on_failure(self):
        from ethos.graph.balance import get_cohort_balance_distribution
        from ethos.graph.service import GraphService
        gs = GraphService()
        gs._driver = MagicMock()
        gs._driver.execute_query.side_effect = Exception("Neo4j down")
        result = get_cohort_balance_distribution(gs)
        assert result == {}


# ── Re-exports ───────────────────────────────────────────────────────

class TestReExports:
    """ethos/graph/__init__.py re-exports GraphService."""

    def test_import_graph_service(self):
        from ethos.graph import GraphService
        assert GraphService is not None
