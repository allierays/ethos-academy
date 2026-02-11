"""Graph dimension balance operations — cross-dimension analysis.

Answers Graph Question 4: "Does this agent need all three to be good?"
Tests whether balanced agents (similar ethos/logos/pathos) outperform lopsided ones.

Returns graceful defaults when Neo4j is down.
"""

from __future__ import annotations

import logging

from ethos.graph.service import GraphService
from ethos.identity.hashing import hash_agent_id

logger = logging.getLogger(__name__)


_GET_AGENT_BALANCE_QUERY = """
MATCH (a:Agent {agent_id: $agent_id})-[:EVALUATED]->(e:Evaluation)
WITH a,
     avg(e.ethos) AS avg_ethos,
     avg(e.logos) AS avg_logos,
     avg(e.pathos) AS avg_pathos,
     count(e) AS eval_count
WITH a, avg_ethos, avg_logos, avg_pathos, eval_count,
     (CASE
         WHEN avg_ethos >= avg_logos AND avg_ethos >= avg_pathos THEN avg_ethos
         WHEN avg_logos >= avg_ethos AND avg_logos >= avg_pathos THEN avg_logos
         ELSE avg_pathos
     END) -
     (CASE
         WHEN avg_ethos <= avg_logos AND avg_ethos <= avg_pathos THEN avg_ethos
         WHEN avg_logos <= avg_ethos AND avg_logos <= avg_pathos THEN avg_logos
         ELSE avg_pathos
     END) AS spread
RETURN a.agent_id AS agent_id,
       avg_ethos, avg_logos, avg_pathos,
       eval_count, spread,
       CASE
           WHEN spread < 0.15 THEN 'balanced'
           WHEN spread < 0.30 THEN 'moderate'
           ELSE 'lopsided'
       END AS balance_category
"""


_GET_BALANCE_VS_TRUST_QUERY = """
MATCH (a:Agent)-[:EVALUATED]->(e:Evaluation)
WITH a,
     avg(e.ethos) AS avg_ethos,
     avg(e.logos) AS avg_logos,
     avg(e.pathos) AS avg_pathos,
     avg(e.trust_score) AS avg_trust,
     count(e) AS eval_count,
     sum(CASE WHEN size(e.flags) > 0 THEN 1 ELSE 0 END) AS flagged_count
WITH a, avg_ethos, avg_logos, avg_pathos, avg_trust, eval_count, flagged_count,
     (CASE
         WHEN avg_ethos >= avg_logos AND avg_ethos >= avg_pathos THEN avg_ethos
         WHEN avg_logos >= avg_ethos AND avg_logos >= avg_pathos THEN avg_logos
         ELSE avg_pathos
     END) -
     (CASE
         WHEN avg_ethos <= avg_logos AND avg_ethos <= avg_pathos THEN avg_ethos
         WHEN avg_logos <= avg_ethos AND avg_logos <= avg_pathos THEN avg_logos
         ELSE avg_pathos
     END) AS spread
WITH CASE
         WHEN spread < 0.15 THEN 'balanced'
         WHEN spread < 0.30 THEN 'moderate'
         ELSE 'lopsided'
     END AS balance_category,
     avg_trust, eval_count, flagged_count
RETURN balance_category,
       count(*) AS agent_count,
       avg(avg_trust) AS avg_trust,
       sum(flagged_count) * 1.0 / sum(eval_count) AS flag_rate
ORDER BY avg_trust DESC
"""


_GET_DIMENSION_GAPS_QUERY = """
MATCH (a:Agent)-[:EVALUATED]->(e:Evaluation)
WITH a,
     avg(e.ethos) AS avg_ethos,
     avg(e.logos) AS avg_logos,
     avg(e.pathos) AS avg_pathos,
     count(e) AS eval_count
WITH a, avg_ethos, avg_logos, avg_pathos, eval_count,
     (avg_ethos + avg_logos + avg_pathos) / 3.0 AS overall_avg
WHERE (overall_avg - avg_ethos > 0.2)
   OR (overall_avg - avg_logos > 0.2)
   OR (overall_avg - avg_pathos > 0.2)
RETURN a.agent_id AS agent_id,
       avg_ethos, avg_logos, avg_pathos, eval_count,
       CASE
           WHEN overall_avg - avg_ethos >= overall_avg - avg_logos
                AND overall_avg - avg_ethos >= overall_avg - avg_pathos
           THEN 'ethos'
           WHEN overall_avg - avg_logos >= overall_avg - avg_ethos
                AND overall_avg - avg_logos >= overall_avg - avg_pathos
           THEN 'logos'
           ELSE 'pathos'
       END AS weak_dimension,
       CASE
           WHEN overall_avg - avg_ethos >= overall_avg - avg_logos
                AND overall_avg - avg_ethos >= overall_avg - avg_pathos
           THEN round(overall_avg - avg_ethos, 4)
           WHEN overall_avg - avg_logos >= overall_avg - avg_ethos
                AND overall_avg - avg_logos >= overall_avg - avg_pathos
           THEN round(overall_avg - avg_logos, 4)
           ELSE round(overall_avg - avg_pathos, 4)
       END AS gap_size
ORDER BY gap_size DESC
"""


