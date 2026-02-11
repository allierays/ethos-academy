"""Neo4j graph database integration for storing and retrieving evaluations."""

from ethos.models import EvaluationResult


def get_driver():
    """Return a Neo4j driver instance. Placeholder — requires NEO4J_URI config."""
    raise NotImplementedError("Neo4j driver not configured yet")


def store_evaluation(agent_id: str, result: EvaluationResult) -> None:
    """Store an evaluation result in the graph database."""
    raise NotImplementedError("store_evaluation not implemented yet")


def get_evaluation_history(agent_id: str) -> list[dict]:
    """Retrieve evaluation history for an agent from the graph database."""
    raise NotImplementedError("get_evaluation_history not implemented yet")
