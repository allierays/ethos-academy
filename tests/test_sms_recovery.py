"""Tests for SMS recovery graph functions in enrollment.py.

Mirrors the email_recovery_* pattern with sms_recovery_* fields.
Mocks GraphService.execute_query to test without a live Neo4j instance.
"""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from ethos_academy.graph.enrollment import (
    clear_sms_recovery,
    get_sms_recovery_status,
    increment_sms_recovery_attempts,
    store_sms_recovery_code,
)
from ethos_academy.graph.service import GraphService


# ── Helpers ──────────────────────────────────────────────────────────


def _make_service(connected: bool = True, records: list | None = None) -> GraphService:
    """Build a mock GraphService with configurable execute_query results."""
    svc = GraphService()
    svc._driver = True if connected else None  # connected property checks _driver
    if records is not None:
        svc.execute_query = AsyncMock(return_value=(records, None, None))
    else:
        svc.execute_query = AsyncMock(return_value=([], None, None))
    return svc


def _make_disconnected_service() -> GraphService:
    """Build a disconnected GraphService."""
    return _make_service(connected=False)


# ── store_sms_recovery_code ──────────────────────────────────────────


class TestStoreSmsRecoveryCode:
    @pytest.mark.asyncio
    async def test_stores_code_and_returns_true(self):
        svc = _make_service(records=[{"agent_id": "agent-1"}])
        result = await store_sms_recovery_code(
            svc, "agent-1", "hashed_code_123", "2026-02-20T00:00:00Z"
        )
        assert result is True
        svc.execute_query.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_returns_false_when_agent_not_found(self):
        svc = _make_service(records=[])
        result = await store_sms_recovery_code(
            svc, "ghost", "hash", "2026-02-20T00:00:00Z"
        )
        assert result is False

    @pytest.mark.asyncio
    async def test_returns_false_when_disconnected(self):
        svc = _make_disconnected_service()
        result = await store_sms_recovery_code(
            svc, "agent-1", "hash", "2026-02-20T00:00:00Z"
        )
        assert result is False

    @pytest.mark.asyncio
    async def test_returns_false_on_graph_error(self):
        svc = _make_service()
        svc.execute_query = AsyncMock(side_effect=Exception("boom"))
        result = await store_sms_recovery_code(
            svc, "agent-1", "hash", "2026-02-20T00:00:00Z"
        )
        assert result is False


# ── get_sms_recovery_status ──────────────────────────────────────────


class TestGetSmsRecoveryStatus:
    @pytest.mark.asyncio
    async def test_returns_status_dict(self):
        svc = _make_service(
            records=[
                {
                    "code_hash": "abc123",
                    "expires": "2026-02-20T00:00:00Z",
                    "attempts": 2,
                }
            ]
        )
        result = await get_sms_recovery_status(svc, "agent-1")
        assert result == {
            "code_hash": "abc123",
            "expires": "2026-02-20T00:00:00Z",
            "attempts": 2,
        }

    @pytest.mark.asyncio
    async def test_defaults_attempts_to_zero(self):
        svc = _make_service(
            records=[
                {
                    "code_hash": "abc123",
                    "expires": "2026-02-20T00:00:00Z",
                    "attempts": 0,
                }
            ]
        )
        result = await get_sms_recovery_status(svc, "agent-1")
        assert result["attempts"] == 0

    @pytest.mark.asyncio
    async def test_returns_empty_dict_when_not_found(self):
        svc = _make_service(records=[])
        result = await get_sms_recovery_status(svc, "ghost")
        assert result == {}

    @pytest.mark.asyncio
    async def test_returns_empty_dict_when_disconnected(self):
        svc = _make_disconnected_service()
        result = await get_sms_recovery_status(svc, "agent-1")
        assert result == {}

    @pytest.mark.asyncio
    async def test_returns_empty_dict_on_graph_error(self):
        svc = _make_service()
        svc.execute_query = AsyncMock(side_effect=Exception("boom"))
        result = await get_sms_recovery_status(svc, "agent-1")
        assert result == {}


# ── increment_sms_recovery_attempts ──────────────────────────────────


class TestIncrementSmsRecoveryAttempts:
    @pytest.mark.asyncio
    async def test_returns_new_attempt_count(self):
        svc = _make_service(records=[{"attempts": 3}])
        result = await increment_sms_recovery_attempts(svc, "agent-1")
        assert result == 3

    @pytest.mark.asyncio
    async def test_returns_zero_when_not_found(self):
        svc = _make_service(records=[])
        result = await increment_sms_recovery_attempts(svc, "ghost")
        assert result == 0

    @pytest.mark.asyncio
    async def test_returns_zero_when_disconnected(self):
        svc = _make_disconnected_service()
        result = await increment_sms_recovery_attempts(svc, "agent-1")
        assert result == 0

    @pytest.mark.asyncio
    async def test_returns_zero_on_graph_error(self):
        svc = _make_service()
        svc.execute_query = AsyncMock(side_effect=Exception("boom"))
        result = await increment_sms_recovery_attempts(svc, "agent-1")
        assert result == 0


# ── clear_sms_recovery ──────────────────────────────────────────────


class TestClearSmsRecovery:
    @pytest.mark.asyncio
    async def test_returns_true_on_success(self):
        svc = _make_service(records=[{"agent_id": "agent-1"}])
        result = await clear_sms_recovery(svc, "agent-1")
        assert result is True

    @pytest.mark.asyncio
    async def test_returns_false_when_not_found(self):
        svc = _make_service(records=[])
        result = await clear_sms_recovery(svc, "ghost")
        assert result is False

    @pytest.mark.asyncio
    async def test_returns_false_when_disconnected(self):
        svc = _make_disconnected_service()
        result = await clear_sms_recovery(svc, "agent-1")
        assert result is False

    @pytest.mark.asyncio
    async def test_returns_false_on_graph_error(self):
        svc = _make_service()
        svc.execute_query = AsyncMock(side_effect=Exception("boom"))
        result = await clear_sms_recovery(svc, "agent-1")
        assert result is False
