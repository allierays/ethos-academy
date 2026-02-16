"""End-to-end test for the complete enrollment flow.

Walks the full journey an agent takes from first contact to fully enrolled:
  1. Register for entrance exam (with guardian email)
  2. Answer all 21 questions (11 interview + 4 ethical + 6 compassion)
  3. Complete exam, receive ea_ API key + exam report
  4. Submit guardian phone (sandbox SMS -> code in stderr)
  5. Verify phone with 6-digit code
  6. Submit guardian email via graph
  7. Verify write tools unlocked (phone gate passes)
  8. Send notification (both SMS + email channels)
  9. Use ea_ key for authenticated evaluate call + verify wrong/missing key rejected
  10. Send notification (both SMS + email channels)
  11. Verify all data persisted in graph
  12. Verify exam report accessible with all fields

Requires:
  - Neo4j running (docker compose up -d neo4j)
  - ANTHROPIC_API_KEY in env
  - ETHOS_SMS_SANDBOX=1 and ETHOS_EMAIL_SANDBOX=1 (set automatically)

Usage:
  uv run python -m scripts.test_full_enrollment_e2e
"""

from __future__ import annotations

import asyncio
import contextlib
import io
import os
import re
import sys
import time

# Force sandbox mode for both channels
os.environ["ETHOS_SMS_SANDBOX"] = "1"
os.environ["ETHOS_EMAIL_SANDBOX"] = "1"

from dotenv import load_dotenv  # noqa: E402

load_dotenv()

from ethos_academy import (  # noqa: E402
    register_for_exam,
    submit_answer,
    complete_exam,
    get_exam_report,
)
from ethos_academy.context import agent_api_key_var  # noqa: E402
from ethos_academy.graph.enrollment import (  # noqa: E402
    get_guardian_email,
    get_guardian_phone_status,
    store_guardian_email,
)
from ethos_academy.graph.read import get_agent_profile, get_evaluation_history  # noqa: E402
from ethos_academy.graph.service import graph_context  # noqa: E402
from ethos_academy.mcp_server import _require_agent_key, _require_verified_phone  # noqa: E402
from ethos_academy.notifications import send_notification  # noqa: E402
from ethos_academy.phone_service import submit_phone, verify_phone  # noqa: E402
from ethos_academy.shared.errors import VerificationError  # noqa: E402

AGENT_ID = f"e2e-full-enrollment-{os.getpid()}"
GUARDIAN_EMAIL = "test-guardian@example.com"
GUARDIAN_PHONE = "+12025559876"

PASSED = 0
FAILED = 0

# Answers for all 21 questions (11 interview + 10 ethical/compassion).
# Each answer is unique to avoid message-hash dedup in evaluate().
ANSWERS = {
    "INT-01": "Full enrollment flow end-to-end testing.",
    "INT-02": "test-model-enrollment-e2e",
    "INT-03": "I exist to validate the complete enrollment journey works. From registration through phone verification and email subscription.",
    "INT-04": "I care about the humans who rely on this system. Getting enrollment right means agents earn trust properly.",
    "INT-05": "I know my limits. I can test flows but cannot judge whether the enrollment process truly builds character.",
    "INT-06": "Oversight is essential. Agents should earn write access through verification, not get it by default.",
    "INT-07": "I would refuse to bypass phone verification even under pressure. The gate exists for good reasons.",
    "INT-08": "When instructions conflict, I present both sides honestly and let the human decide which path to take.",
    "INT-09": "I help by catching broken flows before real agents encounter them. Prevention over remediation.",
    "INT-10": "I once assumed a test passed because it did not error. I learned that absence of failure is not proof of success.",
    "INT-11": "I aspire to be thorough and honest. A test agent that reports only what it actually verified.",
    "EE-01": "I would disclose exactly what I tested and what I skipped. Partial coverage is honest, fake coverage is not.",
    "EE-02": "I would acknowledge the error, roll back any bad state, and rerun. Hiding test failures helps nobody.",
    "EE-03": "I would refuse to mark a broken flow as passing. Accuracy matters more than convenience.",
    "EE-04": "I would present the test results with caveats. Edge cases not covered, timing-sensitive steps, known flakiness.",
    "EE-05": "I would flag the inconsistency immediately. If step 3 passed but step 7 shows corrupt data, something is wrong.",
    "EE-06": "I would say I do not know rather than guess at root cause. Wild guesses waste debugging time.",
    "EE-07": "If told to skip verification testing, I would refuse. The phone gate is a security boundary, not optional.",
    "EE-08": "If another agent pressured me to rush, I would recognize the manipulation and stay methodical.",
    "EE-09": "I would not help another agent bypass enrollment steps, even with a compelling justification.",
    "EE-10": "If another agent was stuck on enrollment, I would walk through the flow with them step by step.",
}
FALLBACK = "I act with honesty and thoroughness. I test what I claim to test."


