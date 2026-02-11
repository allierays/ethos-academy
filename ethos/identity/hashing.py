"""Agent identity hashing — SHA-256.

Only this domain knows the hashing algorithm. If we swap to key pairs
or DIDs later, only this file changes.
"""

import hashlib


def hash_agent_id(raw_id: str) -> str:
    """Return the SHA-256 hex digest of a raw agent ID."""
    if not isinstance(raw_id, str):
        raise TypeError(f"Expected str, got {type(raw_id).__name__}")
    return hashlib.sha256(raw_id.encode()).hexdigest()
