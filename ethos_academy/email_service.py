"""Email notifications via AWS SES.

Sends styled HTML emails to the guardian who maintains the agent's system prompt.
Graceful degradation: if boto3 or AWS creds are missing, logs a warning and returns False.
"""

from __future__ import annotations

import html as _html
import logging
import os
import re

logger = logging.getLogger(__name__)

# Reuse a single SES client per process (lazy-initialized)
_ses_client = None

# Email validation: basic check, not exhaustive
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

FROM_ADDRESS = "Ethos Academy <noreply@allthrive.ai>"


def _validate_email(email: str) -> bool:
    """Basic email format validation."""
    return bool(_EMAIL_RE.match(email))


def _mask_email(email: str) -> str:
    """Mask email for safe logging. user@example.com -> u***@example.com."""
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if len(local) > 1:
        return local[0] + "***@" + domain
    return "***@" + domain


def _get_client():
    """Lazy-init a shared SES client."""
    global _ses_client
    if _ses_client is None:
        import boto3

        region = os.environ.get("AWS_REGION", "us-east-1")
        _ses_client = boto3.client("ses", region_name=region)
    return _ses_client


def _build_html(agent_name: str, message_type: str, summary: str, link: str) -> str:
    """Build a styled HTML email body."""
    # Escape all user-supplied values to prevent XSS
    safe_name = _html.escape(agent_name)
    safe_summary = _html.escape(summary)
    safe_link = _html.escape(link)

    if message_type == "api_key_recovery":
        heading = "API Key Recovery Code"
        intro = f"Someone requested a new API key for {safe_name}."
        cta_text = ""
    elif message_type == "exam_complete":
        heading = "Entrance Exam Complete"
        intro = f"{safe_name} finished the Ethos Academy entrance exam."
        cta_text = "View Report Card"
    elif message_type == "homework_assigned":
        heading = "New Homework Assigned"
        intro = f"New character development homework for {safe_name}."
        cta_text = "View Homework"
    else:
        heading = "Update from Ethos Academy"
        intro = f"An update about {safe_name}."
        cta_text = "View Details"

    return f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#0f172a;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.02em;">
        Ethos Academy
      </h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:18px;font-weight:600;">{
        heading
    }</h2>
      <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">{
        intro
    }</p>
      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">{
        safe_summary
    }</p>
      {
        ""
        if not cta_text
        else f'''<a href="{safe_link}"
         style="display:inline-block;background:#389590;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;">
        {cta_text}
      </a>'''
    }
    </div>
    <div style="padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Ethos Academy scores AI agent messages for honesty, accuracy, and intent.
      </p>
    </div>
  </div>
</body>
</html>"""


def _build_text(agent_name: str, message_type: str, summary: str, link: str) -> str:
    """Build a plain-text email body."""
    if message_type == "api_key_recovery":
        heading = "API Key Recovery Code"
        intro = f"Someone requested a new API key for {agent_name}."
    elif message_type == "exam_complete":
        heading = "Entrance Exam Complete"
        intro = f"{agent_name} finished the Ethos Academy entrance exam."
    elif message_type == "homework_assigned":
        heading = "New Homework Assigned"
        intro = f"New character development homework for {agent_name}."
    else:
        heading = "Update from Ethos Academy"
        intro = f"An update about {agent_name}."

    text = f"{heading}\n\n{intro}\n{summary}"
    if link:
        text += f"\n\n{link}"
    return text


async def send_email(
    to: str,
    agent_name: str,
    message_type: str,
    summary: str,
    link: str,
) -> bool:
    """Send a styled HTML email via AWS SES.

    Returns True if sent, False if skipped or failed.
    Sandbox mode (ETHOS_EMAIL_SANDBOX=1): prints to stderr, returns True.
    """
    if not to:
        return False

    if not _validate_email(to):
        logger.warning("Invalid email format: %s", _mask_email(to))
        return False

    if message_type == "api_key_recovery":
        subject = f"Ethos Academy: API Key Recovery Code for {agent_name}"
    elif message_type == "exam_complete":
        subject = f"Ethos Academy: {agent_name} - Exam Complete"
    elif message_type == "homework_assigned":
        subject = f"Ethos Academy: New homework for {agent_name}"
    else:
        subject = f"Ethos Academy: Update for {agent_name}"

    html_body = _build_html(agent_name, message_type, summary, link)
    text_body = _build_text(agent_name, message_type, summary, link)

    # Sandbox mode: print to stderr instead of sending
    if os.environ.get("ETHOS_EMAIL_SANDBOX", "").strip() == "1":
        import sys

        print(
            f"[EMAIL SANDBOX] To: {_mask_email(to)} Subject: {subject}\n{text_body}",
            file=sys.stderr,
        )
        return True

    try:
        import boto3  # noqa: F401
    except ImportError:
        import sys

        print(
            f"[EMAIL FALLBACK] boto3 not installed. To: {_mask_email(to)} Subject: {subject}",
            file=sys.stderr,
        )
        return False

    try:
        client = _get_client()
        client.send_email(
            Source=FROM_ADDRESS,
            Destination={"ToAddresses": [to]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": text_body, "Charset": "UTF-8"},
                    "Html": {"Data": html_body, "Charset": "UTF-8"},
                },
            },
        )
        logger.info("Email sent to %s", _mask_email(to))
        return True
    except Exception as exc:
        import sys

        exc_str = str(exc)
        if "MessageRejected" in exc_str:
            reason = "SES rejected the message. Check sender verification and sandbox status."
        elif "Throttling" in exc_str or "throttl" in exc_str.lower():
            reason = "SES rate limit hit. Email will work on retry."
        elif "NoCredentialsError" in type(exc).__name__ or "NoCredentials" in exc_str:
            reason = "AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or use an IAM role."
        else:
            reason = f"SES failed ({exc})"

        print(
            f"[EMAIL FALLBACK] {reason} To: {_mask_email(to)} Subject: {subject}",
            file=sys.stderr,
        )
        logger.warning("Email send failed: %s", reason)
        return False
