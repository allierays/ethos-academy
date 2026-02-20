"""Tests for key regeneration domain function.

Tests the extracted regenerate_agent_key function from enrollment/service.py.
Mocks graph and email/SMS services to test without live infrastructure.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from ethos_academy.enrollment.service import regenerate_agent_key
from ethos_academy.shared.errors import EnrollmentError


# ── Helpers ──────────────────────────────────────────────────────────


def _mock_graph(connected=True, **query_results):
    """Create a mock graph context manager.

    query_results maps call index to return value (list of records).
    """
    call_count = 0
    results_list = list(query_results.values()) if query_results else []

    async def mock_execute(query, params=None):
        nonlocal call_count
        if call_count < len(results_list):
            records = results_list[call_count]
        else:
            records = []
        call_count += 1
        return (records, None, None)

    class MockService:
        connected = connected

        async def execute_query(self, query, params=None):
            return await mock_execute(query, params)

    class MockCtx:
        async def __aenter__(self):
            return MockService()

        async def __aexit__(self, *args):
            pass

    return MockCtx


# ── Tests ────────────────────────────────────────────────────────────


class TestRegenerateAgentKeyAuthenticated:
    @pytest.mark.asyncio
    async def test_admin_generates_new_key(self):
        """Admin user can generate a new key directly."""
        with patch("ethos_academy.enrollment.service.graph_context") as mock_gc:
            service = AsyncMock()
            service.connected = True
            # agent_has_key returns True
            service.execute_query = AsyncMock(
                side_effect=[
                    ([{"has_key": True}], None, None),  # agent_has_key
                    ([{"agent_id": "test"}], None, None),  # replace_agent_key
                    ([], None, None),  # clear_email_recovery
                    ([], None, None),  # clear_sms_recovery
                ]
            )
            mock_gc.return_value.__aenter__ = AsyncMock(return_value=service)
            mock_gc.return_value.__aexit__ = AsyncMock(return_value=False)

            result = await regenerate_agent_key(
                agent_id="test-agent",
                is_admin=True,
            )

        assert "api_key" in result
        assert result["api_key"].startswith("ea_")
        assert result["agent_id"] == "test-agent"


class TestRegenerateAgentKeyFirstTime:
    @pytest.mark.asyncio
    async def test_first_time_generates_key(self):
        """Agent with no key gets one without auth."""
        with patch("ethos_academy.enrollment.service.graph_context") as mock_gc:
            service = AsyncMock()
            service.connected = True
            service.execute_query = AsyncMock(
                side_effect=[
                    ([], None, None),  # agent_has_key: no key
                    ([{"agent_id": "new-agent"}], None, None),  # store_agent_key
                ]
            )
            mock_gc.return_value.__aenter__ = AsyncMock(return_value=service)
            mock_gc.return_value.__aexit__ = AsyncMock(return_value=False)

            result = await regenerate_agent_key(
                agent_id="new-agent",
            )

        assert "api_key" in result
        assert result["api_key"].startswith("ea_")


class TestRegenerateAgentKeyGraphUnavailable:
    @pytest.mark.asyncio
    async def test_raises_when_graph_down(self):
        """Raises EnrollmentError when graph is unavailable."""
        with patch("ethos_academy.enrollment.service.graph_context") as mock_gc:
            service = AsyncMock()
            service.connected = False
            mock_gc.return_value.__aenter__ = AsyncMock(return_value=service)
            mock_gc.return_value.__aexit__ = AsyncMock(return_value=False)

            with pytest.raises(EnrollmentError, match="Graph unavailable"):
                await regenerate_agent_key(agent_id="test-agent")
