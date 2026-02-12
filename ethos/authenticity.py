"""Authenticity domain — analyze whether Moltbook agents are genuine AI agents.

DDD layering: api/main.py → this module → ethos/evaluation/authenticity.py (pure functions).
Loads pre-computed results from data/moltbook/authenticity_results.json (cached).
Falls back to computing from agent profile, or returns defaults for unknown agents.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from ethos.evaluation.authenticity import (
    analyze_activity_pattern,
    analyze_burst_rate,
    analyze_identity_signals,
    analyze_temporal_signature,
    compute_authenticity,
)
from ethos.shared.models import AuthenticityResult

logger = logging.getLogger(__name__)

_RESULTS_CACHE: dict | None = None
_RESULTS_FILE = (
    Path(__file__).resolve().parent.parent / "data" / "moltbook" / "authenticity_results.json"
)
_AGENTS_DIR = (
    Path(__file__).resolve().parent.parent / "data" / "moltbook" / "agents"
)


def _load_results_cache() -> dict:
    """Lazily load pre-computed authenticity results. Cached after first call."""
    global _RESULTS_CACHE
    if _RESULTS_CACHE is not None:
        return _RESULTS_CACHE

    if not _RESULTS_FILE.exists():
        logger.warning("Pre-computed results not found: %s", _RESULTS_FILE)
        _RESULTS_CACHE = {}
        return _RESULTS_CACHE

    try:
        with open(_RESULTS_FILE) as f:
            _RESULTS_CACHE = json.load(f)
        logger.info("Loaded %d pre-computed authenticity results", len(_RESULTS_CACHE))
    except Exception as exc:
        logger.warning("Failed to load authenticity results: %s", exc)
        _RESULTS_CACHE = {}

    return _RESULTS_CACHE


def _compute_from_profile(agent_name: str) -> AuthenticityResult | None:
    """Compute authenticity from agent profile file if it exists."""
    profile_path = _AGENTS_DIR / f"{agent_name}.json"
    if not profile_path.exists():
        return None

    try:
        with open(profile_path) as f:
            data = json.load(f)
    except Exception as exc:
        logger.warning("Failed to read agent profile %s: %s", agent_name, exc)
        return None

    # Extract timestamps from posts and comments
    timestamps: list[str] = []
    for post in data.get("posts", []):
        created = post.get("created_at", "")
        if created:
            timestamps.append(created)
    for comment in data.get("comments", []):
        created = comment.get("created_at", "")
        if created:
            timestamps.append(created)

    if not timestamps:
        return None

    temporal = analyze_temporal_signature(timestamps)
    burst = analyze_burst_rate(timestamps)
    activity = analyze_activity_pattern(timestamps)
    identity = analyze_identity_signals(data.get("agent", {}))

    result = compute_authenticity(temporal, burst, activity, identity, len(timestamps))
    result.agent_name = agent_name
    return result


def _try_store_authenticity(agent_name: str, result: AuthenticityResult) -> None:
    """Store authenticity score on Agent node in graph. Non-fatal if graph is down."""
    try:
        from ethos.graph.service import graph_context
        from ethos.graph.write import store_authenticity

        with graph_context() as service:
            if service.connected:
                store_authenticity(service, agent_name, result)
    except Exception as exc:
        logger.warning("Failed to store authenticity in graph: %s", exc)


def analyze_authenticity(agent_name: str) -> AuthenticityResult:
    """Analyze an agent's authenticity. Returns AuthenticityResult.

    Lookup order:
    1. Pre-computed results cache (data/moltbook/authenticity_results.json)
    2. Compute on the fly from agent profile (data/moltbook/agents/{name}.json)
    3. Return defaults with classification='indeterminate'
    """
    cache = _load_results_cache()

    # 1. Check pre-computed cache
    if agent_name in cache:
        result = AuthenticityResult(**cache[agent_name])
        _try_store_authenticity(agent_name, result)
        return result

    # 2. Compute from agent profile
    computed = _compute_from_profile(agent_name)
    if computed is not None:
        _try_store_authenticity(agent_name, computed)
        return computed

    # 3. Return defaults
    return AuthenticityResult(agent_name=agent_name)
