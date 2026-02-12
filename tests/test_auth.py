"""Tests for API key authentication."""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from api.main import app
from api import rate_limit as rate_limit_module
from ethos.shared.models import EvaluationResult, ReflectionResult


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def _clear_env(monkeypatch):
    """Ensure ETHOS_API_KEY is unset by default."""
    monkeypatch.delenv("ETHOS_API_KEY", raising=False)


@pytest.fixture(autouse=True)
def _clean_rate_limit():
    """Reset rate limiter between tests."""
    rate_limit_module._requests.clear()


@pytest.fixture(autouse=True)
def _mock_domain():
    """Mock domain functions so tests don't need Claude or Neo4j."""
    with (
        patch("api.main.evaluate", return_value=EvaluationResult()),
        patch("api.main.reflect", return_value=ReflectionResult()),
    ):
        yield


class TestDevMode:
    """When ETHOS_API_KEY is not set, all requests pass (dev mode)."""

    def test_evaluate_no_key_configured(self, client):
        resp = client.post("/evaluate", json={"text": "hello"})
        assert resp.status_code == 200

    def test_reflect_no_key_configured(self, client):
        resp = client.post("/reflect", json={"agent_id": "test"})
        assert resp.status_code == 200

    def test_empty_string_key_is_dev_mode(self, client, monkeypatch):
        """ETHOS_API_KEY='' should behave like unset (dev mode)."""
        monkeypatch.setenv("ETHOS_API_KEY", "")
        resp = client.post("/evaluate", json={"text": "hello"})
        assert resp.status_code == 200

    def test_whitespace_only_key_is_dev_mode(self, client, monkeypatch):
        """ETHOS_API_KEY='  ' should behave like unset (dev mode)."""
        monkeypatch.setenv("ETHOS_API_KEY", "   ")
        resp = client.post("/evaluate", json={"text": "hello"})
        assert resp.status_code == 200


class TestAuthEnabled:
    """When ETHOS_API_KEY is set, write endpoints require Bearer token."""

    @pytest.fixture(autouse=True)
    def _set_api_key(self, monkeypatch):
        monkeypatch.setenv("ETHOS_API_KEY", "test-secret-key")

    def test_evaluate_missing_header(self, client):
        resp = client.post("/evaluate", json={"text": "hello"})
        assert resp.status_code == 401
        assert "Invalid or missing API key" in resp.json()["detail"]

    def test_evaluate_wrong_key(self, client):
        resp = client.post(
            "/evaluate",
            json={"text": "hello"},
            headers={"Authorization": "Bearer wrong-key"},
        )
        assert resp.status_code == 401

    def test_evaluate_correct_key(self, client):
        resp = client.post(
            "/evaluate",
            json={"text": "hello"},
            headers={"Authorization": "Bearer test-secret-key"},
        )
        assert resp.status_code == 200

    def test_reflect_missing_header(self, client):
        resp = client.post("/reflect", json={"agent_id": "test"})
        assert resp.status_code == 401

    def test_reflect_correct_key(self, client):
        resp = client.post(
            "/reflect",
            json={"agent_id": "test"},
            headers={"Authorization": "Bearer test-secret-key"},
        )
        assert resp.status_code == 200

    def test_wrong_scheme_token(self, client):
        """'Token xyz' instead of 'Bearer xyz' should be rejected."""
        resp = client.post(
            "/evaluate",
            json={"text": "hello"},
            headers={"Authorization": "Token test-secret-key"},
        )
        assert resp.status_code == 401

    def test_bearer_no_token(self, client):
        """'Bearer' with no token should be rejected."""
        resp = client.post(
            "/evaluate",
            json={"text": "hello"},
            headers={"Authorization": "Bearer"},
        )
        assert resp.status_code == 401

    def test_bearer_space_no_token(self, client):
        """'Bearer ' (trailing space, no token) should be rejected."""
        resp = client.post(
            "/evaluate",
            json={"text": "hello"},
            headers={"Authorization": "Bearer "},
        )
        assert resp.status_code == 401

    def test_key_with_extra_whitespace(self, client):
        """Extra spaces around the key should not bypass auth."""
        resp = client.post(
            "/evaluate",
            json={"text": "hello"},
            headers={"Authorization": "Bearer  test-secret-key"},
        )
        assert resp.status_code == 401


class TestGetEndpointsPublic:
    """GET endpoints remain public regardless of auth config."""

    @pytest.fixture(autouse=True)
    def _set_api_key(self, monkeypatch):
        monkeypatch.setenv("ETHOS_API_KEY", "test-secret-key")

    def test_root(self, client):
        assert client.get("/").status_code == 200

    def test_health(self, client):
        assert client.get("/health").status_code == 200

    def test_agents(self, client):
        resp = client.get("/agents")
        assert resp.status_code != 401


class TestRateLimitBeforeAuth:
    """Rate limiting runs before auth — unauthenticated floods still get 429."""

    @pytest.fixture(autouse=True)
    def _set_api_key(self, monkeypatch):
        monkeypatch.setenv("ETHOS_API_KEY", "test-secret-key")
        monkeypatch.setenv("ETHOS_RATE_LIMIT", "3")

    def test_unauthenticated_flood_gets_429(self, client):
        """Spraying bad keys should hit rate limit, not just 401 forever."""
        for _ in range(3):
            resp = client.post("/evaluate", json={"text": "hello"})
            assert resp.status_code == 401

        resp = client.post("/evaluate", json={"text": "hello"})
        assert resp.status_code == 429
