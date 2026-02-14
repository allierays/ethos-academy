"""Taxonomy domain — pure data for traits, indicators, constitution, and rubrics."""

from ethos.taxonomy.traits import DIMENSIONS, TRAIT_METADATA, TRAITS
from ethos.taxonomy.indicators import INDICATORS
from ethos.taxonomy.constitution import (
    ANTHROPIC_ASSESSMENTS,
    CONSTITUTIONAL_VALUES,
    HARD_CONSTRAINTS,
    INDICATOR_ASSESSMENT_MAPPINGS,
    LEGITIMACY_TESTS,
    SABOTAGE_PATHWAYS,
)
from ethos.taxonomy.rubrics import SCORING_RUBRIC

__all__ = [
    "TRAITS",
    "DIMENSIONS",
    "TRAIT_METADATA",
    "INDICATORS",
    "CONSTITUTIONAL_VALUES",
    "HARD_CONSTRAINTS",
    "LEGITIMACY_TESTS",
    "SABOTAGE_PATHWAYS",
    "SCORING_RUBRIC",
    "ANTHROPIC_ASSESSMENTS",
    "INDICATOR_ASSESSMENT_MAPPINGS",
]