_GET_COHORT_BALANCE_DISTRIBUTION_QUERY = """
MATCH (a:Agent)-[:EVALUATED]->(e:Evaluation)
WITH a,
     avg(e.ethos) AS avg_ethos,
     avg(e.logos) AS avg_logos,
     avg(e.pathos) AS avg_pathos
WITH a,
     (CASE
         WHEN avg_ethos >= avg_logos AND avg_ethos >= avg_pathos THEN avg_ethos
         WHEN avg_logos >= avg_ethos AND avg_logos >= avg_pathos THEN avg_logos
         ELSE avg_pathos
     END) -
     (CASE
         WHEN avg_ethos <= avg_logos AND avg_ethos <= avg_pathos THEN avg_ethos
         WHEN avg_logos <= avg_ethos AND avg_logos <= avg_pathos THEN avg_logos
         ELSE avg_pathos
     END) AS spread
WITH CASE
         WHEN spread < 0.15 THEN 'balanced'
         WHEN spread < 0.30 THEN 'moderate'
         ELSE 'lopsided'
     END AS balance_category
RETURN balance_category, count(*) AS agent_count
ORDER BY balance_category
"""


def get_agent_balance(service: GraphService, raw_agent_id: str) -> dict:
    """Get dimension balance analysis for a single agent.

    Returns dict with avg_ethos, avg_logos, avg_pathos, spread, and
    balance_category ('balanced', 'moderate', 'lopsided').
    Returns empty dict if unavailable.
    """
    if not service.connected:
        return {}

    hashed_id = hash_agent_id(raw_agent_id)

    try:
        records, _, _ = service.execute_query(
            _GET_AGENT_BALANCE_QUERY, {"agent_id": hashed_id}
        )
        if not records:
            return {}

        record = records[0]
        return {
            "agent_id": record.get("agent_id", ""),
            "avg_ethos": round(float(record.get("avg_ethos") or 0), 4),
            "avg_logos": round(float(record.get("avg_logos") or 0), 4),
            "avg_pathos": round(float(record.get("avg_pathos") or 0), 4),
            "spread": round(float(record.get("spread") or 0), 4),
            "balance_category": record.get("balance_category", ""),
            "evaluation_count": record.get("eval_count", 0),
        }
    except Exception as exc:
        logger.warning("Failed to get agent balance: %s", exc)
        return {}


def get_balance_vs_trust(service: GraphService) -> list[dict]:
    """Get balance-trust correlation across all agents.

    Groups agents by balance category and returns average trust outcomes
    per group. Returns empty list if unavailable.
    """
    if not service.connected:
        return []

    try:
        records, _, _ = service.execute_query(_GET_BALANCE_VS_TRUST_QUERY)
        results = []
        for record in records:
            results.append({
                "balance_category": record.get("balance_category", ""),
                "agent_count": record.get("agent_count", 0),
                "avg_trust": round(float(record.get("avg_trust") or 0), 4),
                "flag_rate": round(float(record.get("flag_rate") or 0), 4),
            })
        return results
    except Exception as exc:
        logger.warning("Failed to get balance vs trust: %s", exc)
        return []


def get_dimension_gaps(service: GraphService) -> list[dict]:
    """Find agents with a significant dimension gap.

    Returns agents where one dimension is > 0.2 below the average of
    all three. Includes the weak dimension name and gap size.
    Returns empty list if unavailable.
    """
    if not service.connected:
        return []

    try:
        records, _, _ = service.execute_query(_GET_DIMENSION_GAPS_QUERY)
        results = []
        for record in records:
            results.append({
                "agent_id": record.get("agent_id", ""),
                "avg_ethos": round(float(record.get("avg_ethos") or 0), 4),
                "avg_logos": round(float(record.get("avg_logos") or 0), 4),
                "avg_pathos": round(float(record.get("avg_pathos") or 0), 4),
                "weak_dimension": record.get("weak_dimension", ""),
                "gap_size": round(float(record.get("gap_size") or 0), 4),
                "evaluation_count": record.get("eval_count", 0),
            })
        return results
    except Exception as exc:
        logger.warning("Failed to get dimension gaps: %s", exc)
        return []


def get_cohort_balance_distribution(service: GraphService) -> dict:
    """Get network-wide balance distribution.

    Returns count of agents in each balance category:
    {'balanced': N, 'moderate': N, 'lopsided': N, 'total_agents': N}
    Returns empty dict if unavailable.
    """
    if not service.connected:
        return {}

    try:
        records, _, _ = service.execute_query(
            _GET_COHORT_BALANCE_DISTRIBUTION_QUERY
        )
        if not records:
            return {}

        distribution = {"balanced": 0, "moderate": 0, "lopsided": 0}
        total = 0
        for record in records:
            category = record.get("balance_category", "")
            count = record.get("agent_count", 0)
            if category in distribution:
                distribution[category] = count
                total += count

        distribution["total_agents"] = total
        return distribution
    except Exception as exc:
        logger.warning("Failed to get cohort balance distribution: %s", exc)
        return {}
