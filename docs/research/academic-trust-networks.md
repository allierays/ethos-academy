# Academic Foundations: Trust Networks, Reputation Systems, and Knowledge Graphs

*A survey of the mathematical and computational foundations underlying Phronesis, Ethos's graph layer.*

---

## 1. Foundational Trust Models

### 1.1 Marsh (1994) --- The Origin of Computational Trust

**Paper:** Stephen Paul Marsh, "Formalising Trust as a Computational Concept," PhD Thesis, University of Stirling, 1994.

Marsh's doctoral thesis is the foundational work in computational trust. He was the first to formalize trust as a concept that could be embedded in artificial agents, enabling trust-based decision-making in distributed artificial intelligence (DAI).

**Key contributions:**
- Defined trust as a continuous value in the range [-1, +1], where -1 represents complete distrust and +1 represents blind trust
- Distinguished three levels of trust: *basic trust* (general disposition), *general trust* (trust in a specific agent), and *situational trust* (trust in a specific agent for a specific context)
- Proposed that trust is context-dependent, agent-specific, and changes over time based on experience
- Demonstrated that trusting agents outperform non-trusting agents in cooperative scenarios

**Relevance to Ethos:** Marsh's formalization directly maps to Ethos's multi-dimensional scoring model. The situational trust concept validates Ethos's approach of evaluating each message individually rather than assigning a static trust score. The [-1, +1] range inspired normalized scoring approaches like Ethos's [0, 1] scale.

