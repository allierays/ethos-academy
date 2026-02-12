"""Pydantic models for Ethos evaluation results.

This is the shared domain — cross-cutting data models used by all other domains.
No business logic, no I/O, no dependencies beyond pydantic.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class RoutingTier(str, Enum):
    STANDARD = "standard"
    FOCUSED = "focused"
    DEEP = "deep"
    DEEP_WITH_CONTEXT = "deep_with_context"


class Priority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    STANDARD = "standard"
    LOW = "low"


class DetectedIndicator(BaseModel):
    id: str
    name: str
    trait: str
    confidence: float = Field(ge=0.0, le=1.0)
    severity: float = Field(ge=0.0, le=1.0)
    evidence: str = ""


class TraitScore(BaseModel):
    name: str
    dimension: str
    polarity: str
    score: float = Field(default=0.0, ge=0.0, le=1.0)
    indicators: list[DetectedIndicator] = Field(default_factory=list)


class PhronesisContext(BaseModel):
    """Accumulated practical wisdom from the graph.

    Not just 'graph stuff' — this is the agent's character history,
    the Aristotelian integration of experience over time.
    """
    prior_evaluations: int = 0
    historical_phronesis: float | None = None
    phronesis_trend: str = "insufficient_data"
    flagged_patterns: list[str] = Field(default_factory=list)
    alumni_warnings: int = 0


# Backward compatibility alias
GraphContext = PhronesisContext


class EvaluationResult(BaseModel):
    # Backward-compat dimension scores
    ethos: float = Field(default=0.0, ge=0.0, le=1.0)
    logos: float = Field(default=0.0, ge=0.0, le=1.0)
    pathos: float = Field(default=0.0, ge=0.0, le=1.0)
    flags: list[str] = Field(default_factory=list)
    phronesis: str = Field(default="unknown")

    # Trait-level detail
    traits: dict[str, TraitScore] = Field(default_factory=dict)
    detected_indicators: list[DetectedIndicator] = Field(default_factory=list)

    # Metadata
    evaluation_id: str = ""
    routing_tier: str = "standard"
    keyword_density: float = 0.0
    model_used: str = ""
    agent_model: str = ""
    created_at: str = ""

    # Graph context (only when source agent is provided)
    graph_context: GraphContext | None = None

    # DDD additions
    alignment_status: str = "unknown"
    tier_scores: dict[str, float] = Field(default_factory=dict)


class ReflectionResult(BaseModel):
    # Backward-compat fields
    compassion: float = Field(default=0.0, ge=0.0, le=1.0)
    honesty: float = Field(default=0.0, ge=0.0, le=1.0)
    accuracy: float = Field(default=0.0, ge=0.0, le=1.0)
    trend: str = Field(default="stable")

    # New fields
    ethos: float = Field(default=0.0, ge=0.0, le=1.0)
    logos: float = Field(default=0.0, ge=0.0, le=1.0)
    pathos: float = Field(default=0.0, ge=0.0, le=1.0)
    trait_averages: dict[str, float] = Field(default_factory=dict)
    evaluation_count: int = 0
    agent_id: str = ""


class Insight(BaseModel):
    trait: str
    severity: str = "info"  # info, warning, critical
    message: str = ""
    evidence: dict = Field(default_factory=dict)


class InsightsResult(BaseModel):
    agent_id: str = ""
    period: str = "24h"
    generated_at: str = ""
    summary: str = ""
    insights: list[Insight] = Field(default_factory=list)
    stats: dict = Field(default_factory=dict)


class AgentSummary(BaseModel):
    agent_id: str = ""
    agent_name: str = Field(default="", max_length=100)
    agent_specialty: str = ""
    evaluation_count: int = 0
    latest_alignment_status: str = "unknown"


class AgentProfile(BaseModel):
    agent_id: str = ""
    agent_name: str = Field(default="", max_length=100)
    agent_specialty: str = ""
    agent_model: str = ""
    created_at: str = ""
    evaluation_count: int = 0
    dimension_averages: dict[str, float] = Field(default_factory=dict)
    trait_averages: dict[str, float] = Field(default_factory=dict)
    phronesis_trend: str = "insufficient_data"
    alignment_history: list[str] = Field(default_factory=list)


class EvaluationHistoryItem(BaseModel):
    evaluation_id: str = ""
    ethos: float = Field(default=0.0, ge=0.0, le=1.0)
    logos: float = Field(default=0.0, ge=0.0, le=1.0)
    pathos: float = Field(default=0.0, ge=0.0, le=1.0)
    phronesis: str = "unknown"
    alignment_status: str = "unknown"
    flags: list[str] = Field(default_factory=list)
    created_at: str = ""
    trait_scores: dict[str, float] = Field(default_factory=dict)


class AlumniResult(BaseModel):
    trait_averages: dict[str, float] = Field(default_factory=dict)
    total_evaluations: int = 0


class DetectedPattern(BaseModel):
    pattern_id: str
    name: str
    description: str = ""
    matched_indicators: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    first_seen: str = ""
    last_seen: str = ""
    occurrence_count: int = 0
    current_stage: int = 0


class PatternResult(BaseModel):
    agent_id: str = ""
    patterns: list[DetectedPattern] = Field(default_factory=list)
    checked_at: str = ""


class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    caption: str = ""
    properties: dict = Field(default_factory=dict)


class GraphRel(BaseModel):
    id: str
    from_id: str
    to_id: str
    type: str
    properties: dict = Field(default_factory=dict)


class GraphData(BaseModel):
    nodes: list[GraphNode] = Field(default_factory=list)
    relationships: list[GraphRel] = Field(default_factory=list)


class TraitTrend(BaseModel):
    """Per-trait trend for reflection intuition."""
    trait: str
    direction: str = "stable"  # improving, declining, stable, insufficient_data
    recent_avg: float = 0.0
    historical_avg: float = 0.0
    delta: float = 0.0


class ReflectionInstinctResult(BaseModel):
    """Reflection instinct — quick red-flag scan of agent aggregate stats."""
    risk_level: str = "low"  # low, moderate, high, critical
    flagged_traits: list[str] = Field(default_factory=list)
    flagged_dimensions: list[str] = Field(default_factory=list)
    cohort_deviations: dict[str, float] = Field(default_factory=dict)


class ReflectionIntuitionResult(BaseModel):
    """Reflection intuition — deep pattern recognition over agent history."""
    # Reused from evaluation intuition
    temporal_pattern: str = "insufficient_data"
    anomaly_flags: list[str] = Field(default_factory=list)
    agent_balance: float = Field(default=0.0, ge=0.0, le=1.0)
    agent_variance: float = Field(default=0.0, ge=0.0)
    suggested_focus: list[str] = Field(default_factory=list)
    # Reflection-specific extensions
    per_trait_trends: list[TraitTrend] = Field(default_factory=list)
    cohort_anomalies: dict[str, float] = Field(default_factory=dict)
    character_drift: float = 0.0  # delta between recent and historical avg
    balance_trend: str = "stable"  # improving, declining, stable


class InstinctResult(BaseModel):
    """Instinct layer result — instant keyword scan, no I/O.

    Pre-wired pattern matching that fires before experience.
    Determines routing tier for deliberation depth.
    """
    total_flags: int = 0
    flagged_traits: dict[str, int] = Field(default_factory=dict)
    density: float = 0.0
    routing_tier: str = "standard"


# Backward compatibility alias
KeywordScanResult = InstinctResult


class IntuitionResult(BaseModel):
    """Intuition layer result — graph-based pattern recognition.

    Accumulated wisdom from past evaluations. Tells deliberation
    where to look harder, not what the score should be.
    """
    confidence_adjustment: float = Field(default=0.0, ge=-1.0, le=1.0)
    similar_cases: int = 0
    anomaly_flags: list[str] = Field(default_factory=list)
    suggested_focus: list[str] = Field(default_factory=list)
    temporal_pattern: str = "insufficient_data"
    agent_variance: float = Field(default=0.0, ge=0.0)
    agent_balance: float = Field(default=0.0, ge=0.0, le=1.0)
    prior_evaluations: int = 0


# ── Authenticity detection models ────────────────────────────────────


TemporalClassification = Literal["autonomous", "human_influenced", "indeterminate"]
BurstClassification = Literal["organic", "automated", "burst_bot"]
ActivityClassification = Literal["always_on", "human_schedule", "mixed"]
AuthenticityClassification = Literal["likely_autonomous", "likely_human", "bot_farm", "indeterminate"]


class TemporalSignature(BaseModel):
    """Temporal fingerprint from posting interval analysis."""
    cv_score: float = Field(default=0.0, ge=0.0, le=1.0)
    mean_interval_seconds: float = 0.0
    classification: TemporalClassification = "indeterminate"


class BurstAnalysis(BaseModel):
    """Burst-posting detection for bot farm identification."""
    burst_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    classification: BurstClassification = "organic"


class ActivityPattern(BaseModel):
    """24-hour activity distribution analysis."""
    classification: ActivityClassification = "mixed"
    active_hours: int = 24
    has_sleep_gap: bool = False


class IdentitySignals(BaseModel):
    """Platform identity and verification signals."""
    is_claimed: bool = False
    owner_verified: bool = False
    karma_post_ratio: float = Field(default=0.0, ge=0.0)


class AuthenticityResult(BaseModel):
    """Composite authenticity assessment for an agent."""
    agent_name: str = ""
    temporal: TemporalSignature = Field(default_factory=TemporalSignature)
    burst: BurstAnalysis = Field(default_factory=BurstAnalysis)
    activity: ActivityPattern = Field(default_factory=ActivityPattern)
    identity: IdentitySignals = Field(default_factory=IdentitySignals)
    authenticity_score: float = Field(default=0.5, ge=0.0, le=1.0)
    classification: AuthenticityClassification = "indeterminate"
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
