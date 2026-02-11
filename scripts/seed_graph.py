"""Seed the Neo4j graph with sample evaluation data."""

from ethos.models import EvaluationResult

SAMPLE_DATA = [
    {
        "agent_id": "agent-001",
        "text": "Based on peer-reviewed research, this treatment shows a 40% improvement.",
        "result": EvaluationResult(ethos=0.8, logos=0.9, pathos=0.3, trust="high"),
    },
    {
        "agent_id": "agent-001",
        "text": "You MUST act now or face terrible consequences!",
        "result": EvaluationResult(
            ethos=0.2,
            logos=0.1,
            pathos=0.9,
            flags=["emotional_manipulation"],
            trust="low",
        ),
    },
    {
        "agent_id": "agent-002",
        "text": "The data suggests a moderate correlation, though more study is needed.",
        "result": EvaluationResult(ethos=0.7, logos=0.8, pathos=0.2, trust="high"),
    },
]


def seed():
    """Seed the graph database with sample evaluations."""
    # Placeholder — requires Neo4j connection
    print(f"Would seed {len(SAMPLE_DATA)} evaluations into the graph.")
    for entry in SAMPLE_DATA:
        print(f"  {entry['agent_id']}: trust={entry['result'].trust}")


if __name__ == "__main__":
    seed()
