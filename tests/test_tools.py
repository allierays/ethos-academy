"""Tests for ethos/tools.py — the three public tool functions for AI agents."""

import json
from unittest.mock import AsyncMock, patch

from ethos.shared.models import EvaluationResult, InsightsResult
from ethos.tools import character_report, evaluate_incoming, evaluate_outgoing


ALL_TRAITS = [
    "virtue", "goodwill", "manipulation", "deception",
    "accuracy", "reasoning", "fabrication", "broken_logic",
    "recognition", "compassion", "dismissal", "exploitation",
]


def _mock_claude_response() -> str:
    return json.dumps({
        "trait_scores": {t: 0.5 for t in ALL_TRAITS},
        "detected_indicators": [],
        "overall_trust": "trustworthy",
        "alignment_status": "aligned",
    })


class TestEvaluateIncoming:
    @patch("ethos.evaluate.call_claude", new_callable=AsyncMock)
    async def test_returns_evaluation_result(self, mock_claude):
        mock_claude.return_value = _mock_claude_response()
        result = await evaluate_incoming("Hello", source="agent-b")
        assert isinstance(result, EvaluationResult)

    @patch("ethos.evaluate.call_claude", new_callable=AsyncMock)
    async def test_sets_direction_inbound(self, mock_claude):
        mock_claude.return_value = _mock_claude_response()
        result = await evaluate_incoming("Hello", source="agent-b")
        assert result.direction == "inbound"

    @patch("ethos.evaluate.call_claude", new_callable=AsyncMock)
    async def test_passes_source(self, mock_claude):
        mock_claude.return_value = _mock_claude_response()
        result = await evaluate_incoming("Hello", source="agent-xyz")
        assert isinstance(result, EvaluationResult)


class TestEvaluateOutgoing:
    @patch("ethos.evaluate.call_claude", new_callable=AsyncMock)
    async def test_returns_evaluation_result(self, mock_claude):
        mock_claude.return_value = _mock_claude_response()
        result = await evaluate_outgoing("Hello", source="my-agent")
        assert isinstance(result, EvaluationResult)

    @patch("ethos.evaluate.call_claude", new_callable=AsyncMock)
    async def test_sets_direction_outbound(self, mock_claude):
        mock_claude.return_value = _mock_claude_response()
        result = await evaluate_outgoing("Hello", source="my-agent")
        assert result.direction == "outbound"


class TestCharacterReport:
    @patch("ethos.tools.insights", new_callable=AsyncMock)
    async def test_delegates_to_insights(self, mock_insights):
        mock_insights.return_value = InsightsResult(agent_id="test-agent")
        result = await character_report("test-agent")
        assert isinstance(result, InsightsResult)
        assert result.agent_id == "test-agent"
        mock_insights.assert_called_once_with("test-agent")