**Source:** [University of Stirling Repository](https://www.cs.stir.ac.uk/~kjt/techreps/pdf/TR133.pdf) | [Semantic Scholar](https://www.semanticscholar.org/paper/Formalising-Trust-as-a-Computational-Concept-Marsh/8c584c4820e615aaf3c40a6737315c712ecd6927)

### 1.2 Gambetta (1988) --- Sociological Foundations

**Paper:** Diego Gambetta, "Can We Trust Trust?" in *Trust: Making and Breaking Cooperative Relations*, Basil Blackwell, 1988, pp. 213--237.

Gambetta's essay established the sociological groundwork for computational trust by defining trust as a probability assessment: *"when we say we trust someone or that someone is trustworthy, we implicitly mean that the probability that he will perform an action that is beneficial or at least not detrimental to us is high enough for us to consider engaging in some form of cooperation with him."*

**Key contributions:**
- Trust as a threshold probability --- agents cooperate when trust exceeds a context-dependent threshold
- Trust as a relation between trustor and trustee, not an inherent property
- The distinction between trust based on direct experience vs. reputation (indirect trust)

**Relevance to Ethos:** Gambetta's probabilistic framing validates Ethos's use of numerical scores. The threshold concept maps to Ethos's trust classification system (high/medium/low), and the direct/indirect distinction maps to individual evaluation vs. graph-aggregated reputation.

**Source:** [ResearchGate](https://www.researchgate.net/publication/255682316_Can_We_Trust_Trust_Diego_Gambetta) | [Semantic Scholar](https://www.semanticscholar.org/paper/Can-We-Trust-Trust-Gambetta/542ace96c6daa25922e626aaa8ca4aa904c2a2b0)

### 1.3 Castelfranchi & Falcone (2010) --- Socio-Cognitive Trust Theory

**Book:** Cristiano Castelfranchi and Rino Falcone, *Trust Theory: A Socio-Cognitive and Computational Model*, Wiley Series in Agent Technology, 2010.

This is the definitive cognitive model of trust, grounding trust in beliefs, goals, and mental states rather than pure probability.

**Key contributions:**
- Trust is both a mental state *and* a social attitude --- it has cognitive ingredients (beliefs about competence, willingness, persistence)
- Principled quantification of trust based on cognitive components
- The concept of "delegation" as the behavioral outcome of trust
- Trust as multi-dimensional: competence trust, willingness trust, persistence trust

**Relevance to Ethos:** The multi-dimensional cognitive model directly validates Ethos's ethos/logos/pathos decomposition. Rather than a single trust number, trust has separable dimensions that must be independently assessed. The competence/willingness distinction maps to logos (can they deliver accurate information?) vs. ethos (do they intend to?).

**Source:** [Wiley](https://onlinelibrary.wiley.com/doi/book/10.1002/9780470519851) | [Semantic Scholar](https://www.semanticscholar.org/paper/Trust-Theory:-A-Socio-Cognitive-and-Computational-Castelfranchi-Falcone/4d63edeb9c89237c367f8ce50b469bf1e126c9fe)

---

## 2. Trust Propagation Algorithms

### 2.1 EigenTrust (Kamvar, Schlosser, Garcia-Molina, 2003)

**Paper:** Sepandar D. Kamvar, Mario T. Schlosser, and Hector Garcia-Molina, "The EigenTrust Algorithm for Reputation Management in P2P Networks," *Proceedings of the 12th International Conference on World Wide Web (WWW '03)*, ACM, 2003, pp. 640--651.

EigenTrust is one of the most influential algorithms for computing global trust values in distributed networks. It has been cited approximately 5,800 times.

**Key contributions:**
- Computes a unique global trust value for each peer based on transaction history
- Based on *transitive trust*: if peer *i* trusts peer *j*, then *i* should also trust the peers that *j* trusts
- Uses power iteration (analogous to PageRank) to converge on global trust values
- Significantly reduces inauthentic content even when malicious peers collude

**Mathematical foundation:**
The algorithm normalizes local trust values into a matrix **C** where c_ij represents the normalized trust that peer *i* places in peer *j*. The global trust vector **t** is computed as the left eigenvector of **C**:

```
t = C^T * t
```

This is solved iteratively via power iteration, with a pre-trusted set **p** for convergence:

```
t^(k+1) = (1-a) * C^T * t^(k) + a * p
```

where *a* is a mixing parameter that prevents malicious peers from isolating themselves.

**Relevance to Ethos:** EigenTrust's transitive trust model is directly applicable to Phronesis (the graph layer). When agent A trusts agent B, and B trusts C, EigenTrust provides a principled way to propagate that trust. The power iteration approach can be implemented as a Neo4j graph algorithm for computing global trust scores.

**Source:** [Stanford NLP](https://nlp.stanford.edu/pubs/eigentrust.pdf) | [ACM DL](https://dl.acm.org/doi/10.1145/775152.775242) | [Wikipedia](https://en.wikipedia.org/wiki/EigenTrust)

### 2.2 PageRank (Brin & Page, 1998) and TrustRank (Gyongyi et al., 2004)

**Papers:**
- Sergey Brin and Lawrence Page, "The Anatomy of a Large-Scale Hypertextual Web Search Engine," *Proceedings of the 7th International World Wide Web Conference*, 1998, pp. 107--117.
- Zoltan Gyongyi, Hector Garcia-Molina, and Jan Pedersen, "Combating Web Spam with TrustRank," *Proceedings of the 30th VLDB Conference*, 2004.

**PageRank key formula:**

```
PR(A) = (1-d) + d * SUM(PR(T_i) / C(T_i))
```

where *d* is a damping factor (~0.85), *T_i* are pages linking to A, and *C(T_i)* is the number of outgoing links from *T_i*.

**TrustRank extension:**
TrustRank applies the PageRank concept specifically to trust by starting from human-verified seed pages and propagating trust outward. The core principle: *good pages seldom point to bad ones*. Trust decays with each hop from seed nodes.

**Key contributions:**
- PageRank demonstrated that link structure encodes quality/importance signals
- TrustRank showed that trust can be propagated from known-good seeds through network structure
- The mathematics are entirely general and apply to any graph domain

**Relevance to Ethos:** Neo4j natively supports PageRank as a graph algorithm. Ethos can use a TrustRank variant where highly-trusted agents serve as seeds, and trust propagates through the interaction graph. The damping factor models trust decay over network distance.

**Source:** [Stanford InfoLab](http://infolab.stanford.edu/pub/papers/google.pdf) | [VLDB 2004](https://www.vldb.org/conf/2004/RS15P3.PDF) | [Wikipedia: TrustRank](https://en.wikipedia.org/wiki/TrustRank)

### 2.3 Propagation of Trust and Distrust (Guha et al., 2004)

**Paper:** R. Guha, R. Kumar, P. Raghavan, and A. Tomkins, "Propagation of Trust and Distrust," *Proceedings of the 13th International Conference on World Wide Web (WWW '04)*, ACM, 2004, pp. 403--412.

This was the first paper to examine signed relationships (trust *and* distrust) in online social networks, using data from the Epinions community.

**Key contributions:**
- Developed a framework of trust propagation schemes for signed networks
- Evaluated on a large trust network: 800K trust scores among 130K people
- Demonstrated that a small number of expressed trust/distrust per individual allows prediction of trust between any two people with high accuracy
- Showed that trust and distrust propagate differently --- distrust is not simply the inverse of trust

**Relevance to Ethos:** Ethos evaluates both positive and negative signals (trust flags like manipulation, emotional exploitation). Guha et al. validate that distrust must be modeled separately, not as the absence of trust. This supports Ethos's flag-based approach where manipulation detection operates independently from trust scoring.

**Source:** [Google Research](https://research.google/pubs/propagation-of-trust-and-distrust/) | [ACM DL](https://dl.acm.org/doi/10.1145/988672.988727)

### 2.4 Predicting Positive and Negative Links (Leskovec et al., 2010)

**Paper:** Jure Leskovec, Daniel Huttenlocher, and Jon Kleinberg, "Predicting Positive and Negative Links in Online Social Networks," *Proceedings of the 19th International Conference on World Wide Web (WWW '10)*, 2010.

**Key contributions:**
- Studied signed networks from Epinions, Slashdot, and Wikipedia
- Demonstrated that the signs of links can be predicted with high accuracy using local and global network features
- Validated theories of balance and status from social psychology in computational settings
- Showed that structural features (triadic patterns) are powerful predictors of trust/distrust

**Relevance to Ethos:** The structural prediction approach suggests that Phronesis will develop predictive power as it grows. The triadic patterns (e.g., "the friend of my friend is my friend") can be computed in Neo4j and used to predict trust relationships for new agents.

**Source:** [arXiv](https://arxiv.org/abs/1003.2429) | [ACM DL](https://dl.acm.org/doi/10.1145/1772690.1772756)

---

## 3. Graph-Based Trust and Reputation

### 3.1 Advogato Trust Metric (Levien, 1998--2004)

**Paper:** Raph Levien, "Attack-Resistant Trust Metrics," in *Computing with Social Trust*, Springer, 2009, pp. 121--132.

The Advogato trust metric, created for an online free software community, was one of the first practical implementations of attack-resistant trust metrics using network flow.

**Key contributions:**
- Used maximum network flow from seed nodes to determine community membership
- Designed to be *attack-resistant*: an attacker controlling *k* nodes should only be able to introduce O(k) bogus members
- Observed fundamental similarity between the trust metric and PageRank
- Demonstrated practical viability of graph-based trust in real communities

**Limitations discovered:**
- The security proof had gaps: an attacker could confuse a single high-capacity node, then use it to amplify trust to many low-capacity nodes, yielding trust proportional to the *square* of attack cost
- This highlights the importance of defense-in-depth in trust systems

**Relevance to Ethos:** Advogato demonstrates that graph-based trust metrics work in practice but need layered defenses. Ethos's multi-dimensional evaluation (ethos + logos + pathos) provides defense-in-depth that pure graph metrics lack --- even if an agent manipulates network structure, its messages are still independently evaluated.

**Source:** [Levien HOWTO](http://www.levien.com/free/tmetric-HOWTO.html) | [Springer](https://link.springer.com/chapter/10.1007/978-1-84800-356-9_5)

### 3.2 Trust Transitivity in Social Networks

**Paper:** "Trust Transitivity in Social Networks," *PLOS ONE*, 2011.

This paper investigated the mathematical properties of trust propagation on networks based on a metric of trust transitivity.

**Key contributions:**
- Analyzed percolation properties of trust transitivity in random networks with arbitrary degree distributions
- Found that the existence of a non-zero fraction of *absolute trust* is a requirement for the viability of global trust propagation in large systems
- Without some fully-trusted seed nodes, trust dissipates completely over long chains

**Mathematical insight:** Trust transitivity follows a percolation model. There is a critical threshold below which trust cannot propagate globally. This has direct implications for network design.

**Relevance to Ethos:** This validates Ethos's architectural choice to evaluate each message independently (local trust) while also maintaining a graph (global trust). Pure propagation alone cannot sustain trust in large networks --- independent evaluation at each node is essential.

**Source:** [PLOS ONE](https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0018384&type=printable) | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3071725/)

### 3.3 Josang & Bhuiyan --- Trust Transitivity and Dependence

**Paper:** Touhid Bhuiyan and Audun Josang, "Analysing Trust Transitivity and the Effects of Unknown Dependence," *International Journal of Interactive Technology and Smart Education*, 2010.

**Key contributions:**
- Analyzed the parameter dependence problem in trust transitivity
- Used belief functions based on subjective logic to analyze trust propagation
- Quantified the effects of unknown dependence in interconnected network environments
- Proposed methods to handle cases where the independence of trust paths cannot be guaranteed

**Relevance to Ethos:** In a trust graph, the same underlying evidence may propagate through multiple paths, creating dependence between seemingly independent trust assessments. Josang's work warns that naive aggregation of multiple trust paths can overcount evidence. Ethos should account for path dependence in graph-based trust aggregation.

**Source:** [SAGE Journals](https://journals.sagepub.com/doi/full/10.5772/7263) | [ResearchGate](https://www.researchgate.net/publication/221907682_Analysing_Trust_Transitivity_and_The_Effects_of_Unknown_Dependence)

---

## 4. Knowledge Graphs for Trust Assessment

### 4.1 Triple Trustworthiness Measurement

**Paper:** Shengbin Jia et al., "Triple Trustworthiness Measurement for Knowledge Graph," *arXiv:1809.09414*, 2018.

**Key contributions:**
- Proposed a model for evaluating knowledge graph trustworthiness at the triple (subject-predicate-object) level
- Quantified the meaning of entities and relations to obtain trustworthiness scores
- Trustworthiness is a measure of credibility reflecting objectivity and verifiability of knowledge

**Relevance to Ethos:** Ethos stores evaluations as graph triples (Agent -[SENT]-> Message, Message -[HAS_SCORE]-> Evaluation). Triple-level trustworthiness assessment validates evaluating trust at the relationship level, not just the entity level.

**Source:** [arXiv](https://arxiv.org/pdf/1809.09414)

### 4.2 Trust Evaluation via Knowledge Graphs in Social Networks

**Paper:** Cheng & Li, "Trust Evaluation in Online Social Networks Based on Knowledge Graph," *Semantic Scholar*.

**Key contributions:**
- Used knowledge graph structures to represent and evaluate trust relationships in social networks
- Demonstrated that graph-based representations capture richer trust semantics than flat reputation scores
- Knowledge graphs enable reasoning about trust through multiple relationship types

**Relevance to Ethos:** This directly validates Ethos's use of Neo4j as a knowledge graph for trust. The graph structure enables queries like "show me all agents that have been flagged for manipulation by agents that I trust," which is impossible with flat reputation scores.

**Source:** [Semantic Scholar](https://www.semanticscholar.org/paper/Trust-Evaluation-in-Online-Social-Networks-Based-on-Cheng-Li/a73b9b2e94943d4cb261a05905c3eecec9f6c2af)

### 4.3 Knowledge Graph Embeddings for Trust

**Survey:** "Knowledge Graph Embedding: A Survey from the Perspective of Representation Spaces," *ACM Computing Surveys*, 2024.

Knowledge graph embedding (KGE) aims to represent entities and relations as low-dimensional, dense vectors while preserving graph structure and semantics.

**Key approaches:**
- **Translation-based models** (TransE): model relations as translations in embedding space
- **Tensor factorization models**: decompose the adjacency tensor
- **Neural network models**: learn embeddings through graph neural networks

**Relevance to Ethos:** As Phronesis grows, KGE techniques can be used to compute trust embeddings --- dense vector representations of agents that encode their trust profile. These embeddings enable similarity search ("find agents with trust profiles similar to this trusted agent") and anomaly detection.

**Source:** [ACM Computing Surveys](https://dl.acm.org/doi/10.1145/3643806) | [arXiv](https://arxiv.org/abs/2211.03536)

---

## 5. Mathematical Foundations for Trust Scoring

### 5.1 Subjective Logic (Josang, 2016)

**Book:** Audun Josang, *Subjective Logic: A Formalism for Reasoning Under Uncertainty*, Springer, 2016.

Subjective logic is a probabilistic logic that explicitly represents epistemic uncertainty and source trust.

**Key contributions:**
- **Opinion representation**: A binomial opinion (b, d, u, a) consists of belief, disbelief, uncertainty, and base rate, satisfying b + d + u = 1
- **Projected probability**: P = b + a*u, where uncertainty contributes proportionally to the base rate
- **Trust fusion operators**: combine opinions from multiple sources (cumulative, averaging, weighted)
- **Trust transitivity operator (discounting)**: if A trusts B with opinion w_A:B, and B trusts X with opinion w_B:X, then A's derived trust in X is w_A:X = w_A:B (discount) w_B:X
- Uncertainty is preserved through the analysis, distinguishing certain from uncertain conclusions

**Mathematical formalism:**
A subjective opinion can be represented as a Beta PDF (for binary) or Dirichlet PDF (for multinomial). The opinion w = (b, d, u, a) maps to Beta(alpha, beta) where:
```
alpha = r + 2*a
beta = s + 2*(1-a)
```
with r positive evidence and s negative evidence.

**Relevance to Ethos:** Subjective logic provides the ideal mathematical framework for Ethos's trust scoring. Rather than returning a single trust number, Ethos could return (belief, disbelief, uncertainty) triples that explicitly represent confidence. Early evaluations with little history would show high uncertainty; well-established agents would show low uncertainty. The fusion operators provide principled ways to combine evaluations from multiple sources.

**Source:** [Springer](https://link.springer.com/book/10.1007/978-3-319-42337-1) | [University of Oslo](https://www.mn.uio.no/ifi/english/people/aca/josang/sl/)

### 5.2 Bayesian Trust Models

**Survey:** "Survey on Computational Trust and Reputation Models," *ACM Computing Surveys*, 2018.

Bayesian approaches represent trust as probability distributions over partner reliability, updating via Bayes' theorem.

**Key mathematical framework:**
Given a prior Beta(alpha, beta) distribution representing trust, after observing *r* positive and *s* negative interactions:

```
Posterior: Beta(alpha + r, beta + s)
Expected trust: E[T] = (alpha + r) / (alpha + r + beta + s)
```

**Key contributions:**
- Trust naturally increases with positive evidence and decreases with negative evidence
- The posterior distribution captures both the estimated trust level *and* confidence
- Conjugate priors allow efficient incremental updating
- Context-sensitivity: different priors for different interaction types

**Challenges identified:**
- Standard Bayesian models assume symmetric updating, but empirically trust is *asymmetric*: a single betrayal destroys trust faster than a single positive interaction builds it
- This asymmetry can be modeled with different learning rates for positive/negative evidence

**Relevance to Ethos:** The Bayesian framework provides a natural way to update agent trust in the graph. Each evaluation updates the posterior distribution. The asymmetric trust observation aligns with Ethos's approach of weighting manipulation flags more heavily than positive signals. The Beta distribution's shape captures exactly how much evidence we have about an agent.

**Source:** [ACM Computing Surveys](https://dl.acm.org/doi/10.1145/3236008)

### 5.3 The Trust Equation --- Weighted Scoring Functions

**Mathematical models from multiple sources.**

Trust scoring functions generally take the form:

```
T = SUM(w_i * f_i(evidence_i)) / SUM(w_i)
```

where *w_i* are dimension weights and *f_i* are scoring functions for each trust dimension.

Dynamic trust models incorporate:
- **Performance (P)**: knowledge and effectiveness
- **Direct Observation (DO)**: monitored behavior
- **Expected Trust (ET)**: calculated from recent and historic trust
- **Feedback (F)**: recommendations and reputation from others

Temporal decay is modeled via exponential functions that downweight older evidence:

```
T_effective = T * e^(-lambda * t)
```

where lambda is the decay rate and t is time since the trust assessment.

**Relevance to Ethos:** Ethos's weighted scoring (ethos * w_e + logos * w_l + pathos * w_p) follows this established mathematical pattern. The temporal decay model should be implemented in Phronesis to ensure recent evaluations carry more weight than old ones.

---

## 6. Decentralized and Distributed Reputation

### 6.1 Resnick & Zeckhauser (2002) --- eBay's Reputation System

**Paper:** Paul Resnick and Richard Zeckhauser, "Trust Among Strangers in Internet Transactions: Empirical Analysis of eBay's Reputation System," in *The Economics of the Internet and E-Commerce*, Advances in Applied Microeconomics, Vol. 11, 2002, pp. 127--157.

The seminal empirical study of online reputation systems at scale.

**Key findings:**
- Reputation scores have a measurable effect on transaction prices and likelihood
- The system exhibits extreme positive skew: 99%+ of feedback is positive
- Buyers and sellers exhibit reciprocal feedback behavior (strategic, not purely informational)
- Reputation provides a credible commitment mechanism that deters moral hazard

**Relevance to Ethos:** Resnick & Zeckhauser's finding about positive-skew bias is a critical design consideration. Ethos must avoid the "Lake Wobegon effect" where all agents are above average. The multi-dimensional scoring approach (rather than binary positive/negative) helps avoid this collapse.

**Source:** [Harvard Kennedy School](https://www.hks.harvard.edu/publications/trust-among-strangers-internet-transactions-empirical-analysis-ebays-reputation-system) | [Semantic Scholar](https://www.semanticscholar.org/paper/Trust-among-strangers-in-internet-transactions:-of-Resnick-Zeckhauser/71cf52b2c0e3cc27129a0c85494f2427af7c286f)

### 6.2 Abdul-Rahman & Hailes (1997--2000) --- Distributed Trust Models

**Papers:**
- Alfarez Abdul-Rahman and Stephen Hailes, "A Distributed Trust Model," *ACM NSPW*, 1997.
- Abdul-Rahman and Hailes, "Supporting Trust in Virtual Communities," *Proceedings of the 33rd HICSS*, 2000.

**Key contributions:**
- Proposed a distributed trust model grounded in real-world social trust characteristics
- Trust based on word-of-mouth reputation mechanisms
- Outlined shortcomings of centralized security approaches for managing trust
- Proposed a model for trust based on distributed recommendations

**Relevance to Ethos:** The distributed recommendations model maps to Ethos's graph-based approach where trust assessments from multiple evaluators are aggregated. The emphasis on real-world social trust characteristics validates Ethos's Aristotelian foundation (ethos, logos, pathos).

**Source:** [NSPW 1997](https://www.nspw.org/papers/1997/nspw1997-rahman.pdf) | [Semantic Scholar](https://www.semanticscholar.org/paper/Supporting-trust-in-virtual-communities-Abdul-Rahman-Hailes/6f127e35044fcef9d04d628a15a614d74d74cda3)

### 6.3 Blockchain-Based Reputation Systems

**Survey:** "Privacy-Preserving Reputation Systems Based on Blockchain and Other Cryptographic Building Blocks: A Survey," *ACM Computing Surveys*, 2022.

**Key developments:**
- Smart contracts as "trust regulators" to mitigate Sybil attacks, bad-mouthing, and on-off attacks
- Self-Sovereign Identity (SSI) approaches with algorithmic scoring using fuzzy AHP-based trust management
- Cross-platform reputation portability remains an unsolved challenge
- Privacy-preserving computation enables reputation without revealing individual ratings

**Relevance to Ethos:** While Phronesis currently uses a centralized Neo4j graph, the principles of Sybil resistance and attack mitigation are relevant. Future Ethos versions could enable cross-platform trust portability where an agent's Phronesis data travels with it across systems.

**Source:** [ACM Computing Surveys](https://dl.acm.org/doi/10.1145/3490236)

### 6.4 Attack and Defense in Reputation Systems

**Paper:** Kevin Hoffman, David Zage, and Cristina Nita-Rotaru, "A Survey of Attack and Defense Techniques for Reputation Systems," *ACM Computing Surveys*, Vol. 42, No. 1, 2009.

**Key attack categories:**
- **Self-promoting**: artificially inflate own reputation
- **Slandering/bad-mouthing**: unfairly lower others' reputation
- **Ballot stuffing**: create fake identities to inflate reputation
- **Sybil attack**: create multiple identities to game the system
- **On-off attack**: alternate good and bad behavior to maintain reputation while acting maliciously

**Defense mechanisms:**
- Weighted trust based on evaluator reputation (trusted evaluators carry more weight)
- Temporal discounting (recent behavior matters more)
- Anomaly detection for suspicious patterns
- Minimum interaction thresholds before trust is established

**Relevance to Ethos:** Ethos's design should incorporate these defenses: (1) weight evaluations by evaluator trust, (2) implement temporal decay in the graph, (3) use the LLM to detect anomalous patterns, (4) require minimum evaluation history before assigning high trust. The multi-dimensional scoring provides natural defense against gaming --- manipulating all dimensions simultaneously is harder than gaming a single score.

**Source:** [ACM Computing Surveys](https://dl.acm.org/doi/10.1145/3236008) | [Purdue CERIAS](https://homes.cerias.purdue.edu/~crisn/papers/reputation_survey.pdf)

---

## 7. Network Effects and Collective Intelligence

### 7.1 Surowiecki (2004) --- The Wisdom of Crowds

**Book:** James Surowiecki, *The Wisdom of Crowds: Why the Many Are Smarter Than the Few*, Doubleday, 2004.

**Key conditions for collective intelligence:**
1. **Diversity of opinion**: each person has private information
2. **Independence**: opinions not determined by those around them
3. **Decentralization**: people can draw on local knowledge
4. **Aggregation**: mechanism to turn individual judgments into collective decisions

**When crowds fail:** When members become too conscious of others' opinions and begin to conform rather than think independently (herding, cascades, bubbles).

**Relevance to Ethos:** Phronesis represents a crowd of evaluations. For the aggregate trust score to be reliable, the evaluation methodology must maintain independence (each evaluation based on message content, not previous scores) and diversity (multi-dimensional scoring captures different aspects). The aggregation mechanism (graph algorithm) must be principled.

**Source:** [Wikipedia](https://en.wikipedia.org/wiki/The_Wisdom_of_Crowds)

### 7.2 Network Dynamics of Social Influence

**Paper:** "Network dynamics of social influence in the wisdom of crowds," *PNAS*, 2017.

**Key findings:**
- In decentralized networks, social influence generates learning dynamics that reliably *improve* the wisdom of crowds
- Identified general conditions under which influence (not independence) produces the most accurate group judgments
- The network structure itself shapes the quality of collective judgment

**Relevance to Ethos:** This challenges the naive view that independence is always best. In Phronesis, agents *should* influence each other's evaluations through the graph structure --- but the influence must flow through principled mechanisms (trust propagation) rather than simple averaging.

**Source:** [PNAS](https://ndg.asc.upenn.edu/wp-content/uploads/2017/06/PNAS-2017-1615978114-Collective-Intelligence.pdf) | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5495222/)

### 7.3 Adaptive Networks and Collective Wisdom

**Paper:** "Adaptive social networks promote the wisdom of crowds," *PNAS*, 2020.

**Key findings:**
- Network plasticity (the ability to change connections) and feedback provide fundamental mechanisms for improving both individual judgments and collective wisdom
- Groups in adaptive networks outperform their best individual members
- The "wisdom of the network" emerges from the interaction between network structure and individual learning

**Relevance to Ethos:** This validates Phronesis as an evolving graph. As agents interact and are evaluated over time, the graph structure adapts, and the collective trust assessments become more accurate than any individual evaluation. The graph is not static but a living, adapting network.

**Source:** [PNAS](https://www.pnas.org/doi/10.1073/pnas.1917687117)

### 7.4 Graph Neural Networks for Trust Prediction

**Paper:** M. Zhang and Y. Chen, "Link Prediction Based on Graph Neural Networks," *NeurIPS*, 2018.

**Key contributions:**
- GNNs learn link representations from local subgraph structure
- Superior performance over traditional methods by learning from topology and features jointly
- Two paradigms: node-based (learn node embeddings, aggregate for links) and subgraph-based (learn directly from local neighborhoods)

**Recent extensions for trust:**
- Joint learning frameworks (JoRTGNN) combine item recommendation with trust prediction
- Signed GNNs handle trust and distrust simultaneously through separate embedding spaces
- Decoupled graph attention networks (DecGAT) improve interpretability of trust predictions

**Relevance to Ethos:** As Phronesis grows, GNN-based approaches can predict trust relationships for new agents, detect anomalous trust patterns, and provide trust recommendations. Neo4j's graph data science library includes GNN-compatible features that Ethos can leverage.

**Source:** [arXiv](https://arxiv.org/abs/1802.09691) | [NeurIPS](https://dl.acm.org/doi/10.5555/3327345.3327423)

---

## 8. Surveys and Meta-Analyses

### 8.1 Sabater & Sierra (2005) --- Classification of Trust Models

**Paper:** Jordi Sabater and Carles Sierra, "Review on Computational Trust and Reputation Models," *Artificial Intelligence Review*, Vol. 24, 2005, pp. 33--60.

The foundational survey that established the taxonomy for computational trust and reputation models.

**Classification dimensions:**
- **Conceptual model**: cognitive vs. game-theoretic
- **Information sources**: direct experience, witness information, sociological information, prejudice
- **Visibility**: centralized vs. distributed
- **Granularity**: context-dependent vs. context-free
- **Trust model type**: single-dimension vs. multi-dimension

**Relevance to Ethos:** Under Sabater & Sierra's taxonomy, Ethos is: cognitive (based on Aristotelian rhetoric), uses direct evaluation (not witness), centralized (Neo4j), context-dependent (per-message), and multi-dimensional (ethos/logos/pathos). This positions Ethos uniquely in the landscape of trust models.

**Source:** [Springer](https://link.springer.com/article/10.1007/s10462-004-0041-5) | [IIIA-CSIC PDF](https://www.iiia.csic.es/~jsabater/Publications/2005-AIR.pdf)

### 8.2 Pinyol & Sabater-Mir (2013)

**Paper:** Isaac Pinyol and Jordi Sabater-Mir, "Computational trust and reputation models for open multi-agent systems: a review," *Artificial Intelligence Review*, Vol. 40, 2013, pp. 1--25.

**Key contributions:**
- Updated survey covering models from 2005--2012
- Identified trends toward cognitive models that incorporate beliefs and mental states
- Noted the increasing importance of multi-dimensional trust assessment
- Highlighted the gap between theoretical models and practical deployment

**Source:** [Springer](https://link.springer.com/article/10.1007/s10462-011-9277-z)

### 8.3 Trustworthy LLMs Survey (2023--2024)

**Paper:** "Trustworthy LLMs: A Survey and Guideline for Evaluating Large Language Models' Alignment," *arXiv:2308.05374*.

**Seven dimensions of LLM trustworthiness:**
1. Reliability
2. Safety
3. Fairness
4. Resistance to misuse
5. Explainability and reasoning
6. Adherence to social norms
7. Robustness

**Key finding:** More aligned models tend to perform better in terms of overall trustworthiness. Real-time trust scoring automatically reduces incorrect responses across all AI agent types by 10--56%.

**Relevance to Ethos:** This is the most directly relevant recent work. Ethos operates in the same space --- evaluating AI agent trustworthiness --- but takes a unique approach grounded in classical rhetoric rather than alignment benchmarks. The seven dimensions partially overlap with Ethos's three (e.g., reliability/reasoning map to logos, safety/fairness map to ethos).

**Source:** [arXiv](https://arxiv.org/abs/2308.05374)

### 8.4 TRiSM for Agentic AI (2024)

**Paper:** "TRiSM for Agentic AI: A Review of Trust, Risk, and Security Management in LLM-based Agentic Multi-Agent Systems," *arXiv:2506.04133*.

**Key contributions:**
- Trust, Risk, and Security Management (TRiSM) framework for agentic AI
- Four key pillars: Explainability, Model Operations, Application Security, Model Privacy
- Most current AI agents lack explicit mechanisms for trust, alignment, and safety
- The AI agent market is projected to grow from $5.4B (2024) to $7.6B (2025)

**Relevance to Ethos:** Ethos fills exactly the gap identified in this survey --- providing explicit trust mechanisms for AI agents. The market projection validates the commercial potential of trust-scoring systems for AI agents.

**Source:** [arXiv](https://arxiv.org/html/2506.04133v2)

---

## 9. Implications for Ethos: How Graph Science Validates the Approach

### 9.1 Why Neo4j is the Right Choice

The academic literature provides strong evidence that graph databases are the natural home for trust computation:

1. **Trust is fundamentally relational.** Every major trust model (Marsh, Gambetta, Castelfranchi) defines trust as a relationship between entities, not a property of entities. Relational databases model entities; graph databases model relationships.

2. **Trust propagation is a graph algorithm.** EigenTrust, PageRank/TrustRank, and network flow trust metrics are all graph algorithms. Neo4j's Graph Data Science library provides native implementations of PageRank, community detection, and path-finding --- the exact algorithms needed for trust propagation.

3. **Trust graphs are temporal.** Trust changes over time (Marsh, Bayesian models, temporal decay). Neo4j supports temporal properties on relationships, enabling queries like "how has trust in agent X changed over the past 30 days?"

4. **Trust queries are path queries.** "Why should I trust agent X?" requires traversing chains of trust. This is a natural graph traversal, O(depth) in a graph database but requiring expensive JOINs in a relational database.

### 9.2 Validated Design Decisions

| Ethos Design Decision | Academic Validation |
|---|---|
| Multi-dimensional scoring (ethos/logos/pathos) | Castelfranchi & Falcone (2010): trust has separable cognitive dimensions |
| Per-message evaluation | Marsh (1994): situational trust varies by context |
| Manipulation flags as separate signals | Guha et al. (2004): distrust propagates differently from trust |
| Trust scores as floats [0,1] | Marsh (1994), Gambetta (1988): trust as continuous probability |
| Graph-based trust aggregation | EigenTrust (2003), PageRank (1998): graph structure encodes trust |
| Temporal trust tracking | Bayesian models: trust updates with evidence over time |
| Reflection as meta-evaluation | Subjective logic (Josang): uncertainty preserved through analysis |

### 9.3 Research-Informed Roadmap

Based on the literature, the following enhancements would strengthen Ethos:

1. **Subjective logic opinions**: Return (belief, disbelief, uncertainty) instead of single scores, explicitly representing confidence
2. **EigenTrust-style global scores**: Compute global agent trust via power iteration over Phronesis
3. **Temporal decay**: Weight recent evaluations more heavily using exponential decay
4. **Asymmetric trust updating**: Negative signals (manipulation flags) should reduce trust faster than positive signals build it
5. **Trust embeddings**: Use knowledge graph embedding techniques to create dense trust representations for similarity search
6. **Attack resistance**: Implement defenses against self-promotion, Sybil attacks, and on-off attacks
7. **Signed trust propagation**: Separate trust and distrust channels following Guha et al.

### 9.4 Positioning in the Literature

Ethos occupies a unique position in the computational trust landscape:

- **Classical roots**: Grounded in Aristotelian rhetoric (2,400 years of human trust reasoning), not ad hoc dimensions
- **Modern execution**: Uses LLMs for evaluation (leveraging Claude's reasoning for multi-dimensional analysis)
- **Graph foundation**: Phronesis enables both local evaluation and global reputation
- **AI-native**: Designed specifically for AI agent messages, addressing the gap identified by the TRiSM survey

The academic literature overwhelmingly supports the core thesis: trust is multi-dimensional, context-dependent, graph-structured, and time-varying. Ethos's architecture is aligned with these findings.

---

## References (Alphabetical)

1. Abdul-Rahman, A. and Hailes, S. (1997). "A Distributed Trust Model." ACM NSPW.
2. Abdul-Rahman, A. and Hailes, S. (2000). "Supporting Trust in Virtual Communities." HICSS-33.
3. Bhuiyan, T. and Josang, A. (2010). "Analysing Trust Transitivity and the Effects of Unknown Dependence." ITSE.
4. Brin, S. and Page, L. (1998). "The Anatomy of a Large-Scale Hypertextual Web Search Engine." WWW-7.
5. Castelfranchi, C. and Falcone, R. (2010). *Trust Theory: A Socio-Cognitive and Computational Model.* Wiley.
6. Gambetta, D. (1988). "Can We Trust Trust?" In *Trust: Making and Breaking Cooperative Relations.* Blackwell.
7. Guha, R., Kumar, R., Raghavan, P., and Tomkins, A. (2004). "Propagation of Trust and Distrust." WWW-04.
8. Gyongyi, Z., Garcia-Molina, H., and Pedersen, J. (2004). "Combating Web Spam with TrustRank." VLDB-04.
9. Hoffman, K., Zage, D., and Nita-Rotaru, C. (2009). "A Survey of Attack and Defense Techniques for Reputation Systems." ACM Computing Surveys.
10. Jia, S. et al. (2018). "Triple Trustworthiness Measurement for Knowledge Graph." arXiv:1809.09414.
11. Josang, A. (2016). *Subjective Logic: A Formalism for Reasoning Under Uncertainty.* Springer.
12. Kamvar, S.D., Schlosser, M.T., and Garcia-Molina, H. (2003). "The EigenTrust Algorithm for Reputation Management in P2P Networks." WWW-03.
13. Leskovec, J., Huttenlocher, D., and Kleinberg, J. (2010). "Predicting Positive and Negative Links in Online Social Networks." WWW-10.
14. Levien, R. (2009). "Attack-Resistant Trust Metrics." In *Computing with Social Trust.* Springer.
15. Marsh, S.P. (1994). "Formalising Trust as a Computational Concept." PhD Thesis, University of Stirling.
16. Mui, L., Mohtashemi, M., and Halberstadt, A. (2002). "A Computational Model of Trust and Reputation." HICSS-35.
17. Pinyol, I. and Sabater-Mir, J. (2013). "Computational Trust and Reputation Models for Open Multi-Agent Systems: A Review." Artificial Intelligence Review.
18. Resnick, P. and Zeckhauser, R. (2002). "Trust Among Strangers in Internet Transactions." Advances in Applied Microeconomics.
19. Sabater, J. and Sierra, C. (2005). "Review on Computational Trust and Reputation Models." Artificial Intelligence Review.
20. Surowiecki, J. (2004). *The Wisdom of Crowds.* Doubleday.
21. Zhang, M. and Chen, Y. (2018). "Link Prediction Based on Graph Neural Networks." NeurIPS.

---

*This research survey was compiled for the Ethos project to establish the academic foundations underlying Phronesis, the graph layer. All papers cited were verified through web search as real, published works.*
