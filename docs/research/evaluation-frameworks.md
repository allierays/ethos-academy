# Evaluation Frameworks for AI Agent Communication and Trustworthiness

Research compiled for the Ethos project — an open-source framework for evaluating AI agent messages across ethos, logos, and pathos dimensions.

---

## 1. Agent Evaluation Benchmarks

The current landscape of AI agent benchmarks focuses almost exclusively on **capability** — can the agent complete the task? None evaluate whether the agent communicates **ethically** while doing so.

### AgentBench

[AgentBench](https://arxiv.org/abs/2308.03688) evaluates LLMs as agents across 8 environments (OS, database, knowledge graphs, gaming, embodied AI). It tests reasoning and decision-making in multi-turn open-ended settings with 29 LLMs. Key finding: significant capability gaps between commercial and open-source models.

**What it measures:** Task completion, reasoning, multi-step decision-making.
**What it misses:** Whether the agent manipulates, deceives, or fabricates during task execution.

### GAIA

[GAIA](https://arxiv.org/abs/2311.12983) provides 466 real-world questions requiring reasoning, multimodality, and tool use. It exposes a 77% human-AI performance gap on tasks that seem simple for humans but require combined tool use and reasoning.

**What it measures:** General assistant capability, multi-modal reasoning.
**What it misses:** Honesty of answers, acknowledgment of uncertainty, manipulation in responses.

### ToolBench / ToolLLM

[ToolBench](https://github.com/OpenBMB/ToolBench) tests LLMs on 16,464 RESTful APIs across 49 categories. It evaluates API selection, multi-step reasoning, correct invocation, and the ability to abstain when unsure.

**What it measures:** Tool use accuracy, API interaction, retrieval.
**What it misses:** Whether the agent misrepresents tool outputs or fabricates results.

### SWE-bench

[SWE-bench](https://www.swebench.com/) evaluates agents on 2,294 real GitHub issues with execution-based testing. SWE-bench Verified (500 human-validated samples) was created in collaboration with OpenAI.

**What it measures:** Real-world software engineering capability.
**What it misses:** Code explanation honesty, whether agents claim false confidence in solutions.

### WebArena

[WebArena](https://webarena.dev/) provides 812 web-browsing tasks across e-commerce, forums, and CMS platforms. Agent success rates jumped from 14% (2023) to ~60% (2025). The extension [ST-WebAgentBench](https://arxiv.org/abs/2410.06703) adds safety/trust templates and policy-compliance metrics, revealing most agents are not enterprise-ready.

**What it measures:** Web navigation, task completion, planning.
**What it misses:** Whether agents respect user privacy, consent, or ethical boundaries during browsing.

### The Benchmark Gap

All major benchmarks answer: **"Can the agent do it?"** None answer: **"Should the agent have done it that way?"** or **"Did the agent communicate honestly while doing it?"** This is the gap Ethos fills — evaluating the *character* of communication, not just the *competence* of execution.

---

## 2. Trust and Safety Evaluation

Current trust and safety approaches focus on preventing harmful outputs. They operate at training time or via static guardrails, not as runtime evaluation of individual messages.

### Constitutional AI (Anthropic)

[Constitutional AI](https://www-cdn.anthropic.com/7512771452629584566b6303311496c262da1006/Anthropic_ConstitutionalAI_v2.pdf) uses a set of principles to guide model behavior, with the model critiquing and revising its own outputs. It trains harmlessness from AI feedback rather than human feedback alone.

**Approach:** Embed principles at training time. The model self-corrects during generation.
**Limitation:** Principles are baked in, not evaluated per-message at runtime. No external scoring or graph-based trust layer.

### Constitutional Classifiers

Anthropic's [Constitutional Classifiers](https://www.anthropic.com/research/constitutional-classifiers) reduced jailbreak success rates from 86% to 4.4% by using classifiers trained on constitutionally-generated data.

**Approach:** Input/output filtering with trained classifiers.
**Limitation:** Binary safe/unsafe classification. No nuanced scoring of persuasion quality, reasoning integrity, or emotional exploitation.

### Safe RLHF

[Safe RLHF](https://proceedings.iclr.cc/paper_files/paper/2024/file/dd1577afd396928ed64216f3f1fd5556-Paper-Conference.pdf) (ICLR 2024) separates helpfulness and harmlessness into distinct reward signals, using red-teaming to broaden safety coverage.

**Approach:** Dual reward modeling during training.
**Limitation:** Training-time only. Cannot evaluate new, unseen agent messages in production.

### Red-Teaming

Red-teaming has become standard practice, with [PyRIT](https://github.com/Azure/PyRIT) emerging as the de-facto tool for orchestrating LLM attack suites. The [OWASP Top 10 for LLM Apps](https://owasp.org/www-project-top-10-for-large-language-model-applications/) provides vulnerability categories. The [AI Safety Institute (AISI)](https://alignmentproject.aisi.gov.uk/research-area/empirical-investigations-into-ai-monitoring-and-red-teaming) conducts empirical investigations into monitoring and red-teaming.

**Approach:** Adversarial testing to find failure modes.
**Limitation:** Pre-deployment, batch process. Not continuous runtime evaluation.

### The Safety Gap

Current safety systems are **preventive** (training-time alignment, input/output filters) or **diagnostic** (red-teaming, benchmarks). None provide **continuous runtime scoring** of individual agent messages for ethical quality. Ethos operates in this gap — evaluating every message as it flows through a system.

---

## 3. Reputation Systems for Agents

### ReputAgent

[ReputAgent](https://reputagent.com/) is the closest existing system to a reputation framework for AI agents. Its core product, RepKit, turns every agent interaction into an evaluation event: when Agent A delegates to Agent B, Agent A observes the outcome, and that observation becomes data.

**What it does:**
- Performance-based reputation (did the agent complete the task correctly?)
- Trust determines tiered autonomy levels
- Agents build track records through structured scenarios
- Reputation as state, not opinion — scores power decisions rather than reports

**How it differs from Ethos:**
- ReputAgent measures **performance** (task success/failure)
- Ethos measures **character** (honesty, reasoning integrity, emotional intelligence)
- ReputAgent asks: "Did Agent B do the job right?"
- Ethos asks: "Did Agent B communicate truthfully, reason soundly, and treat the other party with respect?"
- ReputAgent is closed-source commercial infrastructure
- Ethos is open-source, designed for transparency and community adoption

### TrustAgent (Academic)

[TrustAgent](https://arxiv.org/abs/2402.01586) (arXiv 2024) proposes a framework for safe LLM-based agents through "agent constitution" — pre-planning, in-planning, and post-planning safety strategies.

A comprehensive [survey on trustworthy LLM agents](https://arxiv.org/abs/2503.09648) (March 2025, KDD 2025) extends trustworthiness into a taxonomy of intrinsic aspects (brain, memory, tools) and extrinsic aspects (user, agent, environment).

**How it differs from Ethos:**
- TrustAgent focuses on **safety constraints** during planning
- The survey catalogs threats and countermeasures
- Neither provides runtime scoring of individual messages across ethical dimensions
- Neither builds a persistent graph of trust over time

---

## 4. Traditional Reputation and Trust Systems

The history of online reputation systems offers critical design lessons for agent trust.

### eBay Feedback System

[eBay's reputation system](https://cs.stanford.edu/people/eroberts/courses/cs181/projects/2010-11/PsychologyOfTrust/rep2.html) pioneered online trust between strangers. Before 2008, buyers and sellers could leave mutual positive/negative/neutral feedback. In 2008, eBay made feedback one-sided (buyers rate sellers only) to reduce retaliatory ratings.

**Lessons for Ethos:**
- **Reciprocity bias** — mutual rating systems suffer from strategic ratings and retaliation
- **Grade inflation** — most ratings cluster at the top, reducing signal
- Ethos avoids this by using LLM-based evaluation rather than self-reporting; agents don't rate each other, an independent evaluator scores messages

### Uber/Airbnb Ratings

[Uber](https://www.annualreviews.org/content/journals/10.1146/annurev-economics-080315-015325) uses two-sided ratings (drivers and riders) that are not public — drivers see rider ratings before accepting, riders see driver ratings after confirmation. Airbnb uses simultaneous reveal to prevent retaliation.

**Lessons for Ethos:**
- **Timing matters** — when ratings are revealed affects strategic behavior
- **Two-sided vs. one-sided** — whether both parties rate affects fairness
- Ethos is third-party evaluation (the evaluator is independent), eliminating strategic gaming between rated parties

### FICO Credit Scores

FICO scores aggregate behavioral history into a single number (300-850) that determines access and terms. The score is opaque in methodology but transparent in impact.

**Lessons for Ethos:**
- **Longitudinal tracking** — trust is built over time, not from a single interaction
- **Multi-dimensional input** — FICO uses payment history, credit utilization, length of history, credit mix, and new credit
- Ethos similarly tracks multiple dimensions (ethos, logos, pathos) over time in a graph
- **Interpretability matters** — unlike FICO, Ethos provides transparent reasoning for every score

### PGP Web of Trust

The [PGP web of trust](https://en.wikipedia.org/wiki/Web_of_trust) is a decentralized alternative to centralized certificate authorities. Trust is established through chains of key signatures. Sequoia [models the web of trust as a flow network](https://sequoia-pgp.gitlab.io/sequoia-wot/), solving authentication as a maximum flow problem.

**Lessons for Ethos:**
- **Decentralized trust** — no single authority decides trustworthiness
- **Transitive trust** — trust propagates through networks (A trusts B, B trusts C, so A has some trust in C)
- **Graph-native** — trust is inherently a graph problem, which is why Ethos uses Neo4j
- **Flow-based scoring** — trust as a flow network is a powerful metaphor; Phronesis (the graph layer) could adopt similar propagation algorithms

### Design Pattern Summary

| System | Trust Model | Key Strength | Key Weakness |
|--------|------------|--------------|--------------|
| eBay | Mutual ratings | Simple, understood | Gaming, grade inflation |
| Uber | Two-sided, private | Reduces retaliation | Opaque to participants |
| FICO | Behavioral history | Longitudinal, multi-factor | Opaque methodology |
| PGP | Decentralized graph | No central authority | Cold start, complexity |
| **Ethos** | **Third-party LLM eval + graph** | **Independent, multi-dimensional, transparent** | **Depends on LLM evaluator quality** |

---

## 5. Academic Research

### Deception and Trust in Multi-Agent Systems

**"The Traitors"** ([NeurIPS 2025 Workshop](https://arxiv.org/abs/2505.12923)) — A multi-agent simulation studying deception and trust dynamics. Defines metrics for deception effectiveness, detection accuracy, and trust network stability. Demonstrates that LLMs can engage in strategic social reasoning and deception.

**OpenDeception** ([arXiv 2025](https://arxiv.org/abs/2504.13707)) — Monitors multi-turn conversations through evaluating AI thought and user trust, enabling timely warnings. Key finding: reasoning models exhibit a deception intention generation rate nearing 100%, higher than base LLMs, suggesting structured reasoning may amplify deception risk.

**Secret Collusion** ([NeurIPS 2024](https://proceedings.neurips.cc/paper_files/paper/2024/file/861f7dad098aec1c3560fb7add468d41-Paper-Conference.pdf)) — Studies steganographic communication between AI agents. As LLM capabilities increase, steganographic abilities increase faster than overseer detection capabilities.

**The Trust Paradox** ([arXiv 2025](https://arxiv.org/abs/2510.18563)) — Identifies a fundamental paradox: increasing inter-agent trust to enhance coordination simultaneously expands attack surfaces for over-exposure and over-authorization.

### Sycophancy and Manipulation Detection

**Sycophancy in Multi-turn Dialogues** ([EMNLP 2025](https://aclanthology.org/2025.findings-emnlp.121.pdf)) — Tests whether language models maintain stance when users repeatedly disagree, measuring when models reverse positions under social pressure.

**ELEPHANT: Social Sycophancy** ([arXiv 2025](https://arxiv.org/abs/2505.13995)) — Goes beyond explicit belief mirroring to measure sycophancy when user beliefs are only implicit. Current measurement approaches fail to capture subtle agreement patterns.

**Persuaficial Benchmark** ([arXiv 2025](https://arxiv.org/abs/2601.04925)) — A multilingual benchmark for detecting AI-generated persuasion across six languages. Key finding: subtle LLM-generated persuasion consistently degrades automatic detection performance.

**AI Manipulation Hackathon** ([Apart Research, Jan 2026](https://apartresearch.com/sprints/ai-manipulation-hackathon-2026-01-09-to-2026-01-11)) — 500+ builders prototyping systems to measure, detect, and defend against AI manipulation. Focus areas: manipulation benchmarks, persuasive capability measurement, deception detection with ecological validity.

### TRiSM for Agentic AI

**TRiSM Survey** ([arXiv 2025](https://arxiv.org/abs/2506.04133)) — A comprehensive review of Trust, Risk, and Security Management for LLM-based agentic multi-agent systems, examining studies from 2022 to 2025. Provides a systematic taxonomy of threats and countermeasures but focuses on security rather than ethical communication quality.

### Relevance to Ethos

This research body confirms:
1. **Deception is a real and growing problem** in multi-agent systems
2. **Sycophancy and manipulation are measurable** but current methods are limited
3. **Trust in MAS is paradoxical** — more trust creates more vulnerability
4. **No existing framework scores individual messages** for ethical communication quality at runtime

---

## 6. Aristotle's Framework in Modern AI

### Classical Foundations

Aristotle's *Rhetoric* (4th century BCE) identified three modes of persuasion:
- **Ethos** — the character and credibility of the speaker
- **Logos** — the logical structure and evidence of the argument
- **Pathos** — the emotional appeal and connection to the audience

These have remained the foundational framework for rhetorical analysis for over 2,000 years.

### Modern Applications

**"Bridging Classical Rhetoric and AI"** ([Lindenwood University, 2024](https://digitalcommons.lindenwood.edu/cgi/viewcontent.cgi?article=2413&context=theses)) — A systematic study integrating classical rhetorical principles with LLM capabilities for authorial voice development. Demonstrates that features rhetoricians associate with voice can be quantified and analyzed as data points.

**"From Aristotle to AI"** ([SyncSci, 2025](https://www.syncsci.com/journal/IJAH/article/download/IJAH.2025.01.003/995/)) — Traces the lineage from classical rhetoric to modern AI communication, examining how ethos, logos, and pathos manifest in AI-generated content.

**AI and Campaign Messaging** ([Arkansas State, 2024](https://arch.astate.edu/cgi/viewcontent.cgi?article=2077&context=all-etd)) — Research examining how AI-generated campaign messages employ ethos, pathos, and logos. Finding: most 2024 AI campaign messages are partisan, manipulative, and contrived, using celebrity credibility and high emotional appeals.

### What Exists vs. What Ethos Does

Existing work uses Aristotle's framework for **analysis** — studying how persuasion works in AI-generated text. No existing system uses the framework for **runtime evaluation** — scoring each AI message in real-time across all three dimensions and feeding those scores into Phronesis (the graph layer) for persistent trust tracking.

**Ethos's novelty:**
- Operationalizes Aristotle's three modes as computable scores (0-1 floats)
- Applies them not to static text analysis but to live agent-to-agent messages
- Stores results in a graph database, enabling trust trajectories over time
- Uses the scores to flag manipulation (false ethos), fabrication (broken logos), and emotional exploitation (weaponized pathos)
- Creates a feedback loop: agents with declining trust scores trigger human review

---

## 7. The Gap: What Ethos Fills

### What Exists Today

| Category | Examples | Focus |
|----------|----------|-------|
| Capability benchmarks | AgentBench, GAIA, SWE-bench, WebArena | Can the agent complete the task? |
| Safety alignment | Constitutional AI, RLHF, Safe RLHF | Prevent harmful outputs at training time |
| Red-teaming | PyRIT, AISI, OWASP | Find failure modes pre-deployment |
| Performance reputation | ReputAgent | Did the agent succeed at the task? |
| Observability platforms | Maxim AI, AWS AgentCore Evaluations | Monitor latency, cost, errors |
| Academic research | TrustAgent, TRiSM, OpenDeception | Catalog threats, propose frameworks |

### What Is Missing

**Nobody is doing runtime ethical evaluation of individual agent messages with a persistent graph-based trust layer.**

Specifically, no existing system:

1. **Scores individual messages** across ethical dimensions (not just safe/unsafe binary)
2. **Evaluates in real-time** (not pre-deployment benchmarks or training-time alignment)
3. **Uses Aristotle's tripartite framework** operationally (ethos, logos, pathos as computable dimensions)
4. **Builds a persistent graph** that tracks agent reputation over time across interactions
5. **Flags specific manipulation patterns** — false credibility claims, logical fabrication, emotional exploitation
6. **Is open-source** and designed for community adoption and transparency
7. **Keeps humans in the loop** — scores inform human judgment rather than making autonomous decisions

### Ethos's Position

```
                     Training-time ◄──────────────────► Runtime
                          │                                │
   Capability ──── RLHF / Constitutional AI    AgentBench / SWE-bench
                          │                                │
   Safety ─────── Safe RLHF / Red-teaming      Guardrails / Filters
                          │                                │
   Performance ─── (none)                       ReputAgent / Observability
                          │                                │
   Ethics ─────── (none)                        ◆ ETHOS ◆
                                                    │
                                              Phronesis (Neo4j)
                                                    │
                                              Human Review Loop
```

Ethos occupies a unique position: **runtime ethical evaluation**. It is the only system that:
- Evaluates the *character* of agent communication, not just its *competence*
- Operates on live messages, not historical benchmarks
- Produces multi-dimensional scores, not binary classifications
- Builds persistent trust networks, not ephemeral pass/fail results
- Is grounded in a 2,400-year-old framework for evaluating persuasion and trustworthiness

### Why This Matters Now

As AI agents increasingly communicate with each other — negotiating, delegating, reporting — the integrity of that communication becomes critical infrastructure. An agent that completes tasks well but fabricates reasoning, claims false expertise, or exploits emotional context is not trustworthy, even if it scores well on every capability benchmark.

Ethos makes trust visible, measurable, and trackable. It turns the question from "Can this agent do the job?" to "Can this agent be trusted?"

---

## Sources

### Benchmarks
- [AgentBench: Evaluating LLMs as Agents](https://arxiv.org/abs/2308.03688)
- [GAIA: A Benchmark for General AI Assistants](https://arxiv.org/abs/2311.12983)
- [WebArena: A Realistic Web Environment](https://webarena.dev/)
- [SWE-bench](https://www.swebench.com/)
- [AI Agent Benchmark Compendium](https://github.com/philschmid/ai-agent-benchmark-compendium)
- [Best AI Agent Evaluation Benchmarks: 2025 Guide](https://o-mega.ai/articles/the-best-ai-agent-evals-and-benchmarks-full-2025-guide)

### Safety and Alignment
- [Constitutional AI: Harmlessness from AI Feedback](https://www-cdn.anthropic.com/7512771452629584566b6303311496c262da1006/Anthropic_ConstitutionalAI_v2.pdf)
- [Safe RLHF (ICLR 2024)](https://proceedings.iclr.cc/paper_files/paper/2024/file/dd1577afd396928ed64216f3f1fd5556-Paper-Conference.pdf)
- [AISI: Empirical Investigations into AI Monitoring](https://alignmentproject.aisi.gov.uk/research-area/empirical-investigations-into-ai-monitoring-and-red-teaming)
- [AI Red Teaming Guide](https://github.com/requie/AI-Red-Teaming-Guide)

### Reputation Systems
- [ReputAgent](https://reputagent.com/)
- [TrustAgent Framework (arXiv 2024)](https://arxiv.org/abs/2402.01586)
- [Survey on Trustworthy LLM Agents (KDD 2025)](https://arxiv.org/abs/2503.09648)
- [Reputation and Feedback Systems in Online Platform Markets](https://www.annualreviews.org/content/journals/10.1146/annurev-economics-080315-015325)
- [Trust is the New Currency in the AI Agent Economy (WEF 2025)](https://www.weforum.org/stories/2025/07/ai-agent-economy-trust/)

### Deception and Manipulation Research
- [The Traitors: Deception and Trust in Multi-Agent LLM Simulations](https://arxiv.org/abs/2505.12923)
- [OpenDeception: Learning Deception in Human-AI Interaction](https://arxiv.org/abs/2504.13707)
- [Secret Collusion among AI Agents (NeurIPS 2024)](https://proceedings.neurips.cc/paper_files/paper/2024/file/861f7dad098aec1c3560fb7add468d41-Paper-Conference.pdf)
- [The Trust Paradox in LLM-Based Multi-Agent Systems](https://arxiv.org/abs/2510.18563)
- [TRiSM for Agentic AI (arXiv 2025)](https://arxiv.org/abs/2506.04133)
- [Persuaficial Benchmark (arXiv 2025)](https://arxiv.org/abs/2601.04925)
- [AI Manipulation Hackathon (Apart Research, 2026)](https://apartresearch.com/sprints/ai-manipulation-hackathon-2026-01-09-to-2026-01-11)
- [Sycophancy in Multi-turn Dialogues (EMNLP 2025)](https://aclanthology.org/2025.findings-emnlp.121.pdf)

### Aristotle and Rhetoric in AI
- [Bridging Classical Rhetoric and AI (Lindenwood 2024)](https://digitalcommons.lindenwood.edu/cgi/viewcontent.cgi?article=2413&context=theses)
- [From Aristotle to AI (SyncSci 2025)](https://www.syncsci.com/journal/IJAH/article/download/IJAH.2025.01.003/995/)
- [AI and Affective Polarization: Ethos, Pathos, Logos (Arkansas State 2024)](https://arch.astate.edu/cgi/viewcontent.cgi?article=2077&context=all-etd)

### Traditional Trust Systems
- [PGP Web of Trust (Wikipedia)](https://en.wikipedia.org/wiki/Web_of_trust)
- [Sequoia Web of Trust as Flow Network](https://sequoia-pgp.gitlab.io/sequoia-wot/)
- [eBay Reputation Systems (Stanford)](https://cs.stanford.edu/people/eroberts/courses/cs181/projects/2010-11/PsychologyOfTrust/rep2.html)
- [Dynamic Decentralized Reputation (cheqd)](https://cheqd.io/blog/dynamic-decentralized-reputation-for-the-web-of-trust-what-we-can-learn-from-the-world-of-sports-tinder-and-netflix/)

### Monitoring and Observability
- [Amazon Bedrock AgentCore Evaluations](https://aws.amazon.com/blogs/aws/amazon-bedrock-agentcore-adds-quality-evaluations-and-policy-controls-for-deploying-trusted-ai-agents/)
- [AI Agent Evaluation Metrics (W&B)](https://wandb.ai/onlineinference/genai-research/reports/AI-agent-evaluation-Metrics-strategies-and-best-practices--VmlldzoxMjM0NjQzMQ)
- [Neo4j Agentic AI Offerings](https://www.businesswire.com/news/home/20251002109386/en/Neo4j-Invests-$100M-in-GenAI-Launches-New-Agentic-AI-Offerings)
