"""Ethos — Better agents. Better data. Better alignment."""

__version__ = "0.1.0"

from ethos.evaluate import evaluate
from ethos.models import EvaluationResult, ReflectionResult
from ethos.reflect import reflect

__all__ = [
    "evaluate",
    "reflect",
    "EvaluationResult",
    "ReflectionResult",
]
