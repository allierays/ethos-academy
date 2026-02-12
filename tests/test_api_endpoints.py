"""Integration tests for API endpoints — agents, history, cohort."""

from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


# ── GET /agents ──────────────────────────────────────────────────────


class TestAgentsEndpoint:
    @patch("ethos.agents.get_all_agents")
    @patch("ethos.agents.GraphService")
    def test_returns_list(self, mock_gs_cls, mock_get_all):
        from unittest.mock import MagicMock

        mock_service = MagicMock()
        mock_gs_cls.return_value = mock_service
        mock_get_all.return_value = [
            {
                "agent_id": "a1",
                "evaluation_count": 3,
                "latest_alignment_status": "aligned",
            }
        ]

        resp = client.get("/agents")

        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["agent_id"] == "a1"
        assert data[0]["evaluation_count"] == 3

    @patch("ethos.agents.GraphService")
    def test_returns_empty_on_failure(self, mock_gs_cls):
        mock_gs_cls.side_effect = RuntimeError("down")

        resp = client.get("/agents")

        assert resp.status_code == 200
        assert resp.json() == []


# ── GET /agent/{agent_id} ────────────────────────────────────────────


class TestAgentEndpoint:
    @patch("ethos.agents.get_agent_profile")
    @patch("ethos.agents.GraphService")
    def test_returns_profile(self, mock_gs_cls, mock_profile):
        from unittest.mock import MagicMock

        mock_service = MagicMock()
        mock_gs_cls.return_value = mock_service
        mock_profile.return_value = {
            "agent_id": "hashed",
            "agent_model": "",
            "created_at": "2024-01-01",
            "evaluation_count": 5,
            "dimension_averages": {"ethos": 0.7, "logos": 0.8, "pathos": 0.6},
            "trait_averages": {"virtue": 0.8},
            "alignment_history": ["aligned"],
        }

        resp = client.get("/agent/test-agent")

        assert resp.status_code == 200
        data = resp.json()
        assert "agent_id" in data
        assert "dimension_averages" in data

    @patch("ethos.agents.get_agent_profile")
    @patch("ethos.agents.GraphService")
    def test_returns_default_for_unknown(self, mock_gs_cls, mock_profile):
        from unittest.mock import MagicMock

        mock_service = MagicMock()
        mock_gs_cls.return_value = mock_service
        mock_profile.return_value = {}

        resp = client.get("/agent/unknown")

        assert resp.status_code == 200
        data = resp.json()
        assert data["agent_id"] == "unknown"
        assert data["evaluation_count"] == 0


# ── GET /agent/{agent_id}/history ────────────────────────────────────


class TestAgentHistoryEndpoint:
    @patch("ethos.agents.get_evaluation_history")
    @patch("ethos.agents.GraphService")
    def test_returns_history(self, mock_gs_cls, mock_history):
        from unittest.mock import MagicMock

        mock_service = MagicMock()
        mock_gs_cls.return_value = mock_service
        mock_history.return_value = [
            {
                "evaluation_id": "e1",
                "ethos": 0.7,
                "logos": 0.8,
                "pathos": 0.6,
                "phronesis": "developing",
                "alignment_status": "aligned",
                "flags": [],
                "created_at": "2024-01-01",
            }
        ]

        resp = client.get("/agent/test/history")

        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 1

    @patch("ethos.agents.GraphService")
    def test_returns_empty_on_failure(self, mock_gs_cls):
        mock_gs_cls.side_effect = RuntimeError("down")

        resp = client.get("/agent/test/history")

        assert resp.status_code == 200
        assert resp.json() == []


# ── GET /cohort ──────────────────────────────────────────────────────


class TestCohortEndpoint:
    @patch("ethos.agents.get_cohort_averages")
    @patch("ethos.agents.GraphService")
    def test_returns_cohort(self, mock_gs_cls, mock_cohort):
        from unittest.mock import MagicMock

        mock_service = MagicMock()
        mock_gs_cls.return_value = mock_service
        mock_cohort.return_value = {
            "trait_averages": {"virtue": 0.7},
            "total_evaluations": 50,
        }

        resp = client.get("/cohort")

        assert resp.status_code == 200
        data = resp.json()
        assert "trait_averages" in data
        assert "total_evaluations" in data
        assert data["total_evaluations"] == 50

    @patch("ethos.agents.GraphService")
    def test_returns_default_on_failure(self, mock_gs_cls):
        mock_gs_cls.side_effect = RuntimeError("down")

        resp = client.get("/cohort")

        assert resp.status_code == 200
        data = resp.json()
        assert data["trait_averages"] == {}
        assert data["total_evaluations"] == 0


# ── POST /reflect (updated with text field) ──────────────────────────


class TestReflectEndpoint:
    @patch("ethos.reflect.GraphService")
    def test_reflect_accepts_text(self, mock_gs_cls):
        from unittest.mock import MagicMock

        mock_service = MagicMock()
        mock_service.connected = False
        mock_gs_cls.return_value = mock_service

        resp = client.post(
            "/reflect",
            json={"agent_id": "test", "text": None},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert "trend" in data
        assert "ethos" in data

    @patch("ethos.reflect.GraphService")
    def test_reflect_without_text(self, mock_gs_cls):
        from unittest.mock import MagicMock

        mock_service = MagicMock()
        mock_service.connected = False
        mock_gs_cls.return_value = mock_service

        resp = client.post(
            "/reflect",
            json={"agent_id": "test"},
        )

        assert resp.status_code == 200


# ── CORS ─────────────────────────────────────────────────────────────


class TestCORS:
    def test_cors_headers_for_localhost_3000(self):
        resp = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert resp.headers.get("access-control-allow-origin") == "http://localhost:3000"
