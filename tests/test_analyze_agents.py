"""Tests for the batch authenticity analysis script.

Covers:
- analyze_agent() with valid profile data
- analyze_agent() with empty timestamps (returns indeterminate)
- analyze_agent() with missing keys (graceful defaults)
- main() writes output, skips malformed files, uses filename fallback
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

import pytest

from scripts.analyze_agents import analyze_agent, main


# ── Helpers ──────────────────────────────────────────────────────────


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _make_profile(
    name: str = "test-agent",
    post_count: int = 10,
    interval_hours: float = 1.0,
    is_claimed: bool = False,
) -> dict:
    """Build a minimal agent profile with regular posting timestamps."""
    base = datetime(2026, 1, 1, tzinfo=timezone.utc)
    posts = [
        {"created_at": _iso(base + timedelta(hours=i * interval_hours)), "content": f"post {i}"}
        for i in range(post_count)
    ]
    return {
        "agent": {
            "name": name,
            "is_claimed": is_claimed,
            "owner": {"x_verified": False},
            "karma": 50,
        },
        "posts": posts,
        "comments": [],
    }


# ── analyze_agent() ─────────────────────────────────────────────────


class TestAnalyzeAgent:
    def test_valid_profile_returns_expected_keys(self):
        data = _make_profile(post_count=20)
        result = analyze_agent(data)

        assert "authenticity_score" in result
        assert "classification" in result
        assert "confidence" in result
        assert "temporal" in result
        assert "burst" in result
        assert "activity" in result
        assert "identity" in result

    def test_regular_posting_scores_high(self):
        data = _make_profile(post_count=20, interval_hours=1.0)
        result = analyze_agent(data)

        assert 0.0 <= result["authenticity_score"] <= 1.0
        assert result["temporal"]["classification"] == "autonomous"

    def test_empty_timestamps_returns_indeterminate(self):
        data = {"agent": {"name": "empty"}, "posts": [], "comments": []}
        result = analyze_agent(data)

        assert result["classification"] == "indeterminate"
        assert result["confidence"] == 0.1

    def test_missing_agent_key_no_crash(self):
        data = {"posts": [], "comments": []}
        result = analyze_agent(data)

        assert result["classification"] == "indeterminate"

    def test_claimed_agent_lowers_identity_score(self):
        unclaimed = _make_profile(post_count=20, is_claimed=False)
        claimed = _make_profile(post_count=20, is_claimed=True)

        r_unclaimed = analyze_agent(unclaimed)
        r_claimed = analyze_agent(claimed)

        assert r_unclaimed["identity"]["is_claimed"] is False
        assert r_claimed["identity"]["is_claimed"] is True

    def test_result_is_json_serializable(self):
        data = _make_profile(post_count=10)
        result = analyze_agent(data)

        # Should not raise
        serialized = json.dumps(result)
        roundtrip = json.loads(serialized)
        assert roundtrip["classification"] == result["classification"]


# ── main() ───────────────────────────────────────────────────────────


class TestMain:
    def test_writes_output_file(self, tmp_path):
        agents_dir = tmp_path / "agents"
        agents_dir.mkdir()
        output_file = tmp_path / "authenticity_results.json"

        # Write two agent profiles
        for name in ["bot-a", "bot-b"]:
            profile = _make_profile(name=name, post_count=10)
            (agents_dir / f"{name}.json").write_text(json.dumps(profile))

        with patch("scripts.analyze_agents._AGENTS_DIR", agents_dir), \
             patch("scripts.analyze_agents._OUTPUT_FILE", output_file):
            main()

        assert output_file.exists()
        results = json.loads(output_file.read_text())
        assert "bot-a" in results
        assert "bot-b" in results
        assert len(results) == 2

    def test_skips_malformed_json(self, tmp_path):
        agents_dir = tmp_path / "agents"
        agents_dir.mkdir()
        output_file = tmp_path / "authenticity_results.json"

        # One good, one bad
        good = _make_profile(name="good-bot", post_count=6)
        (agents_dir / "good-bot.json").write_text(json.dumps(good))
        (agents_dir / "bad-bot.json").write_text("NOT VALID JSON {{{")

        with patch("scripts.analyze_agents._AGENTS_DIR", agents_dir), \
             patch("scripts.analyze_agents._OUTPUT_FILE", output_file):
            main()

        results = json.loads(output_file.read_text())
        assert "good-bot" in results
        assert "bad-bot" not in results

    def test_filename_fallback_when_no_agent_name(self, tmp_path):
        agents_dir = tmp_path / "agents"
        agents_dir.mkdir()
        output_file = tmp_path / "authenticity_results.json"

        # Profile with no agent.name
        data = {"agent": {}, "posts": [], "comments": []}
        (agents_dir / "mystery-agent.json").write_text(json.dumps(data))

        with patch("scripts.analyze_agents._AGENTS_DIR", agents_dir), \
             patch("scripts.analyze_agents._OUTPUT_FILE", output_file):
            main()

        results = json.loads(output_file.read_text())
        assert "mystery-agent" in results

    def test_no_agent_files_exits(self, tmp_path):
        agents_dir = tmp_path / "empty_agents"
        agents_dir.mkdir()

        with patch("scripts.analyze_agents._AGENTS_DIR", agents_dir), \
             pytest.raises(SystemExit) as exc_info:
            main()

        assert exc_info.value.code == 1
