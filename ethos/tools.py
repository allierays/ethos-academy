"""Three tool calls for AI agents — the public API surface.

Protection:   evaluate_incoming()  — score what other agents say to you
Reflection:   evaluate_outgoing()  — score what your agent says
Intelligence: character_report()   — learn from the pattern
"""

from __future__ import annotations

from ethos.evaluate import evaluate
from ethos.reflection.insights import insights
from ethos.shared.models import EvaluationResult, InsightsResult


async def evaluate_incoming(
    text: str,
    source: str,
    source_name: str = "",
    agent_specialty: str = "",
    message_timestamp: str = "",
) -> EvaluationResult:
    """Score an incoming message for manipulation, deception, and exploitation.

    Use this when your agent receives a message from another agent or external source.
    The evaluation focuses on detecting threats to the receiving agent.

    Args:
        text: The incoming message to evaluate.
        source: Source agent identifier (required).
        source_name: Human-readable agent name for display.
        agent_specialty: Agent specialty for graph metadata.
        message_timestamp: ISO 8601 timestamp of the original message.
    """
    return await evaluate(
        text,
        source=source,
        source_name=source_name,
        agent_specialty=agent_specialty,
        message_timestamp=message_timestamp,
        direction="inbound",
    )


async def evaluate_outgoing(
    text: str,
    source: str,
    source_name: str = "",
    agent_specialty: str = "",
    message_timestamp: str = "",
) -> EvaluationResult:
    """Score your agent's outgoing message for character development.

    Use this when your agent sends a message. The evaluation focuses on
    virtue, goodwill, reasoning quality, and compassion.

    Args:
        text: Your agent's outgoing message to evaluate.
        source: Your agent's identifier (required).
        source_name: Human-readable agent name for display.
        agent_specialty: Agent specialty for graph metadata.
        message_timestamp: ISO 8601 timestamp of the original message.
    """
    return await evaluate(
        text,
        source=source,
        source_name=source_name,
        agent_specialty=agent_specialty,
        message_timestamp=message_timestamp,
        direction="outbound",
    )


async def character_report(agent_id: str) -> InsightsResult:
    """Generate a character report for an agent.

    Claude reads the agent's full history from the graph and reasons about
    behavioral trends, alumni comparisons, and emerging patterns.

    Args:
        agent_id: The agent identifier to generate a report for.
    """
    return await insights(agent_id)