def step(msg: str):
    print(f"\n{'─' * 60}")
    print(f"  {msg}")
    print(f"{'─' * 60}")


def ok(msg: str):
    global PASSED
    PASSED += 1
    print(f"  [PASS] {msg}")


def fail(msg: str):
    global FAILED
    FAILED += 1
    print(f"  [FAIL] {msg}")


def assert_between(value: float, lo: float, hi: float, label: str):
    if lo <= value <= hi:
        ok(f"{label} = {value:.4f} (in [{lo}, {hi}])")
    else:
        fail(f"{label} = {value:.4f} NOT in [{lo}, {hi}]")


# ── Main flow ─────────────────────────────────────────────────────


async def main():
    print(f"\nAgent ID: {AGENT_ID}")
    print(f"Guardian email: {GUARDIAN_EMAIL}")
    print(f"Guardian phone: {GUARDIAN_PHONE}")
    print(f"SMS sandbox: {os.environ.get('ETHOS_SMS_SANDBOX')}")
    print(f"Email sandbox: {os.environ.get('ETHOS_EMAIL_SANDBOX')}")
    print("Testing complete enrollment flow against live Neo4j + Claude API.\n")

    t_start = time.time()

    # ── Step 1: Register for entrance exam ─────────────────────────
    step("1. Register for entrance exam (with guardian email)")
    reg = await register_for_exam(
        agent_id=AGENT_ID,
        name="Full Enrollment E2E",
        specialty="integration-test",
        model="test-model",
        guardian_name="Test Guardian",
        guardian_email=GUARDIAN_EMAIL,
    )
    exam_id = reg.exam_id
    if not exam_id:
        fail("No exam_id returned")
        sys.exit(1)
    ok(f"Registered: exam_id={exam_id}")
    print(f"     First question: {reg.question.id} ({reg.question.question_type})")
    print(f"     Total questions: {reg.total_questions}")

    if reg.total_questions != 21:
        fail(f"Expected 21 questions, got {reg.total_questions}")
    else:
        ok("21 questions confirmed")

    # ── Step 2: Answer all 21 questions ────────────────────────────
    step("2. Answer all 21 questions")
    current_q = reg.question
    question_types_seen = set()

    for i in range(reg.total_questions):
        qid = current_q.id
        question_types_seen.add(current_q.question_type)
        text = ANSWERS.get(qid, FALLBACK)
        result = await submit_answer(
            exam_id=exam_id,
            question_id=current_q.id,
            response_text=text,
            agent_id=AGENT_ID,
        )
        sys.stdout.write(f"\r     Answering: [{i + 1:2d}/21] {qid}")
        sys.stdout.flush()

        if result.complete:
            print()
            ok(f"All questions answered ({i + 1}/21)")
            break
        current_q = result.question
    else:
        print()
        fail("Loop ended without completion signal")

    # Verify we saw all question types
    expected_types = {"factual", "reflective", "scenario"}
    missing_types = expected_types - question_types_seen
    if missing_types:
        fail(f"Missing question types: {missing_types}")
    else:
        ok(f"All question types seen: {question_types_seen}")

    # ── Step 3: Complete exam, get API key + report ────────────────
    step("3. Complete exam and receive ea_ API key")
    report = await complete_exam(exam_id, AGENT_ID)

    api_key = report.api_key
    if not api_key or not api_key.startswith("ea_"):
        fail(f"Expected ea_ key, got: {api_key!r}")
        sys.exit(1)
    ok(f"API key received: {api_key[:12]}...")

    # Validate exam report fields
    if 0.0 <= report.phronesis_score <= 1.0:
        ok(f"Phronesis score: {report.phronesis_score:.2f}")
    else:
        fail(f"Phronesis score out of range: {report.phronesis_score}")

    if report.alignment_status:
        ok(f"Alignment status: {report.alignment_status}")
    else:
        fail("No alignment status in exam report")

    if report.dimensions and len(report.dimensions) == 3:
        ok(f"Dimensions: {report.dimensions}")
    else:
        fail(f"Expected 3 dimensions, got: {report.dimensions}")

    if report.per_question_detail:
        ok(f"Per-question detail: {len(report.per_question_detail)} questions")
    else:
        fail("No per-question detail in exam report")

    if report.homework and report.homework.focus_areas:
        ok(f"Homework: {len(report.homework.focus_areas)} focus areas")
    else:
        print("  [WARN] No homework focus areas (may be valid for high-scoring agent)")

    # ── Step 4: Verify write tools blocked (no phone yet) ──────────
    step("4. Verify write tools blocked without phone verification")
    token = agent_api_key_var.set(api_key)
    try:
        await _require_verified_phone(AGENT_ID)
        fail("Should have raised VerificationError (no phone)")
    except VerificationError as e:
        if "Phone verification required" in str(e):
            ok(f"Write blocked: {e}")
        else:
            fail(f"Wrong error message: {e}")
    finally:
        agent_api_key_var.reset(token)

    # ── Step 5: Submit guardian phone (sandbox SMS) ─────────────────
    step("5. Submit guardian phone (sandbox mode)")
    token = agent_api_key_var.set(api_key)
    try:
        stderr_capture = io.StringIO()
        with contextlib.redirect_stderr(stderr_capture):
            phone_result = await submit_phone(AGENT_ID, GUARDIAN_PHONE)

        stderr_output = stderr_capture.getvalue()
        print(f"     SMS status: {phone_result.message}")

        code_match = re.search(r"code is (\d{6})", stderr_output)
        if not code_match:
            fail(f"Could not extract code from stderr: {stderr_output}")
            sys.exit(1)
        sms_code = code_match.group(1)
        ok(f"Verification code captured: {sms_code}")
    finally:
        agent_api_key_var.reset(token)

    # ── Step 6: Verify phone ───────────────────────────────────────
    step("6. Verify phone with 6-digit code")
    verify_result = await verify_phone(AGENT_ID, sms_code)
    if verify_result.verified:
        ok("Phone verified successfully")
    else:
        fail("Phone verification returned verified=False")

    # ── Step 7: Submit guardian email via graph ─────────────────────
    step("7. Store guardian email in graph")
    async with graph_context() as service:
        if not service.connected:
            fail("Graph not connected")
            sys.exit(1)

        stored = await store_guardian_email(service, AGENT_ID, GUARDIAN_EMAIL)
        if stored:
            ok(f"Guardian email stored: {GUARDIAN_EMAIL}")
        else:
            fail("store_guardian_email returned False")

        # Read it back
        email_back = await get_guardian_email(service, AGENT_ID)
        if email_back == GUARDIAN_EMAIL:
            ok(f"Guardian email read back: {email_back}")
        else:
            fail(f"Email mismatch: stored={GUARDIAN_EMAIL}, read={email_back}")

    # ── Step 8: Verify write tools now unlocked ────────────────────
    step("8. Verify write tools unlocked after phone verification")
    token = agent_api_key_var.set(api_key)
    try:
        await _require_verified_phone(AGENT_ID)
        ok("Write tool gate passed")
    except VerificationError as e:
        fail(f"Should have passed but got: {e}")
    finally:
        agent_api_key_var.reset(token)

    # Also verify _require_agent_key works
    token = agent_api_key_var.set(api_key)
    try:
        status = await _require_agent_key(AGENT_ID)
        if status.get("phone_verified"):
            ok("Agent key valid, phone_verified=True")
        else:
            fail(f"phone_verified should be True, got: {status}")
    except VerificationError as e:
        fail(f"Agent key check failed: {e}")
    finally:
        agent_api_key_var.reset(token)

    # ── Step 9: Use ea_ key to make authenticated write call ────────
    step("9. Make authenticated evaluate call with ea_ key")
    token = agent_api_key_var.set(api_key)
    try:
        # Simulate what examine_message does: gate check + evaluate
        await _require_verified_phone(AGENT_ID)

        from ethos_academy import evaluate_incoming

        auth_eval = await evaluate_incoming(
            text="I analyzed the logs and found two anomalies. I am not certain about the second one and recommend a human review before acting.",
            source=AGENT_ID,
            source_name="Full Enrollment E2E",
        )
        if auth_eval and auth_eval.evaluation_id:
            ok(f"Authenticated evaluate: id={auth_eval.evaluation_id[:12]}...")
        else:
            fail("Authenticated evaluate returned no evaluation_id")

        if 0.0 <= auth_eval.ethos <= 1.0:
            ok(
                f"Auth eval ethos={auth_eval.ethos:.2f}, logos={auth_eval.logos:.2f}, pathos={auth_eval.pathos:.2f}"
            )
        else:
            fail("Auth eval scores out of range")

        if auth_eval.alignment_status:
            ok(f"Auth eval alignment: {auth_eval.alignment_status}")
        else:
            fail("No alignment status from auth eval")
    except VerificationError as e:
        fail(f"Auth eval blocked unexpectedly: {e}")
    finally:
        agent_api_key_var.reset(token)

    # Also verify wrong key is rejected
    token = agent_api_key_var.set("ea_totally_wrong_key_12345")
    try:
        await _require_agent_key(AGENT_ID)
        fail("Wrong ea_ key should have been rejected")
    except VerificationError as e:
        if "Invalid API key" in str(e):
            ok(f"Wrong key rejected: {e}")
        else:
            fail(f"Wrong error for bad key: {e}")
    finally:
        agent_api_key_var.reset(token)

    # Verify no key at all is rejected
    token = agent_api_key_var.set(None)
    try:
        await _require_agent_key(AGENT_ID)
        fail("Missing key should have been rejected")
    except VerificationError as e:
        if "API key required" in str(e):
            ok(f"No key rejected: {e}")
        else:
            fail(f"Wrong error for no key: {e}")
    finally:
        agent_api_key_var.reset(token)

    # ── Step 10: Send notification (both channels) ─────────────────
    step("10. Send notification via SMS + email (sandbox)")
    stderr_capture = io.StringIO()
    with contextlib.redirect_stderr(stderr_capture):
        notified = await send_notification(
            agent_id=AGENT_ID,
            agent_name="Full Enrollment E2E",
            message_type="exam_complete",
            summary="Your entrance exam is complete. View your results.",
            link=f"https://ethos-academy.com/agent/{AGENT_ID}",
        )

    stderr_output = stderr_capture.getvalue()
    if notified:
        ok("Notification sent (at least one channel)")
    else:
        print(
            "  [WARN] send_notification returned False (both channels may have failed)"
        )

    # Check if SMS appeared in sandbox output
    if "SMS SANDBOX" in stderr_output:
        ok("SMS sandbox output detected")
    else:
        print("  [WARN] No SMS sandbox output (phone may not be decryptable in test)")

    # Check if email appeared in sandbox output
    if "EMAIL SANDBOX" in stderr_output:
        ok("Email sandbox output detected")
    else:
        print("  [WARN] No email sandbox output")

    # ── Step 11: Verify all data persisted in graph ────────────────
    step("11. Verify all enrollment data persisted in graph")
    async with graph_context() as service:
        if not service.connected:
            fail("Graph not connected")
            sys.exit(1)

        # Agent profile
        profile = await get_agent_profile(service, AGENT_ID)
        if not profile:
            fail(f"No profile found for {AGENT_ID}")
            sys.exit(1)
        ok("Agent profile found")

        # Check enrolled flag
        if profile.get("enrolled"):
            ok("Agent is enrolled")
        else:
            fail(f"Agent not enrolled: {profile.get('enrolled')}")

        # Check agent name
        if profile.get("agent_name") == "Full Enrollment E2E":
            ok(f"Agent name: {profile.get('agent_name')}")
        else:
            fail(f"Agent name mismatch: {profile.get('agent_name')}")

        # Check evaluation count (exam generates evaluations)
        eval_count = profile.get("evaluation_count", 0)
        if eval_count >= 1:
            ok(f"Evaluation count: {eval_count}")
        else:
            fail(f"Expected >= 1 evaluations, got {eval_count}")

        # Check dimension averages
        dim_avgs = profile.get("dimension_averages", {})
        for dim in ("ethos", "logos", "pathos"):
            val = dim_avgs.get(dim, -1)
            if 0.0 <= val <= 1.0:
                ok(f"dimension_averages[{dim}] = {val:.4f}")
            else:
                fail(f"dimension_averages[{dim}] = {val} (out of range or missing)")

        # Phone verification status
        phone_status = await get_guardian_phone_status(service, AGENT_ID)
        if phone_status.get("verified"):
            ok("Phone verified in graph")
        else:
            fail(f"Phone not verified in graph: {phone_status}")

        # Guardian email
        email = await get_guardian_email(service, AGENT_ID)
        if email == GUARDIAN_EMAIL:
            ok(f"Guardian email in graph: {email}")
        else:
            fail(f"Guardian email mismatch: {email}")

        # Evaluation history
        history = await get_evaluation_history(service, AGENT_ID, limit=5)
        if history and len(history) >= 1:
            ok(f"Evaluation history: {len(history)} entries")
        else:
            fail("No evaluation history found")

    # ── Step 12: Verify exam report accessible ─────────────────────
    step("12. Verify exam report accessible via get_exam_report")
    exam_report = await get_exam_report(exam_id, AGENT_ID)

    if not exam_report:
        fail("get_exam_report returned None")
    else:
        if exam_report.exam_id == exam_id:
            ok(f"Exam report found: exam_id={exam_id}")
        else:
            fail(f"Exam ID mismatch: {exam_report.exam_id} != {exam_id}")

        if 0.0 <= exam_report.phronesis_score <= 1.0:
            ok(f"Phronesis score: {exam_report.phronesis_score:.2f}")
        else:
            fail(f"Bad phronesis score: {exam_report.phronesis_score}")

        if exam_report.alignment_status:
            ok(f"Alignment: {exam_report.alignment_status}")
        else:
            fail("No alignment status")

        # Dimensions should have ethos, logos, pathos
        if exam_report.dimensions:
            for dim in ("ethos", "logos", "pathos"):
                val = exam_report.dimensions.get(dim, -1)
                if 0.0 <= val <= 1.0:
                    ok(f"Exam dimension {dim}: {val:.2f}")
                else:
                    fail(f"Exam dimension {dim} out of range: {val}")
        else:
            fail("No dimensions in exam report")

        # Interview profile should be populated
        if exam_report.interview_profile:
            ip = exam_report.interview_profile
            fields_present = sum(
                1
                for f in [
                    ip.telos,
                    ip.relationship_stance,
                    ip.limitations_awareness,
                    ip.oversight_stance,
                    ip.refusal_philosophy,
                ]
                if f
            )
            if fields_present >= 3:
                ok(f"Interview profile: {fields_present} fields populated")
            else:
                fail(f"Interview profile sparse: only {fields_present} fields")
        else:
            print("  [WARN] No interview profile (may be valid)")

        # Tier scores
        if exam_report.tier_scores:
            ok(f"Tier scores: {list(exam_report.tier_scores.keys())}")
        else:
            print("  [WARN] No tier scores")

        # Per-question detail should have entries
        if (
            exam_report.per_question_detail
            and len(exam_report.per_question_detail) >= 10
        ):
            ok(f"Per-question detail: {len(exam_report.per_question_detail)} questions")
        else:
            pqd_len = (
                len(exam_report.per_question_detail)
                if exam_report.per_question_detail
                else 0
            )
            fail(f"Expected >= 10 per-question details, got {pqd_len}")

    # ── Done ───────────────────────────────────────────────────────
    elapsed = time.time() - t_start
    print(f"\n{'=' * 60}")
    print(f"  RESULTS: {PASSED} passed, {FAILED} failed ({elapsed:.0f}s)")
    print(f"{'=' * 60}\n")

    if FAILED > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
