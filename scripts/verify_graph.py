"""Verify that seed_graph.py populated the Neo4j graph with evaluations."""

from neo4j import GraphDatabase

d = GraphDatabase.driver("bolt://localhost:7694", auth=("neo4j", "password"))
r, _, _ = d.execute_query(
    "MATCH (a:Agent)-[:EVALUATED]->(e:Evaluation) "
    "RETURN count(a) AS agents, count(e) AS evals"
)
agents = r[0]["agents"]
evals = r[0]["evals"]
print(f"PASS: {agents} agents, {evals} evaluations")
assert agents > 0, f"Expected agents > 0, got {agents}"
assert evals > 0, f"Expected evals > 0, got {evals}"
d.close()
