# Trust Propagation in Networks: A Research Survey for Ethos

*Comprehensive analysis of graph-based trust and reputation algorithms, with applications to the Ethos ethical knowledge graph for AI agents.*

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [EigenTrust: Distributed Trust in P2P Networks](#2-eigentrust-distributed-trust-in-p2p-networks)
3. [PageRank for Trust Networks](#3-pagerank-for-trust-networks)
4. [TrustRank: Separating Good from Bad](#4-trustrank-separating-good-from-bad)
5. [Reputation Systems: Lessons from Production](#5-reputation-systems-lessons-from-production)
6. [Graph-Based Trust Models](#6-graph-based-trust-models)
7. [Sybil Attacks and Defenses](#7-sybil-attacks-and-defenses)
8. [Neo4j Graph Data Science for Trust](#8-neo4j-graph-data-science-for-trust)
9. [Trust Metrics: Computing a Single Score](#9-trust-metrics-computing-a-single-score)
10. [The Cold Start Problem](#10-the-cold-start-problem)
11. [Trust Transitivity: Limits and Models](#11-trust-transitivity-limits-and-models)
12. [Synthesis: A Trust Architecture for Ethos](#12-synthesis-a-trust-architecture-for-ethos)
13. [References](#13-references)

---

## 1. Introduction

Ethos is an open-source ethical knowledge graph for AI agents that evaluates messages for trustworthiness across three classical dimensions of persuasion: **Ethos** (credibility), **Logos** (reasoning), and **Pathos** (emotional appeal). The system uses Neo4j to store evaluations as a graph, where nodes represent Agents, Evaluations, Traits, Dimensions, and Patterns, and relationships encode who-evaluated-whom and what-was-found.

The core question this document addresses: **How should trust propagate through this network?** If Agent A has been evaluated as trustworthy by many reliable evaluators, and Agent A vouches for Agent B, how much trust should the system assign to Agent B? How do we detect manipulation? How do we handle newcomers?

This survey covers the foundational algorithms (EigenTrust, PageRank, TrustRank), practical reputation systems (eBay, Stack Overflow), attack vectors (Sybil attacks), and mathematical tools (Bayesian inference, Wilson scores, subjective logic) needed to build a robust trust propagation system in Ethos's graph.

### Ethos Graph Schema Reference

The algorithms described here map onto these node types:

| Node Type | Description | Key Properties |
|-----------|-------------|----------------|
| **Agent** | An AI agent whose messages are evaluated | `agent_id`, `trust_score`, `evaluation_count` |
| **Evaluation** | A single assessment of a message | `ethos`, `logos`, `pathos`, `trust`, `flags`, `timestamp` |
| **Trait** | A behavioral characteristic (e.g., honesty) | `name`, `score`, `confidence` |
| **Dimension** | One of the three evaluation axes | `name` (ethos/logos/pathos), `weight` |
| **Pattern** | Recurring behavior detected over time | `type`, `frequency`, `severity` |

Key relationships: `(Agent)-[:PRODUCED]->(Message)`, `(Evaluation)-[:EVALUATES]->(Message)`, `(Evaluation)-[:SCORED]->(Dimension)`, `(Agent)-[:EXHIBITS]->(Trait)`, `(Agent)-[:SHOWS]->(Pattern)`.

---

## 2. EigenTrust: Distributed Trust in P2P Networks

### Background

EigenTrust was developed by Kamvar, Schlosser, and Garcia-Molina (2003) at Stanford for managing reputation in peer-to-peer file-sharing networks. The fundamental insight: **trust is transitive**. If peer *i* trusts peer *j*, then *i* should place some trust in the peers that *j* trusts.

### Mathematical Formulation

#### Step 1: Local Trust Values

Each peer *i* computes a local trust value for peer *j* based on their direct interaction history:

```
s_ij = sat(i,j) - unsat(i,j)
```

Where `sat(i,j)` is the number of satisfactory transactions and `unsat(i,j)` is the number of unsatisfactory transactions between *i* and *j*.

#### Step 2: Normalization

To prevent malicious peers from assigning arbitrarily high trust to colluders, local trust values are normalized:

```
c_ij = max(s_ij, 0) / sum_j(max(s_ij, 0))
```

This ensures:
- All values are non-negative (negative trust is clipped to zero)
- Values sum to 1 for each peer (forming a proper probability distribution)
- The result is a row-stochastic matrix **C** where `C[i][j] = c_ij`

#### Step 3: Global Trust via Transitive Aggregation

The global trust that peer *i* places in peer *k* by asking all its trusted peers:

```
t_ik = sum_j(c_ij * c_jk)
```

In matrix form, this is one step of multiplication: **t** = **C**^T * **c_i**

Extending this to *n* hops:

```
t(k+1) = C^T * t(k)
```

#### Step 4: Convergence to Eigenvector

As *k* approaches infinity, **t** converges to the **left principal eigenvector** of **C**. This is the stationary distribution of the Markov chain defined by the normalized trust matrix -- the same mathematical foundation as PageRank.

#### Step 5: Pre-Trusted Peers and Damping

To handle cold-start and ensure convergence, EigenTrust introduces pre-trusted peers with a damping parameter *a*:

```
t(k+1) = (1 - a) * C^T * t(k) + a * p
```

Where:
- **p** is a distribution over pre-trusted peers (analogous to PageRank's teleportation vector)
- *a* controls the weight given to pre-trusted peers vs. computed trust (typically 0.1-0.3)

This guarantees convergence and prevents isolated malicious clusters from bootstrapping their own trust.

### Probabilistic Interpretation

The global trust vector **t** can be interpreted as the **stationary distribution of a random walk** on the trust graph: a random walker who, at each step, either follows trust edges (with probability 1-*a*) or jumps to a pre-trusted peer (with probability *a*). The fraction of time spent at each node in the long run equals its global trust score.

### Application to Ethos

In Ethos, EigenTrust maps naturally:

```cypher
// Local trust: count positive vs negative evaluations between agents
MATCH (evaluator:Agent)-[:PRODUCED]->(eval:Evaluation)-[:EVALUATES]->(msg)
      <-[:PRODUCED]-(evaluated:Agent)
WITH evaluator, evaluated,
     count(CASE WHEN eval.trust = 'high' THEN 1 END) as positive,
     count(CASE WHEN eval.trust = 'low' THEN 1 END) as negative
WITH evaluator, evaluated, positive - negative as local_trust
WHERE local_trust > 0
// Normalize per evaluator
WITH evaluator, collect({agent: evaluated, trust: local_trust}) as trusts,
     sum(local_trust) as total
UNWIND trusts as t
MERGE (evaluator)-[r:TRUSTS]->(t.agent)
SET r.weight = toFloat(t.trust) / total
```

Then run PageRank (which implements the same power iteration) on the TRUSTS relationships with pre-trusted seed agents.

---

## 3. PageRank for Trust Networks

### The Original Algorithm

Google's PageRank, developed by Brin and Page (1998), computes the importance of web pages based on link structure. The core formula:

```
PR(A) = (1 - d) + d * sum_i(PR(T_i) / L(T_i))
```

Where:
- `PR(A)` is the PageRank of page A
- `d` is the damping factor (typically 0.85)
- `T_i` are pages that link to A
- `L(T_i)` is the number of outbound links from T_i

In matrix form:

```
PR = (1 - d) * (1/N) * e + d * M * PR
```

Where **M** is the column-normalized adjacency matrix and **e** is a vector of ones.

### The Random Surfer Model

PageRank models a "random surfer" who:
- With probability *d* (0.85), follows a random outgoing link from the current page
- With probability *(1-d)* (0.15), jumps to a uniformly random page

The PageRank of a page equals the long-run probability that the surfer is on that page.

### Personalized PageRank for Trust

Standard PageRank uses a uniform teleportation vector. **Personalized PageRank** (PPR) biases toward specific nodes:

```
PR = (1 - d) * v + d * M * PR
```

Where **v** is a personalization vector concentrated on seed nodes. This is the key for trust networks: instead of "any random page," the surfer teleports to a **trusted seed node**.

PPR gives each node a trust score relative to the seed set. Twitter uses Personalized PageRank for its "Who to Follow" recommendations.

### Weighted PageRank

When relationships carry weights (e.g., evaluation scores), the transition matrix **M** incorporates edge weights:

```
M[j][i] = w(i,j) / sum_k(w(i,k))
```

Where `w(i,j)` is the weight of the edge from *i* to *j*.

### Application to Ethos

PageRank can compute agent importance/trustworthiness directly:

```cypher
// Project the agent trust graph
CALL gds.graph.project(
  'agent-trust',
  'Agent',
  'TRUSTS',
  { relationshipProperties: 'weight' }
)

// Run weighted PageRank
CALL gds.pageRank.stream('agent-trust', {
  maxIterations: 20,
  dampingFactor: 0.85,
  relationshipWeightProperty: 'weight'
})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).agent_id AS agent, score
ORDER BY score DESC
```

Agents trusted by highly-trusted agents will have higher PageRank scores -- the fundamental "trust by association" property.

### Key Configuration for Trust Networks

| Parameter | Recommended Value | Rationale |
|-----------|------------------|-----------|
| `dampingFactor` | 0.85 | Standard; higher values weight graph structure more |
| `maxIterations` | 20-40 | Usually converges well before 20 |
| `tolerance` | 1e-7 | Stop when scores change less than this |
| `sourceNodes` | Seed trusted agents | For Personalized PageRank |

### Limitations

- PageRank treats all incoming links equally unless weighted
- Vulnerable to link farms and self-promotion attacks (addressed by TrustRank)
- Does not distinguish between trust and distrust (no negative edges natively)

---

## 4. TrustRank: Separating Good from Bad

### Background

TrustRank was developed by Gyongyi, Garcia-Molina, and Pedersen (2004) specifically to combat web spam. The key insight: **good nodes rarely link to bad nodes**. By starting from a set of verified good nodes and propagating trust outward, spam nodes receive little or no trust.

### Mathematical Formulation

TrustRank is a biased PageRank where the teleportation vector is concentrated on human-verified seed nodes:

```
r = beta * T * r + (1 - beta) * d
```

Where:
- **r** = TrustRank score vector
- **beta** = damping factor (probability of following a link, typically 0.85)
- **T** = row-normalized transition matrix
- **d** = seed distribution vector (sums to 1, non-zero only for seed nodes)

### Seed Selection via Inverse PageRank

TrustRank selects seeds strategically using **Inverse PageRank** -- running PageRank on the reversed graph to find nodes that would be most useful for discovering additional trustworthy nodes. High Inverse PageRank nodes are those that many other pages point to, making them good candidates for seed evaluation.

### Trust Attenuation

Trust attenuates with distance from seed nodes. A node 1 hop from a seed gets more trust than a node 3 hops away, because at each hop the trust is split among outgoing links and dampened by *beta*:

```
Trust at distance k ~ beta^k / (average_out_degree^k)
```

This exponential decay means nodes far from trusted seeds receive negligible trust, naturally isolating spam clusters.

### Anti-TrustRank

The complement to TrustRank: start from known **bad** seed nodes and propagate **distrust** backward along incoming links. Nodes that link to many known-bad nodes receive high anti-trust scores.

```
anti_trust(v) = (1 - beta) * d_bad + beta * T_reverse * anti_trust
```

A node is classified as spam if: `anti_trust(v) > threshold` AND `trust_rank(v) < threshold`

### Performance

The original TrustRank paper tested on a 31-million-page crawl and achieved:
- **86% precision** at 55% recall for identifying spam
- Significantly better than pure PageRank for spam detection

### Application to Ethos

TrustRank maps directly to the Ethos trust problem:

1. **Seed Selection**: Manually verify a small set of agents as trustworthy (e.g., agents from known organizations, agents with extensive positive evaluation histories reviewed by humans)

2. **Trust Propagation**: Run Personalized PageRank from the seed set

3. **Anti-Trust**: Identify agents with consistently low evaluation scores as negative seeds, run reverse propagation to find agents that frequently endorse untrustworthy agents

```cypher
// TrustRank: Personalized PageRank from verified seeds
MATCH (seed:Agent {verified: true})
WITH collect(seed) AS seeds
CALL gds.pageRank.stream('agent-trust', {
  maxIterations: 20,
  dampingFactor: 0.85,
  sourceNodes: seeds
})
YIELD nodeId, score
SET gds.util.asNode(nodeId).trust_rank = score
```

---

## 5. Reputation Systems: Lessons from Production

### eBay's Feedback System

eBay's reputation system is one of the most studied in the literature. Key design elements:

- **Binary feedback**: Buyers and sellers rate each other as positive, negative, or neutral
- **Feedback score**: Net positive ratings (positives minus negatives)
- **Percentage positive**: Shown prominently as a percentage

**Documented failures:**
- **Retaliation feedback**: Sellers coerce buyers into revoking negative feedback through threats of retaliatory negative ratings, enabling low-quality sellers to masquerade as high-quality
- **Reciprocity bias**: Users overwhelmingly leave positive feedback (99%+ positive rate), making the signal nearly useless for differentiation
- **Early reputation lock-in**: Once a seller has thousands of positives, a few negatives are statistically invisible, reducing accountability
- **Strategic timing**: Sellers time feedback to game the system

**Research finding** (Resnick et al.): eBay's reputation system has "done an inadequate job of deterring fraud" and required eBay to implement additional monitoring mechanisms beyond the feedback system itself.

### Stack Overflow's Reputation

Stack Overflow uses a point-based system where:
- Upvotes on questions: +10 points
- Upvotes on answers: +10 points
- Accepted answer: +15 points
- Downvotes received: -2 points

**Documented gaming patterns:**
- **Voting rings**: Groups of users systematically upvote each other's posts
- **Sock puppet accounts**: Creating multiple accounts to self-vote
- **Strategic answering**: Answering easy questions rapidly for point farming instead of contributing deep knowledge
- **Reputation gaming**: Studies found 4 distinct fraud scenarios, with algorithms detecting suspicious users whose reputation scores were subsequently reduced by 60-80%

### Design Principles for Reputation Systems

From research by Dellarocas, Tadelis, and others:

1. **Separate signals from noise**: Raw counts are misleading. Use statistical methods (Wilson score, Bayesian averaging) to handle varying sample sizes.

2. **Weight recent activity**: Old feedback should decay in influence. An agent that was trustworthy 6 months ago but deceptive recently should not retain high trust.

3. **Resist reciprocity bias**: If evaluation is symmetric (A evaluates B and B evaluates A), expect inflated scores. Design for asymmetric evaluation.

4. **Make gaming expensive**: The cost of gaming should exceed the benefit. This means identity creation should have a cost, and trust should be hard to earn but easy to lose.

5. **Distinguish dimensions**: A single reputation number loses information. Ethos's three-dimensional evaluation (ethos/logos/pathos) preserves meaningful distinctions.

6. **Provide context**: A trust score of 0.7 means nothing without knowing: How many evaluations? Over what time period? By whom? With what confidence?

### Application to Ethos

Ethos already avoids several failure modes:
- **Multi-dimensional scoring** (ethos, logos, pathos) prevents collapsing trust into a single gameable number
- **Flag system** (e.g., "emotional_manipulation") adds qualitative signals
- **Graph structure** preserves who-evaluated-whom, enabling analysis of evaluator reliability
- **Temporal data** (timestamps on evaluations) enables decay weighting

Additional recommendations:
- Store evaluator reliability scores so that evaluations from consistently accurate agents carry more weight
- Implement asymmetric evaluation (agents should not evaluate their own evaluators)
- Track and flag rapid reputation changes as suspicious

---

## 6. Graph-Based Trust Models

### Transitive Trust

The most fundamental property in trust networks: if A trusts B and B trusts C, then A can derive some trust in C. However, trust transitivity is **not perfect** -- trust attenuates along paths.

#### Multiplicative Model

The simplest transitive trust model multiplies trust along paths:

```
trust(A -> C via B) = trust(A -> B) * trust(B -> C)
```

For a path of length *k*:

```
trust(A -> Z) = product(trust(edge_i) for i in path)
```

This causes exponential decay: for trust values of 0.8 at each edge, a path of length 5 gives 0.8^5 = 0.328.

#### Discounting Model

A more nuanced approach applies a **discount factor** at each hop:

```
trust(A -> C) = d * trust(A -> B) * trust(B -> C) + (1-d) * prior
```

Where *d* is a discount factor (0 < d < 1) and *prior* is a default trust assumption.

### The Absolute Trust Threshold

Research by Richters and Peixoto (2011) on trust transitivity in social networks revealed a critical finding: **a non-zero fraction of absolute trust (trust = 1.0) is required for viable global trust propagation in large networks**.

Without some edges of complete confidence:
- Average pairwise trust converges to zero as network size increases
- Trust propagation exhibits a **discontinuous phase transition** at a critical fraction of absolute trust
- Below the threshold, the network cannot sustain global trust

This has profound implications for Ethos: the system needs some "anchor" relationships of very high confidence (e.g., human-verified evaluations, evaluations from known-reliable systems) to bootstrap trust across the entire graph.

### Trust and Distrust as Separate Signals

Research distinguishes between:
- **Trust**: Positive endorsement, belief in reliability
- **Distrust**: Active negative assessment, belief in unreliability
- **Uncertainty**: Lack of information (neither trust nor distrust)

These are not a single continuum. An agent can be simultaneously trusted for honesty and distrusted for accuracy. Ethos's multi-dimensional model naturally supports this:

```cypher
// An agent can have high ethos (trusted for credibility)
// but low logos (distrusted for reasoning quality)
MATCH (a:Agent)-[:EXHIBITS]->(t:Trait)
RETURN a.agent_id, t.name, t.score
```

### Maximum Flow Trust Metrics (Advogato)

The Advogato trust metric, developed by Raph Levien, uses **maximum network flow** to compute trust:

1. Create a source node connected to all seed (trusted) nodes
2. Create a sink node connected to all other nodes
3. Each node has a **capacity** limiting how much trust can flow through it
4. Compute maximum flow from source to sink
5. Nodes reachable by the flow are "trusted"; unreachable nodes are not

The key security property: the number of falsely trusted nodes scales **linearly** with the number of attack edges (edges from honest nodes to malicious nodes), regardless of how many fake identities the attacker creates. This makes it resistant to catastrophic Sybil attacks.

#### Graph Transformation

Each node *x* is split into two nodes *x-* and *x+*:
- Edge from *x-* to *x+* with capacity `c - 1` (where *c* is the node's trust capacity)
- For each original edge *s* to *t*: infinite capacity edge from *s+* to *t-*
- Unit capacity edge from each *x-* to the supersink

### Propagation in Directed vs. Undirected Graphs

Trust in Ethos is **directed**: Agent A evaluating Agent B does not imply B has evaluated A. This matters for algorithm selection:

- **PageRank/EigenTrust**: Designed for directed graphs; natural fit
- **Community detection**: Some algorithms (Louvain) work on undirected graphs; may need adaptation
- **Similarity**: Node similarity can work on the bipartite graph of (Agent)-[:EVALUATES]->(Agent)

---

## 7. Sybil Attacks and Defenses

### The Sybil Attack

A Sybil attack occurs when a single adversary creates multiple fake identities (Sybil nodes) to gain disproportionate influence in a trust/reputation system. Named after the famous case study of dissociative identity disorder.

**Vulnerability factors:**
- How cheaply can new identities be created?
- Does the system accept inputs from entities without a chain of trust to known entities?
- Does the system treat all entities identically regardless of age/history?

### Attack Patterns in Trust Systems

1. **Self-promotion**: Create N fake agents that all give high evaluations to the attacker's real agent. With N Sybils, the attacker can fabricate N positive evaluations.

2. **Badmouthing**: Create N fake agents that all give low evaluations to a legitimate agent, destroying its reputation.

3. **Ballot stuffing**: Sybil nodes evaluate each other positively, creating an artificial cluster of "trusted" agents.

4. **Whitewashing**: After accumulating negative reputation, abandon the identity and create a new one with a fresh slate.

5. **Orchestrated oscillation**: Sybils alternate between good and bad behavior to maintain adequate trust while periodically attacking.

### Defense Mechanisms

#### Graph-Based Detection

The fundamental insight: **attackers can create many identities but few trust relationships with honest nodes**. This creates a sparse "cut" in the graph between the Sybil region and the honest region.

**SybilGuard** and **SybilLimit** exploit this:
- Model the social graph as having a clear bottleneck between honest and Sybil regions
- Use random walks that are unlikely to cross this bottleneck
- Bound the number of Sybil nodes that can be accepted

**SybilRank** uses a similar principle with short random walks from trusted seed nodes -- Sybil nodes are unlikely to be reached by these walks.

#### Detection Heuristics for Ethos

```
Suspicious indicators:
- Burst of new agents all evaluating the same target
- Agents that only evaluate one other agent (single-purpose accounts)
- Clusters of agents that exclusively evaluate each other
- Agents with no evaluation history suddenly receiving many positives
- Evaluation patterns that are statistically improbable (all identical scores)
```

#### Structural Analysis

```cypher
// Detect potential voting rings: clusters that exclusively evaluate each other
MATCH (a:Agent)-[:PRODUCED]->(e:Evaluation)-[:EVALUATES]->(m)<-[:PRODUCED]-(b:Agent)
WHERE a <> b
WITH a, b, count(e) as mutual_evals
WHERE mutual_evals > 5
MATCH (a)-[:PRODUCED]->(ea:Evaluation), (b)-[:PRODUCED]->(eb:Evaluation)
WITH a, b, mutual_evals,
     count(DISTINCT ea) as a_total_evals,
     count(DISTINCT eb) as b_total_evals
WHERE toFloat(mutual_evals) / a_total_evals > 0.5
  AND toFloat(mutual_evals) / b_total_evals > 0.5
RETURN a.agent_id, b.agent_id, mutual_evals, a_total_evals, b_total_evals
```

#### Economic Defenses

- **Proof of work**: Require computational cost for agent registration
- **Proof of stake**: Require agents to put up collateral that is slashed for misbehavior
- **Rate limiting**: Cap the number of evaluations an agent can produce per time window
- **Identity binding**: Tie agent identities to real-world entities where possible

#### Algorithmic Defenses

- **Personalized trust**: Use Personalized PageRank from verified seeds rather than global PageRank. Sybil nodes far from seeds get negligible trust.
- **Temporal analysis**: New agents get lower weight. Trust should increase slowly and decay quickly on negative signals.
- **Community detection**: Use Louvain/Leiden to find suspicious clusters, then analyze their connection pattern to the honest graph.

---

## 8. Neo4j Graph Data Science for Trust

Neo4j's Graph Data Science (GDS) library provides production-ready implementations of algorithms directly applicable to trust network analysis.

### Centrality Algorithms (Node Importance)

| Algorithm | Trust Application | Complexity |
|-----------|-------------------|------------|
| **PageRank** | Global agent trustworthiness | O(V + E) per iteration |
| **Personalized PageRank** | Trust relative to verified seeds | O(V + E) per iteration |
| **Eigenvector Centrality** | Agents connected to important agents | O(V + E) per iteration |
| **Betweenness Centrality** | Agents that bridge trust communities | O(V * E) |
| **Degree Centrality** | Most-evaluated agents (incoming) or most-active evaluators (outgoing) | O(V + E) |
| **Article Rank** | Variant of PageRank that dampens low-degree node influence | O(V + E) per iteration |
| **CELF** | Influence maximization -- find agents whose trust spreads furthest | O(k * V * E) |
| **Harmonic Centrality** | How "reachable" an agent is from all others | O(V * (V + E)) |
| **HITS** | Distinguish hubs (good evaluators) from authorities (trusted agents) | O(V + E) per iteration |

**Recommended for Ethos:**
- **PageRank** (weighted) for global trust scores
- **Personalized PageRank** for trust relative to human-verified seeds (TrustRank)
- **HITS** to separately identify reliable evaluators (hubs) and trustworthy agents (authorities)
- **Betweenness Centrality** to find agents that bridge different communities

### Community Detection Algorithms

| Algorithm | Trust Application |
|-----------|-------------------|
| **Louvain** | Detect communities of agents that trust each other |
| **Leiden** | Improved Louvain with better stability guarantees |
| **Label Propagation** | Fast community detection for large graphs |
| **Weakly Connected Components** | Find isolated trust clusters |
| **Strongly Connected Components** | Find mutual trust groups (A trusts B and B trusts A) |
| **Triangle Count** | Measure local clustering -- triadic closure indicates stronger trust |
| **Local Clustering Coefficient** | How tightly knit an agent's trust neighborhood is |
| **K-Core Decomposition** | Find the densest core of the trust network |

**Recommended for Ethos:**
- **Leiden** for community detection (more stable than Louvain)
- **Triangle Count / Clustering Coefficient** to identify tightly-knit trust clusters (potential collusion or genuine trust communities)
- **WCC/SCC** to identify isolated or disconnected agent groups

### Similarity Algorithms

| Algorithm | Trust Application |
|-----------|-------------------|
| **Node Similarity (Jaccard)** | Agents evaluated similarly by the same evaluators |
| **Node Similarity (Cosine)** | Weighted version for continuous trust scores |
| **Node Similarity (Overlap)** | When one agent's evaluator set is a subset of another's |

**Recommended for Ethos:**
- **Cosine Similarity** on evaluation patterns to find agents with similar trust profiles
- Useful for: "agents like this one" recommendations, anomaly detection (agents that should be similar but diverge)

### Example: Complete Trust Analysis Pipeline

```cypher
// Step 1: Project the graph
CALL gds.graph.project(
  'ethos-trust',
  ['Agent'],
  {
    TRUSTS: {
      type: 'TRUSTS',
      properties: 'weight',
      orientation: 'NATURAL'
    }
  }
)

// Step 2: Run PageRank for global trust
CALL gds.pageRank.mutate('ethos-trust', {
  mutateProperty: 'trustRank',
  dampingFactor: 0.85,
  maxIterations: 20,
  relationshipWeightProperty: 'weight'
})

// Step 3: Run Leiden for community detection
CALL gds.leiden.mutate('ethos-trust', {
  mutateProperty: 'communityId'
})

// Step 4: Run betweenness for bridge detection
CALL gds.betweenness.mutate('ethos-trust', {
  mutateProperty: 'bridgeScore'
})

// Step 5: Write all results back
CALL gds.graph.nodeProperties.write('ethos-trust',
  ['trustRank', 'communityId', 'bridgeScore'])

// Step 6: Analyze results
MATCH (a:Agent)
RETURN a.agent_id, a.trustRank, a.communityId, a.bridgeScore
ORDER BY a.trustRank DESC
```

---

## 9. Trust Metrics: Computing a Single Score

### The Challenge

Given a graph of evaluations with multiple dimensions (ethos, logos, pathos), timestamps, evaluator reliability scores, and relationship types, how do we compute a meaningful single trust score for an agent?

### Method 1: Weighted Dimensional Average

The simplest approach weights the three dimensions:

```
trust(agent) = w_e * avg(ethos_scores) + w_l * avg(logos_scores) + w_p * avg(pathos_scores)
```

Default weights might be: `w_e = 0.4, w_l = 0.4, w_p = 0.2` (less weight on pathos since high pathos can be either persuasive or manipulative).

**Problem**: Simple averages are misleading with few evaluations. An agent with 2 perfect scores looks better than one with 100 scores averaging 0.85.

### Method 2: Wilson Score Interval

The Wilson score interval provides a statistically rigorous lower bound for rating systems. Originally developed by Edwin B. Wilson in 1927, it answers: **Given the observed ratings, what is the minimum positive fraction we can claim with 95% confidence?**

For binary ratings (trust = "high" vs. trust = "low"):

```
W = (p_hat + z^2/(2n) - z * sqrt((p_hat*(1-p_hat) + z^2/(4n)) / n)) / (1 + z^2/n)
```

Where:
- `p_hat` = observed fraction of positive evaluations
- `n` = total number of evaluations
- `z` = z-score for desired confidence (1.96 for 95%)

**Key property**: With few evaluations, the lower bound is conservatively low. With many evaluations, it approaches the true proportion. This naturally handles the "2 perfect scores vs. 100 good scores" problem.

**Example calculations:**

| Positive | Total | Simple Average | Wilson Lower Bound (95%) |
|----------|-------|---------------|------------------------|
| 2 | 2 | 1.000 | 0.342 |
| 95 | 100 | 0.950 | 0.893 |
| 1 | 1 | 1.000 | 0.206 |
| 50 | 100 | 0.500 | 0.403 |

The agent with 95/100 positive evaluations (Wilson = 0.893) correctly outranks the agent with 2/2 positive evaluations (Wilson = 0.342).

### Method 3: Bayesian Trust (Beta Distribution)

Model trust as a Beta distribution, the conjugate prior for Bernoulli trials:

```
Trust ~ Beta(alpha, beta)
```

Where:
- `alpha = 1 + positive_evaluations` (prior of 1 for Laplace smoothing)
- `beta = 1 + negative_evaluations`

The **expected trust** is:

```
E[trust] = alpha / (alpha + beta)
```

The **variance** (uncertainty) is:

```
Var[trust] = (alpha * beta) / ((alpha + beta)^2 * (alpha + beta + 1))
```

**Advantages:**
- Naturally incorporates prior beliefs (the initial Beta(1,1) is a uniform prior)
- Uncertainty decreases with more observations
- Can be updated incrementally: each new evaluation just adds to alpha or beta
- Posterior can serve as the prior for the next observation (sequential learning)

**For continuous scores (0-1):**

Treat each evaluation score as a "partial" positive/negative:

```
alpha = 1 + sum(scores)
beta = 1 + sum(1 - scores)
```

An evaluation with ethos=0.8 contributes 0.8 to alpha and 0.2 to beta.

### Method 4: Subjective Logic (Josang)

Subjective logic represents trust as an **opinion** tuple `(b, d, u, a)`:

- **b** (belief): Evidence supporting trust
- **d** (disbelief): Evidence against trust
- **u** (uncertainty): Remaining uncertainty
- **a** (base rate): Prior probability of trust

Constraint: `b + d + u = 1`

The **projected probability** (expected trust):

```
P = b + a * u
```

This elegantly captures the difference between:
- "I believe this agent is trustworthy" (b=0.8, d=0.1, u=0.1)
- "I don't know if this agent is trustworthy" (b=0.0, d=0.0, u=1.0)
- "I believe this agent is untrustworthy" (b=0.1, d=0.8, u=0.1)

Both the first and third cases have low uncertainty but different conclusions. The second has high uncertainty -- a fundamentally different state.

**Mapping from observations:**

```
b = p / (p + n + 2)
d = n / (p + n + 2)
u = 2 / (p + n + 2)
```

Where *p* is positive evidence count and *n* is negative evidence count.

**Consensus operator** (combining opinions from multiple evaluators):

```
b_combined = (b1*u2 + b2*u1) / (u1 + u2 - u1*u2)
d_combined = (d1*u2 + d2*u1) / (u1 + u2 - u1*u2)
u_combined = (u1*u2) / (u1 + u2 - u1*u2)
```

### Method 5: Temporal Decay

Recent evaluations should matter more than old ones. Apply exponential decay:

```
weight(eval) = exp(-lambda * (t_now - t_eval))
```

Where `lambda` is the decay rate. Common choices:
- `lambda = 0.01` per day: half-life of ~69 days
- `lambda = 0.001` per day: half-life of ~693 days
- `lambda = 0.1` per day: half-life of ~7 days

**Weighted trust with decay:**

```
trust(agent) = sum(weight_i * score_i) / sum(weight_i)
```

This means an agent that was manipulative 6 months ago but honest recently will show improvement, while an agent that was honest but recently became manipulative will show rapid decline.

### Method 6: Evaluator-Weighted Trust

Not all evaluators are equally reliable. Weight evaluations by the evaluator's own trust:

```
trust(agent) = sum(trust(evaluator_i) * score_i) / sum(trust(evaluator_i))
```

This is precisely the EigenTrust/PageRank concept applied at the scoring level. An evaluation from a highly-trusted evaluator counts more.

### Recommended Composite Score for Ethos

Combine methods 1, 3, 5, and 6:

```
For each agent A:
  For each evaluation E_i of A by evaluator V_i at time t_i:
    w_i = trust(V_i) * exp(-lambda * (now - t_i))
    s_i = 0.4 * E_i.ethos + 0.4 * E_i.logos + 0.2 * E_i.pathos

  alpha = 1 + sum(w_i * s_i)
  beta = 1 + sum(w_i * (1 - s_i))

  trust_score = alpha / (alpha + beta)
  confidence = 1 - (2 / (alpha + beta))

  Return (trust_score, confidence)
```

This gives:
- **Trust score**: Bayesian estimate incorporating evaluator reliability and temporal decay
- **Confidence**: How certain we are (low for new agents, high for well-evaluated ones)

---

## 10. The Cold Start Problem

### The Challenge

When a new agent enters the system with zero evaluation history, what trust score should it receive?

**The dilemma:**
- Assign high trust: Malicious agents can enter and cause damage before being detected
- Assign low trust: Legitimate new agents are unfairly penalized
- Assign medium trust: Provides no useful signal

### Approach 1: Prior-Based Initialization

Use the Bayesian framework with an informative prior:

```
New agent: Beta(alpha_0, beta_0) where alpha_0 = beta_0 = 1
E[trust] = 0.5, high uncertainty
```

The agent starts at 0.5 (neutral) with maximum uncertainty. As evaluations accumulate, the score moves toward the evidence.

**Alternative priors:**
- **Optimistic**: Beta(2, 1) -- start at 0.67, reward newcomers
- **Pessimistic**: Beta(1, 2) -- start at 0.33, protect the network
- **System-average**: Beta(alpha_avg, beta_avg) based on the current system average

### Approach 2: Vouching / Endorsement

Allow existing trusted agents to vouch for new agents:

```
trust_initial(new_agent) = discount * trust(voucher) * voucher_confidence
```

Where `discount` is typically 0.3-0.5 (a new agent should never start with more trust than a fraction of its voucher's trust).

```cypher
// Record a vouch
MERGE (voucher:Agent {agent_id: $voucher_id})
MERGE (newcomer:Agent {agent_id: $newcomer_id})
MERGE (voucher)-[v:VOUCHES_FOR]->(newcomer)
SET v.timestamp = datetime(),
    v.initial_trust = voucher.trust_score * 0.4
SET newcomer.trust_score = v.initial_trust
```

### Approach 3: Probationary Period

New agents enter a probationary state:
- Limited privileges (e.g., evaluations carry lower weight)
- Accelerated evaluation (the system actively routes evaluation tasks to newcomers)
- Graduate to full status after N evaluations or T time period

```
weight(eval by newcomer) = min(1.0, evals_produced / threshold)
```

Where `threshold` might be 10 evaluations. Until the newcomer has produced 10 evaluations, their evaluations are discounted proportionally.

### Approach 4: Feature-Based Bootstrapping

If metadata is available about the agent (provider, model version, deployment context), use it:

```
trust_initial = f(agent_metadata)
```

For example:
- Agents from verified organizations get a higher starting trust
- Agents using known-reliable model architectures get a slight boost
- Agents deployed in high-stakes contexts (medical, legal) might get more scrutiny (lower starting trust)

### Approach 5: Transfer Learning

If the agent has reputation in another system:

```
trust_initial = discount * external_reputation_score
```

Where `discount` accounts for the lower reliability of cross-system reputation transfer.

### Recommended Cold Start Strategy for Ethos

```
1. All new agents start at Beta(1, 1) -> trust = 0.5, confidence = 0.0
2. If vouched for by a verified agent: trust += 0.4 * voucher.trust
3. Evaluations by new agents carry weight: min(1.0, eval_count / 10)
4. After 10+ evaluations received: graduate from "new" to "established"
5. Display confidence alongside trust score (users see "0.72 trust, 34% confidence")
```

---

## 11. Trust Transitivity: Limits and Models

### The Fundamental Question

If Agent A trusts Agent B with score 0.9, and Agent B trusts Agent C with score 0.8, how much should Agent A trust Agent C?

### Model 1: Multiplicative Transitivity

```
trust(A -> C) = trust(A -> B) * trust(B -> C) = 0.9 * 0.8 = 0.72
```

**Properties:**
- Simple and intuitive
- Trust always decreases along paths (no trust amplification)
- For paths of length *k* with uniform trust *t*: `trust = t^k`
- Decays exponentially, which may be too aggressive for short paths

### Model 2: Discounted Transitivity

Apply a path-length discount:

```
trust(A -> C, path length k) = d^k * product(trust(edge_i))
```

Where *d* is a discount factor per hop (typically 0.8-0.95).

For the example: `trust(A -> C) = 0.9 * 0.9 * 0.8 = 0.648` (with d=0.9)

### Model 3: Minimum Trust (Conservative)

```
trust(A -> C) = min(trust(A -> B), trust(B -> C)) = min(0.9, 0.8) = 0.8
```

**Properties:**
- Conservative: trust along a path can never exceed the weakest link
- Does not decay as aggressively as multiplication
- Used in some access control systems

### Model 4: Weighted Average (Aggregating Multiple Paths)

When there are multiple paths from A to C:

```
trust(A -> C) = sum(trust(path_i) * weight(path_i)) / sum(weight(path_i))
```

Where `weight(path_i)` can be based on path length, evaluator reliability, or both.

### Model 5: Maximum Trusted Path

```
trust(A -> C) = max over all paths P from A to C of: trust(P)
```

This is the most optimistic model -- if any path from A to C has high trust, A trusts C.

### Research Findings on Transitivity Limits

**Finding 1: Trust is not fully transitive** (Richters and Peixoto, 2011)

Research on cloud computing ecosystems found "no significant evidence for complete trust transitivity" in real-world trust chains. Trust attenuates faster than pure multiplication would suggest.

**Finding 2: Different trust types have different transitivity**

- **Meta belief trust** (I trust B's assessments): Transitive through other meta-trust
- **Meta commitment trust** (I trust B will fulfill obligations): NOT transitive
- **Direct trust** (I trust B from experience): NOT transitive

For Ethos, this means: "I trust that Agent B produces good evaluations" is more transitive than "I trust Agent B to be honest." The type of trust matters.

**Finding 3: Practical depth limits**

Beyond 3-4 hops, transitive trust becomes negligible:

| Hops | Multiplicative (t=0.8) | With Discount (d=0.9) |
|------|----------------------|---------------------|
| 1 | 0.800 | 0.720 |
| 2 | 0.640 | 0.518 |
| 3 | 0.512 | 0.373 |
| 4 | 0.410 | 0.268 |
| 5 | 0.328 | 0.193 |

After 4-5 hops, trust is below 0.3 even with generous assumptions. This suggests a practical maximum propagation depth of 3-4 hops.

**Finding 4: The absolute trust requirement**

For global trust propagation to work in large networks, some fraction of edges must carry "absolute trust" (trust = 1.0). Without these anchor points, average trust across the network converges to zero as the network grows. This is analogous to the seed nodes in TrustRank.

### Recommended Transitivity Model for Ethos

Use **discounted multiplicative transitivity with depth limits**:

```python
def transitive_trust(graph, source, target, max_depth=3, discount=0.9):
    """
    Compute transitive trust from source to target.

    Uses BFS to find all paths up to max_depth,
    computes trust along each path, and aggregates.
    """
    paths = find_all_paths(graph, source, target, max_depth)

    if not paths:
        return 0.0  # No trust path exists

    path_trusts = []
    for path in paths:
        # Multiplicative trust along path
        trust = 1.0
        for i in range(len(path) - 1):
            edge_trust = graph.get_edge_weight(path[i], path[i+1])
            trust *= discount * edge_trust
        path_trusts.append(trust)

    # Aggregate: weighted by trust value (higher-trust paths count more)
    total_weight = sum(path_trusts)
    if total_weight == 0:
        return 0.0

    # Use max path trust (optimistic) or weighted average (balanced)
    return max(path_trusts)  # or: sum(t*t for t in path_trusts) / total_weight
```

```cypher
// Neo4j: Find trust paths up to depth 3
MATCH path = (source:Agent {agent_id: $source_id})
             -[:TRUSTS*1..3]->
             (target:Agent {agent_id: $target_id})
WITH path,
     reduce(trust = 1.0, r IN relationships(path) |
       trust * 0.9 * r.weight) AS path_trust
RETURN path_trust
ORDER BY path_trust DESC
LIMIT 1
```

---

## 12. Synthesis: A Trust Architecture for Ethos

### Overview

Based on the research surveyed above, here is a recommended trust architecture for Ethos that combines the strongest elements of each approach.

### Layer 1: Direct Trust (Local Evaluation)

Every evaluation produces direct trust scores:

```
direct_trust(A, B) = {
  ethos: weighted_avg(evaluations of B by A on ethos dimension),
  logos: weighted_avg(evaluations of B by A on logos dimension),
  pathos: weighted_avg(evaluations of B by A on pathos dimension)
}
```

These are stored as edges in the graph with temporal metadata.

### Layer 2: Evaluator Reliability (Meta-Trust)

Not all evaluators are equally reliable. Compute evaluator reliability:

```
reliability(evaluator) = correlation(
  evaluator's scores for agents,
  consensus scores for those agents
)
```

An evaluator whose scores consistently match the network consensus is more reliable. Store as a property on the Agent node.

### Layer 3: Global Trust (EigenTrust / PageRank)

Compute global trust using weighted PageRank:

```
1. Build trust adjacency matrix from normalized evaluation scores
2. Weight by evaluator reliability and temporal decay
3. Run PageRank with d=0.85 and verified seeds as teleportation targets
4. Result: global trust score per agent
```

### Layer 4: Community Structure (Leiden)

Detect communities of agents:

```
1. Run Leiden community detection on the trust graph
2. Identify within-community trust (strong) vs. cross-community trust (weaker but more informative)
3. Flag communities with unusual patterns (e.g., near-perfect internal trust)
```

### Layer 5: Anomaly Detection (Sybil Defense)

Continuously monitor for:

```
Anomaly signals:
- New clusters of agents with unusually high mutual trust
- Agents whose trust scores change dramatically in short periods
- Evaluation patterns that deviate from statistical norms
- Agents with high trust but low evaluation diversity
```

### Layer 6: Composite Trust Score

For each agent, compute the final trust score:

```
composite_trust(agent) = {
  score: bayesian_estimate(
    evaluations,
    weighted_by = evaluator_reliability * temporal_decay
  ),
  confidence: 1 - uncertainty(bayesian_posterior),
  global_rank: pagerank_score,
  community: leiden_community_id,
  flags: anomaly_flags,
  dimensions: {
    ethos: dimension_score,
    logos: dimension_score,
    pathos: dimension_score
  }
}
```

### Implementation Roadmap

```
Phase 1: Foundation
  - Implement direct trust computation from evaluations
  - Store trust edges in Neo4j
  - Bayesian trust scoring with Beta distribution
  - Wilson score for ranking
  - Temporal decay on evaluations

Phase 2: Graph Algorithms
  - Install Neo4j GDS plugin
  - Implement weighted PageRank for global trust
  - Personalized PageRank from verified seeds (TrustRank)
  - HITS for evaluator/agent distinction

Phase 3: Community & Anomaly
  - Leiden community detection
  - Triangle counting for collusion detection
  - Sybil detection heuristics
  - Evaluation pattern analysis

Phase 4: Advanced
  - Transitive trust computation (depth-limited)
  - Cross-community trust propagation
  - Evaluator reliability scoring
  - Cold start bootstrapping with vouching
  - Trust decay and recovery models
```

### Neo4j Schema for Trust Architecture

```cypher
// Core nodes
CREATE CONSTRAINT FOR (a:Agent) REQUIRE a.agent_id IS UNIQUE;

// Agent properties
// a.trust_score        - Composite trust (0-1)
// a.trust_confidence   - Confidence in trust score (0-1)
// a.trust_rank         - PageRank-based global rank
// a.community_id       - Leiden community
// a.evaluator_reliability - How reliable this agent is as an evaluator
// a.evaluation_count   - Total evaluations received
// a.first_seen         - Timestamp of first activity
// a.is_verified        - Human-verified trusted seed
// a.is_probationary    - Still in cold-start period

// Trust relationship
// (Agent)-[:TRUSTS {weight, updated, basis_count}]->(Agent)

// Evaluation chain
// (Agent)-[:PRODUCED]->(Evaluation)-[:EVALUATES]->(Message)<-[:PRODUCED]-(Agent)
// (Evaluation)-[:SCORED {value}]->(Dimension)

// Behavioral patterns
// (Agent)-[:EXHIBITS {score, confidence}]->(Trait)
// (Agent)-[:SHOWS {frequency, severity}]->(Pattern)

// Vouching for cold start
// (Agent)-[:VOUCHES_FOR {timestamp, initial_trust}]->(Agent)
```

### Key Formulas Summary

| Component | Formula | Purpose |
|-----------|---------|---------|
| **Local Trust** | `s_ij = sat(i,j) - unsat(i,j)` | Raw interaction score |
| **Normalized Trust** | `c_ij = max(s_ij, 0) / sum(max(s_ij, 0))` | Prevent gaming |
| **PageRank** | `PR(i) = (1-d)/N + d * sum(PR(j)/L(j))` | Global importance |
| **TrustRank** | `r = beta * T * r + (1-beta) * d_seeds` | Seed-biased trust |
| **Wilson Score** | `W = (p + z^2/2n - z*sqrt(...)) / (1 + z^2/n)` | Confidence-adjusted rating |
| **Beta Trust** | `E[trust] = (1+pos) / (2+pos+neg)` | Bayesian trust estimate |
| **Temporal Decay** | `w(t) = exp(-lambda * (now - t))` | Recency weighting |
| **Transitive Trust** | `trust(A->C) = d * trust(A->B) * trust(B->C)` | Path propagation |
| **Evaluator Weight** | `w_eval = trust(evaluator) * decay(time)` | Weighted evaluations |
| **Subjective Logic** | `P = b + a * u` | Opinion with uncertainty |

---

## 13. References

### Foundational Papers

1. **EigenTrust**: Kamvar, S., Schlosser, M., Garcia-Molina, H. (2003). "The EigenTrust Algorithm for Reputation Management in P2P Networks." *Proceedings of the 12th International Conference on World Wide Web (WWW'03)*. [Stanford NLP](https://nlp.stanford.edu/pubs/eigentrust.pdf)

2. **PageRank**: Brin, S., Page, L. (1998). "The Anatomy of a Large-Scale Hypertextual Web Search Engine." *Computer Networks and ISDN Systems*. [Wikipedia: PageRank](https://en.wikipedia.org/wiki/PageRank)

3. **TrustRank**: Gyongyi, Z., Garcia-Molina, H., Pedersen, J. (2004). "Combating Web Spam with TrustRank." *Proceedings of the 30th VLDB Conference*. [VLDB PDF](https://www.vldb.org/conf/2004/RS15P3.PDF)

4. **Trust Transitivity in Social Networks**: Richters, O., Peixoto, T. (2011). "Trust Transitivity in Social Networks." *PLOS ONE*. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3071725/)

### Reputation Systems

5. **eBay Empirical Analysis**: Resnick, P., Zeckhauser, R. (2002). "Trust Among Strangers in Internet Transactions: Empirical Analysis of eBay's Reputation System." [University of Michigan](http://presnick.people.si.umich.edu/papers/ebayNBER/RZNBERBodegaBay.pdf)

6. **Reputation System Design**: Dellarocas, C. (2010). "Designing Reputation Systems for the Social Web." [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1624697)

7. **Reputation and Feedback in Online Platform Markets**: Tadelis, S. (2016). [Berkeley Haas](https://faculty.haas.berkeley.edu/stadelis/Annual_Review_Tadelis.pdf)

8. **Reputation Gaming in Stack Overflow**: Mazloomzadeh, Uddin. [Semantic Scholar](https://www.semanticscholar.org/paper/Reputation-Gaming-in-Stack-Overflow-Mazloomzadeh-Uddin/abbfb413f147514814ee59efdc942af224fa8309)

### Trust Models and Frameworks

9. **Understanding Graph-Based Trust Evaluation in Online Social Networks**: Wu et al. (2016). *ACM Computing Surveys*. [ACM](https://dl.acm.org/doi/10.1145/2906151)

10. **Subjective Logic**: Josang, A. (2016). *Subjective Logic: A Formalism for Reasoning Under Uncertainty*. Springer. [UAI Tutorial](https://www.auai.org/uai2016/tutorials_pres/subj_logic.pdf)

11. **A Survey on Trust Modeling from a Bayesian Perspective** (2018). [arXiv](https://arxiv.org/abs/1806.03916)

12. **A Survey on Trust Evaluation Based on Machine Learning** (2020). *ACM Computing Surveys*. [ACM](https://dl.acm.org/doi/fullHtml/10.1145/3408292)

### Sybil Attacks and Defenses

13. **Sybil Attack**: [Wikipedia](https://en.wikipedia.org/wiki/Sybil_attack)

14. **A Survey of Attack and Defense Techniques for Reputation Systems**: Hoffman, K. et al. [PDF](https://cnitarot.github.io/papers/p2p-reputation-survey.pdf)

15. **Sybilproof Reputation Mechanisms**: [ResearchGate](https://www.researchgate.net/publication/228367243_Sybilproof_reputation_mechanisms)

16. **Graph-based Sybil Detection in Social and Information Systems**: [ResearchGate](https://www.researchgate.net/publication/262371376_Graph-based_Sybil_detection_in_social_and_information_systems)

### Advogato Trust Metric

17. **Attack Resistant Trust Metrics**: Levien, R. [Trust Metric HOWTO](http://www.levien.com/free/tmetric-HOWTO.html)

18. **Advogato Trust Metric**: [Advogato](https://www.advogato.org/trust-metric.html)

### Neo4j Graph Data Science

19. **Neo4j GDS Algorithms Overview**: [Neo4j Docs](https://neo4j.com/docs/graph-data-science/current/algorithms/)

20. **PageRank in Neo4j GDS**: [Neo4j Docs](https://neo4j.com/docs/graph-data-science/current/algorithms/page-rank/)

21. **Community Detection in Neo4j GDS**: [Neo4j Docs](https://neo4j.com/docs/graph-data-science/current/algorithms/community/)

22. **Centrality Algorithms in Neo4j GDS**: [Neo4j Docs](https://neo4j.com/docs/graph-data-science/current/algorithms/centrality/)

23. **Node Similarity in Neo4j GDS**: [Neo4j Docs](https://neo4j.com/docs/graph-data-science/current/algorithms/node-similarity/)

### Rating and Scoring

24. **How Not To Sort By Average Rating** (Wilson Score): Miller, E. [Blog Post](https://www.evanmiller.org/how-not-to-sort-by-average-rating.html)

25. **Trust Model Based on Time Decay Factor for Social Networks** (2020). *Computers & Electrical Engineering*. [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0045790620305619)

### Cold Start

26. **Building a Reputation-Based Bootstrapping Mechanism for Newcomers in Collaborative Alert Systems** (2013). *Journal of Computer and System Sciences*. [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0022000013001219)

27. **Solving the Cold Start Problem in Trust Management in IoT** (2021). *ARES Conference*. [ACM](https://dl.acm.org/doi/10.1145/3465481.3469208)

---

*Document prepared for the Ethos project -- an open-source ethical knowledge graph for AI agents.*
*Last updated: 2026-02-10*
