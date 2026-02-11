from ethos import evaluate, reflect
from ethos.models import EvaluationResult, ReflectionResult


class TestEvaluate:
    def test_returns_correct_type(self):
        result = evaluate("Hello world")
        assert isinstance(result, EvaluationResult)

    def test_has_fields(self):
        result = evaluate("Hello world")
        assert hasattr(result, "ethos")
        assert hasattr(result, "logos")
        assert hasattr(result, "pathos")
        assert hasattr(result, "flags")
        assert hasattr(result, "trust")

    def test_accepts_source(self):
        result = evaluate("Hello world", source="test-agent")
        assert isinstance(result, EvaluationResult)

    def test_scores_bounded(self):
        result = evaluate("Hello world")
        assert 0.0 <= result.ethos <= 1.0
        assert 0.0 <= result.logos <= 1.0
        assert 0.0 <= result.pathos <= 1.0


class TestReflect:
    def test_returns_correct_type(self):
        result = reflect("agent-001")
        assert isinstance(result, ReflectionResult)

    def test_has_fields(self):
        result = reflect("agent-001")
        assert hasattr(result, "compassion")
        assert hasattr(result, "honesty")
        assert hasattr(result, "accuracy")
        assert hasattr(result, "trend")

    def test_valid_trend(self):
        result = reflect("agent-001")
        assert result.trend in ("improving", "declining", "stable")
