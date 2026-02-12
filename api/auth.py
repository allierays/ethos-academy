"""API key authentication dependency."""

import hmac
import os

from fastapi import HTTPException, Request


def require_api_key(request: Request) -> None:
    """Validate Bearer token against ETHOS_API_KEY env var.

    If ETHOS_API_KEY is not set or empty, auth is disabled (development mode).
    Uses constant-time comparison to prevent timing attacks.
    """
    api_key = os.environ.get("ETHOS_API_KEY", "").strip()
    if not api_key:
        return
    auth = request.headers.get("Authorization", "")
    expected = f"Bearer {api_key}"
    if not hmac.compare_digest(auth.encode(), expected.encode()):
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
