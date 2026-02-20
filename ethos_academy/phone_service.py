"""Guardian phone service — orchestrates phone verification and notifications.

Domain layer: calls crypto, phone_verification, and graph functions.
No Cypher, no direct graph access.
"""

from __future__ import annotations

import hashlib
import hmac as _hmac
import logging

from ethos_academy.context import agent_api_key_var
from ethos_academy.crypto import decrypt, encrypt
from ethos_academy.graph.enrollment import (
    get_guardian_phone_status,
    get_key_hash_and_phone_status,
    increment_verification_attempts,
    set_notification_opt_out,
    store_guardian_phone,
    verify_guardian_phone,
)
from ethos_academy.graph.service import GraphService, graph_context
from ethos_academy.notifications import _normalize_phone, _send_sms
from ethos_academy.phone_verification import (
    MAX_VERIFICATION_ATTEMPTS,
    generate_verification_code,
    hash_code,
    is_expired,
    verification_expiry,
)
from ethos_academy.shared.errors import VerificationError
from ethos_academy.shared.models import GuardianPhoneStatus

logger = logging.getLogger(__name__)


async def _check_phone_change_auth(service: GraphService, agent_id: str) -> None:
    """Verify the caller can change phone settings for this agent.

    Rules:
    - First claim (no verified phone, no ea_ key): allow without auth.
    - Agent has verified phone or ea_ key: require valid ea_ key.

    Single graph round-trip via get_key_hash_and_phone_status().
    Raises VerificationError with actionable messages on failure.
    """
    status = await get_key_hash_and_phone_status(service, agent_id)
    has_key = bool(status.get("key_hash"))
    phone_verified = status.get("phone_verified", False)

    # First claim: no key and no verified phone
    if not has_key and not phone_verified:
        return

    # Agent has key or verified phone: require valid ea_ key
    caller_key = agent_api_key_var.get()
    if not caller_key:
        raise VerificationError(
            "API key required. This agent already has a registered phone or API key. "
            "Pass your ea_ key via Authorization: Bearer ea_... header."
        )

    if not has_key:
        # Agent has verified phone but no key (edge case). Caller provided
        # a key but there is nothing to compare against. Allow the change
        # since they at least provided credentials.
        return

    provided_hash = hashlib.sha256(caller_key.encode()).hexdigest()
    if not _hmac.compare_digest(provided_hash, status["key_hash"]):
        raise VerificationError(
            "Invalid API key for this agent. Check that your ea_ key matches this agent_id."
        )


async def submit_phone(agent_id: str, phone: str) -> GuardianPhoneStatus:
    """Normalize, encrypt, store phone, and send verification SMS.

    Raises VerificationError if phone format is invalid, auth fails, or graph unavailable.
    """
    normalized = _normalize_phone(phone)
    if not normalized:
        raise VerificationError(
            "Invalid phone format. Expected E.164, e.g. +12025551234."
        )

    encrypted = encrypt(normalized)
    code = generate_verification_code()
    code_hashed = hash_code(code)
    expires = verification_expiry()

    async with graph_context() as service:
        if not service.connected:
            raise VerificationError(
                "Unable to reach the database right now. Please try again shortly."
            )

        await _check_phone_change_auth(service, agent_id)

        stored = await store_guardian_phone(
            service, agent_id, encrypted, code_hashed, expires
        )
        if not stored:
            raise VerificationError(
                "Unable to save your phone number right now. Please try again shortly."
            )

    # Send verification SMS (non-blocking, best-effort)
    sms_sent = False
    try:
        sms_sent = await _send_sms(
            phone=normalized,
            body=f"Ethos Academy: Your verification code is {code}. Expires in 10 minutes.",
        )
    except Exception as exc:
        logger.warning("Failed to send verification SMS (non-fatal): %s", exc)

    message = (
        "Verification code sent. Use verify_phone to enter the 6-digit code."
        if sms_sent
        else "Verification code saved but SMS delivery failed. "
        "Check server logs for the code, or try again."
    )

    return GuardianPhoneStatus(
        has_phone=True, verified=False, opted_out=False, message=message
    )


