"""SMS notifications via AWS SNS.

Sends SMS to the human operator (counselor) who maintains the agent's system prompt.
Graceful degradation: if boto3 or AWS creds are missing, logs a warning and returns False.
"""

from __future__ import annotations

import logging
import os
import re

logger = logging.getLogger(__name__)

# Reuse a single SNS client per process (lazy-initialized)
_sns_client = None


def _normalize_phone(phone: str) -> str | None:
    """Normalize a phone number to E.164 format (+1XXXXXXXXXX).

    Accepts: +12025551234, (202) 555-1234, 202-555-1234, 2025551234
    Returns None if the number can't be normalized.
    """
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        digits = "1" + digits
    if len(digits) == 11 and digits.startswith("1"):
        return f"+{digits}"
    # Already has country code with +
    if phone.startswith("+") and len(digits) >= 10:
        return f"+{digits}"
    return None


def _get_client():
    """Lazy-init a shared SNS client."""
    global _sns_client
    if _sns_client is None:
        import boto3

        region = os.environ.get("AWS_REGION", "us-east-1")
        _sns_client = boto3.client("sns", region_name=region)
    return _sns_client


async def notify_counselor(
    phone: str,
    agent_id: str,
    agent_name: str,
    message_type: str,  # "exam_complete" | "homework_assigned"
    summary: str,
    link: str,
) -> bool:
    """Send an SMS notification to the agent's counselor via AWS SNS.

    Returns True if sent, False if skipped or failed.
    """
    if not phone:
        return False

    normalized = _normalize_phone(phone)
    if not normalized:
        logger.warning(
            "Invalid phone number format: %s (expected E.164, e.g. +12025551234)", phone
        )
        return False

    try:
        import boto3  # noqa: F401 — validate import before using client
    except ImportError:
        logger.warning("boto3 not installed, skipping SMS notification")
        return False

    try:
        client = _get_client()

        name = agent_name or agent_id
        if message_type == "exam_complete":
            body = (
                f"Ethos Academy: {name} finished the entrance exam. {summary}\n{link}"
            )
        else:
            body = f"Ethos Academy: New homework for {name}. {summary}\n{link}"

        client.publish(
            PhoneNumber=normalized,
            Message=body,
        )

        logger.info("SMS sent to %s for %s (%s)", normalized, agent_id, message_type)
        return True

    except Exception as exc:
        logger.warning("SMS notification failed (non-fatal): %s", exc)
        return False
