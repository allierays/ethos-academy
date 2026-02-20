"""Tests for phone endpoint protection (_check_phone_change_auth).

Verifies first-claim-open, then-require-key behavior for submit_phone and resend_code.
"""

from __future__ import annotations

import hashlib
from unittest.mock import AsyncMock, patch

import pytest

from ethos_academy.phone_service import _check_phone_change_auth
from ethos_academy.graph.service import GraphService
from ethos_academy.shared.errors import VerificationError


# ── Helpers ──────────────────────────────────────────────────────────


def _make_service(connected: bool = True) -> GraphService:
    svc = GraphService()
    svc._driver = True if connected else None
    return svc


# ── _check_phone_change_auth ────────────────────────────────────────


class TestCheckPhoneChangeAuth:
    @pytest.mark.asyncio
    async def test_first_claim_allows_without_key(self):
        """No key, no verified phone: allow access (first claim)."""
        svc = _make_service()
        svc.execute_query = AsyncMock(
            return_value=([{"key_hash": None, "phone_verified": False}], None, None)
        )
        with patch("ethos_academy.phone_service.agent_api_key_var") as mock_var:
            mock_var.get.return_value = None
            await _check_phone_change_auth(svc, "new-agent")

    @pytest.mark.asyncio
    async def test_verified_phone_requires_key(self):
        """Verified phone but no key provided: raise VerificationError."""
        svc = _make_service()
        key_hash = hashlib.sha256(b"ea_test_key").hexdigest()
        svc.execute_query = AsyncMock(
            return_value=([{"key_hash": key_hash, "phone_verified": True}], None, None)
        )
        with patch("ethos_academy.phone_service.agent_api_key_var") as mock_var:
            mock_var.get.return_value = None
            with pytest.raises(VerificationError, match="API key required"):
                await _check_phone_change_auth(svc, "existing-agent")

    @pytest.mark.asyncio
    async def test_wrong_key_raises_error(self):
        """Agent has key, caller provides wrong key: raise VerificationError."""
        svc = _make_service()
        real_hash = hashlib.sha256(b"ea_real_key").hexdigest()
        svc.execute_query = AsyncMock(
            return_value=([{"key_hash": real_hash, "phone_verified": True}], None, None)
        )
        with patch("ethos_academy.phone_service.agent_api_key_var") as mock_var:
            mock_var.get.return_value = "ea_wrong_key"
            with pytest.raises(VerificationError, match="Invalid API key"):
                await _check_phone_change_auth(svc, "existing-agent")

    @pytest.mark.asyncio
    async def test_correct_key_allows_access(self):
        """Agent has key, caller provides correct key: allow access."""
        key = "ea_correct_key"
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        svc = _make_service()
        svc.execute_query = AsyncMock(
            return_value=([{"key_hash": key_hash, "phone_verified": True}], None, None)
        )
        with patch("ethos_academy.phone_service.agent_api_key_var") as mock_var:
            mock_var.get.return_value = key
            await _check_phone_change_auth(svc, "existing-agent")

    @pytest.mark.asyncio
    async def test_has_key_no_phone_requires_auth(self):
        """Agent has key but no verified phone: still require key."""
        svc = _make_service()
        key = "ea_my_key"
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        svc.execute_query = AsyncMock(
            return_value=([{"key_hash": key_hash, "phone_verified": False}], None, None)
        )
        with patch("ethos_academy.phone_service.agent_api_key_var") as mock_var:
            mock_var.get.return_value = None
            with pytest.raises(VerificationError, match="API key required"):
                await _check_phone_change_auth(svc, "keyed-agent")