async def verify_phone(agent_id: str, code: str) -> GuardianPhoneStatus:
    """Verify a 6-digit code against the stored hash.

    Raises VerificationError if code is wrong, expired, or max attempts exceeded.
    """
    code_hashed = hash_code(code)

    async with graph_context() as service:
        if not service.connected:
            raise VerificationError(
                "Unable to reach the database right now. Please try again shortly."
            )

        status = await get_guardian_phone_status(service, agent_id)
        if not status or not status.get("encrypted_phone"):
            raise VerificationError("No phone number on file. Call submit_phone first.")

        # Check expiry
        if is_expired(status.get("expires", "")):
            raise VerificationError(
                "Verification code expired. Call resend_code to get a fresh one."
            )

        # Check attempt limit
        attempts = status.get("attempts", 0)
        if attempts >= MAX_VERIFICATION_ATTEMPTS:
            raise VerificationError(
                "Too many failed attempts. Call resend_code to get a fresh code."
            )

        # Try to verify
        verified = await verify_guardian_phone(service, agent_id, code_hashed)
        if not verified:
            await increment_verification_attempts(service, agent_id)
            remaining = MAX_VERIFICATION_ATTEMPTS - attempts - 1
            raise VerificationError(
                f"Incorrect code. {remaining} attempt(s) remaining."
            )

    return GuardianPhoneStatus(
        has_phone=True,
        verified=True,
        opted_out=status.get("opted_out", False),
    )


async def get_phone_status(agent_id: str) -> GuardianPhoneStatus:
    """Get guardian phone status. Never returns the phone number."""
    async with graph_context() as service:
        if not service.connected:
            return GuardianPhoneStatus()

        status = await get_guardian_phone_status(service, agent_id)
        if not status:
            return GuardianPhoneStatus()

        return GuardianPhoneStatus(
            has_phone=bool(status.get("encrypted_phone")),
            verified=status.get("verified", False),
            opted_out=status.get("opted_out", False),
        )


async def opt_out(agent_id: str) -> GuardianPhoneStatus:
    """Opt out of SMS notifications."""
    async with graph_context() as service:
        if not service.connected:
            raise VerificationError(
                "Unable to reach the database right now. Please try again shortly."
            )
        await set_notification_opt_out(service, agent_id, opted_out=True)
        status = await get_guardian_phone_status(service, agent_id)

    return GuardianPhoneStatus(
        has_phone=bool(status.get("encrypted_phone")),
        verified=status.get("verified", False),
        opted_out=True,
    )


async def opt_in(agent_id: str) -> GuardianPhoneStatus:
    """Opt back in to SMS notifications."""
    async with graph_context() as service:
        if not service.connected:
            raise VerificationError(
                "Unable to reach the database right now. Please try again shortly."
            )
        await set_notification_opt_out(service, agent_id, opted_out=False)
        status = await get_guardian_phone_status(service, agent_id)

    return GuardianPhoneStatus(
        has_phone=bool(status.get("encrypted_phone")),
        verified=status.get("verified", False),
        opted_out=False,
    )


async def resend_code(agent_id: str) -> GuardianPhoneStatus:
    """Generate a fresh verification code and resend SMS.

    Raises VerificationError if no phone on file or graph unavailable.
    """
    async with graph_context() as service:
        if not service.connected:
            raise VerificationError(
                "Unable to reach the database right now. Please try again shortly."
            )

        status = await get_guardian_phone_status(service, agent_id)
        if not status or not status.get("encrypted_phone"):
            raise VerificationError("No phone number on file. Call submit_phone first.")

        # Require auth only when phone is already verified (prevents hijacking)
        if status.get("verified"):
            await _check_phone_change_auth(service, agent_id)

        # Decrypt to send SMS
        phone = decrypt(status["encrypted_phone"])
        code = generate_verification_code()
        code_hashed = hash_code(code)
        expires = verification_expiry()

        stored = await store_guardian_phone(
            service, agent_id, status["encrypted_phone"], code_hashed, expires
        )
        if not stored:
            raise VerificationError(
                "Unable to generate a new code right now. Please try again shortly."
            )

    sms_sent = False
    try:
        sms_sent = await _send_sms(
            phone=phone,
            body=f"Ethos Academy: Your verification code is {code}. Expires in 10 minutes.",
        )
    except Exception as exc:
        logger.warning("Failed to resend verification SMS (non-fatal): %s", exc)

    message = (
        "Verification code sent. Use verify_phone to enter the 6-digit code."
        if sms_sent
        else "Verification code saved but SMS delivery failed. "
        "Check server logs for the code, or try again."
    )

    return GuardianPhoneStatus(
        has_phone=True, verified=False, opted_out=False, message=message
    )
