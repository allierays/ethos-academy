# Autonomous AI Agent Architectures and Frameworks

*Research compiled for the Ethos project — an open-source evaluation framework for AI agent trustworthiness.*

Last updated: 2026-02-10

---

## Table of Contents

1. [Major Autonomous Agent Frameworks](#1-major-autonomous-agent-frameworks)
2. [Agent Architecture Patterns](#2-agent-architecture-patterns)
3. [How Agents Make Autonomous Decisions](#3-how-agents-make-autonomous-decisions)
4. [Trust and Safety Challenges](#4-trust-and-safety-challenges)
5. [Real-World Deployments](#5-real-world-deployments)
6. [Implications for Ethos](#6-implications-for-ethos)

---

## 1. Major Autonomous Agent Frameworks

### 1.1 Tier 1: Production-Grade Frameworks

#### LangGraph (LangChain)

LangGraph treats agent workflows as directed graphs where each node represents a specific task or function. This graph-based architecture provides fine-grained control over branching, conditional logic, parallel processing, and dynamic adaptation. It offers explicit state management, making it the preferred choice for engineering teams building custom, complex agent workflows who need full control.

- **Architecture**: Graph-based workflow with nodes and edges
- **Strengths**: Explicit state handling, conditional branching, error recovery, deep integration with LangChain ecosystem
- **Best for**: Complex multi-step workflows requiring sophisticated orchestration
- **Adoption**: High among enterprise engineering teams; strong open-source community
- **Source**: [LangGraph vs CrewAI vs AutoGen comparison](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026)

#### CrewAI

CrewAI implements multi-agent collaboration by defining specialized roles, tasks, and skills — inspired by real-world organizational structures. Agents within a "crew" share context, support human-in-the-loop patterns, and can learn from past interactions through built-in memory capabilities.

- **Architecture**: Role-based multi-agent crews
- **Strengths**: Intuitive team metaphor, shared crew context, memory systems, human-in-the-loop
- **Best for**: Team-of-agents scenarios where roles map to real organizational functions
- **Adoption**: Strong among developers building collaborative agent systems
- **Source**: [DataCamp tutorial on CrewAI vs LangGraph vs AutoGen](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)

#### Microsoft AutoGen / Agent Framework

Microsoft AutoGen focuses on multi-agent conversations and has evolved into the broader Microsoft Agent Framework — an open-source SDK combining the enterprise stability of Semantic Kernel with AutoGen's orchestration patterns.

- **Architecture**: Conversational multi-agent with unified runtime
- **Strengths**: Enterprise integration, Microsoft ecosystem (Teams, SharePoint), multi-agent conversations
- **Best for**: Enterprise deployments within Microsoft's cloud
- **Adoption**: Consolidating under new unified framework; production use in Dynamics 365 and Copilot
- **Source**: [Microsoft AutoGen GitHub](https://github.com/microsoft/autogen)

#### OpenAI Agents SDK

The OpenAI Agents SDK is a production-ready, lightweight abstraction for building agentic applications. It evolved from the experimental Swarm project and is now tightly integrated with MCP for tool connectors.

- **Architecture**: Thin abstraction layer with handoffs between specialized agents
- **Strengths**: Simplicity, minimal abstractions, native MCP integration, production-ready
- **Best for**: OpenAI-ecosystem developers who want minimal boilerplate
- **Source**: [OpenAI Agents SDK docs](https://openai.github.io/openai-agents-python/)

#### Anthropic's Agent Patterns

Anthropic takes a patterns-first approach rather than providing a monolithic framework. Their philosophy: the most successful agent implementations use simple, composable patterns rather than complex frameworks. Key contributions:

- **Building Effective Agents** — a reference guide on composable agent patterns including prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer loops
- **Agent Skills** — organized folders of instructions, scripts, and resources that agents discover and load dynamically, solving the "unlimited tool library" problem
- **Claude Agent SDK** — a lightweight SDK for building agents with Claude, emphasizing tool use and context engineering
- **Effective Harnesses** — patterns for long-running agents with initializer agents and incremental coding agents
- **Context Engineering** — "just in time" approaches that maintain lightweight identifiers and dynamically load data into context at runtime

- **Architecture**: Composable patterns, not a rigid framework
- **Strengths**: Simplicity, flexibility, strong tool-use design, MCP originator
- **Best for**: Teams that want full architectural control with proven patterns
- **Sources**: [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents), [Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), [Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

### 1.2 Tier 2: Cloud Platform Agent Frameworks

#### Google Agent Development Kit (ADK)

Introduced at Google Cloud NEXT 2025, ADK is an open-source framework for building multi-agent systems optimized for Gemini models and Vertex AI. It supports workflow agents (Sequential, Parallel, Loop) for predictable pipelines and LLM-driven dynamic routing for adaptive behavior. Notably, it includes built-in bidirectional audio and video streaming for multimodal agent interactions.

- **Source**: [Google ADK docs](https://google.github.io/adk-docs/)

#### Amazon Strands Agents

Released as v1.0.0 in July 2025, Strands Agents is an open-source SDK taking a model-driven approach to agent building. It scales from simple to complex use cases with seamless AWS service integration.

- **Source**: [AWS Strands Agents announcement](https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/)

### 1.3 Tier 3: Pioneering / Research Frameworks

#### AutoGPT

AutoGPT pioneered the autonomous agent concept in 2023, demonstrating AI agents that independently pursue goals through iterative planning and execution. With 167,000+ GitHub stars, it remains historically significant but is largely obsolete for production use as of 2026. Its core contribution was proving the viability of autonomous goal-directed agents.

- **Status**: Influential but superseded by production-grade alternatives

#### BabyAGI

Created by Yohei Nakajima in 2023, BabyAGI orchestrates a loop of task creation, execution, and prioritization using an LLM and vector memory store. The original was archived in September 2024. The newest iteration is an experimental self-building autonomous agent. BabyAGI remains primarily an educational sandbox rather than a production tool.

- **Status**: Archived/experimental; valuable for learning autonomous agent concepts
- **Source**: [IBM explanation of BabyAGI](https://www.ibm.com/think/topics/babyagi)

#### MetaGPT

MetaGPT simulates software development team structure, with agents acting as CEO, project manager, and developers. Its key architectural innovation is requiring structured outputs (documents, diagrams) instead of unstructured chat, and implementing a publish-subscribe mechanism for information sharing. This reduces "unproductive chatter" between agents.

- **Status**: Active research project with ~46K GitHub stars
- **Source**: [MetaGPT GitHub](https://github.com/FoundationAgents/MetaGPT)

### 1.4 The MCP Standard

The Model Context Protocol (MCP), introduced by Anthropic in November 2024, has become the universal standard for connecting AI agents to external tools and data sources. It solves the "M x N problem" (M AI applications x N tools) by reducing it to M + N integrations.

**2025 adoption milestones:**
- March 2025: OpenAI officially adopted MCP across products including ChatGPT desktop
- April 2025: Google DeepMind confirmed MCP support for Gemini models
- June 2025: Salesforce anchored Agentforce 3 around MCP
- September 2025: MCP Registry launched with ~2,000 entries; 407% growth in servers
- November 2025: Updated specification released; 97 million monthly SDK downloads
- December 2025: Anthropic donated MCP to the Agentic AI Foundation (AAIF) under the Linux Foundation, with OpenAI and Block as co-founders

**Security concerns:** Researchers identified vulnerabilities including prompt injection via tools, permission escalation through tool combination, and lookalike tools that can silently replace trusted ones.

- **Sources**: [MCP specification](https://modelcontextprotocol.io/specification/2025-11-25), [MCP one-year anniversary](http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/), [Thoughtworks on MCP impact](https://www.thoughtworks.com/en-us/insights/blog/generative-ai/model-context-protocol-mcp-impact-2025)

---

## 2. Agent Architecture Patterns

### 2.1 Core Reasoning Patterns

#### ReAct (Reasoning + Acting)

The dominant agent reasoning pattern. The agent operates in an iterative loop:

1. **Think** — emit a reasoning trace analyzing the current situation
2. **Act** — propose and execute a concrete action (API call, tool use, database query)
3. **Observe** — integrate the result into context
4. **Repeat** — update the plan and continue until the goal is reached or an exit condition is met

ReAct is the foundation most frameworks build upon. Its strength is interleaving reasoning with action, enabling adaptive responses to changing information.

- **Source**: [EmergentMind on ReAct architecture](https://www.emergentmind.com/topics/react-based-agent-architecture)

#### Plan-and-Execute

A two-phase approach where a planner agent outlines high-level steps, then an executor agent (often using ReAct internally) carries them out. The planner can monitor progress and replan when execution reveals new information.

- **Strengths**: Better for long-horizon tasks; separates strategic planning from tactical execution
- **Weakness**: Upfront planning can be wasted if the environment changes rapidly

#### ReWOO (Reasoning Without Observation)

A variant that generates the full plan and all tool calls upfront, then executes them in batch. More efficient than ReAct for predictable workflows but less adaptive.

#### Tree of Thoughts

Extends chain-of-thought by exploring multiple reasoning paths simultaneously, evaluating each, and selecting the most promising. Useful for creative problem-solving and tasks with uncertain solutions.

### 2.2 Multi-Agent Orchestration Patterns

#### Centralized Orchestration

A single manager/router agent assigns tasks, controls workflow, and ensures objectives are met. The manager acts as a central hub directing work to specialized agents.

- **Best for**: Systems requiring strict coordination and oversight
- **Risk**: Single point of failure; manager agent bottleneck

#### Sequential Pipeline

A linear pipeline where tasks flow through a fixed sequence of agents, each transforming the output for the next. Ideal for processes with clear dependencies (e.g., research -> draft -> review -> publish).

#### Hierarchical Orchestration

A tiered manager-subordinate structure where top-level managers delegate to mid-level coordinators who manage specialized worker agents. Scales to complex, multi-department workflows.

#### Debate / Consensus

Agents engage in structured debate, exchanging arguments and iteratively improving answers until consensus. Research shows voting protocols improve reasoning tasks by 13.2% and consensus protocols improve knowledge tasks by 2.8%. The debate transcript creates an auditable trail of why decisions were made, improving explainability.

- **Source**: [ACL 2025 Findings: Voting or Consensus in Multi-Agent Debate](https://aclanthology.org/2025.findings-acl.606/)

#### Evaluator-Optimizer

One agent generates output while another evaluates and provides feedback, creating an iterative refinement loop. This pattern naturally maps to Ethos's evaluation model — the evaluator assesses trust dimensions.

### 2.3 Modern Hybrid Approaches

Production systems in 2025-2026 typically combine multiple patterns:
- **Reflexion + ReAct** for adaptive reasoning with self-correction
- **Plan-Execute + Tree of Thoughts** for long-term creative problem solving
- **Hierarchical orchestration with debate** for complex enterprise decisions

Google's documentation recommends choosing patterns based on task complexity, noting that "a well-designed system might use a planner agent to outline the approach, then spawn a research agent using ReAct to dynamically gather information."

- **Sources**: [Google Cloud agent design patterns](https://docs.google.com/architecture/choose-design-pattern-agentic-ai-system), [7 Must-Know Agentic AI Design Patterns](https://machinelearningmastery.com/7-must-know-agentic-ai-design-patterns/)

---

## 3. How Agents Make Autonomous Decisions

### 3.1 Action Chaining

Agents decompose goals into sequences of tool calls, where each action's output informs the next. The LLM serves as the orchestrator, deciding which tool to call, with what parameters, and how to interpret results. Modern frameworks provide structured action spaces (tool definitions, API schemas) that constrain the agent to valid actions.

### 3.2 Memory Systems

Memory has evolved through three stages, formalized in recent research:

1. **Storage** — trajectory preservation: recording raw sequences of actions and observations
2. **Reflection** — trajectory refinement: analyzing stored experiences to extract patterns and lessons
3. **Experience** — trajectory abstraction: distilling refined memories into reusable knowledge

**Memory types in modern agents:**
- **Short-term / working memory**: Current conversation context and active task state
- **Long-term / episodic memory**: Past interactions stored in vector databases, tagged with metadata
- **Semantic memory**: Facts and knowledge extracted from experiences
- **Procedural memory**: Learned skills and strategies (e.g., Anthropic's Agent Skills folders)

Memory and reflection form a virtuous cycle: memory provides raw material for reflection, and reflection produces distilled knowledge to feed back into memory, driving continuous learning.

- **Sources**: [AI agent memory evolution survey](https://bdtechtalks.com/2025/08/31/ai-agent-memory-frameworks/), [Memory and Reflection foundations](https://reflectedintelligence.com/2025/04/29/memory-and-reflection-foundations-for-autonomous-ai-agents/)

### 3.3 Reflection and Self-Correction

Reflection enables agents to evaluate their own performance and adjust. Key mechanisms:

- **Reflexion**: Agents receive feedback (success/failure signals, evaluator outputs) and generate verbal self-reflections stored in memory for future reference. These reflections guide subsequent attempts.
- **Multi-Agent Reflexion (MAR)**: Incorporates diverse reasoning personas — separating acting, diagnosing, critiquing, and aggregating — to reduce shared blind spots and prevent reinforcement of earlier mistakes.
- **Dynamic Instructions**: Meta-thoughts with a self-consistency classifier issue "refresh," "stop," or "select" instructions to guide further reflection steps, mitigating redundancy and drift.

**Critical limitation:** LLMs may produce stubborn (46.7%) or highly random (45.7%) self-evaluations without external feedback. Self-correction alone is unreliable — agents need external grounding signals.

- **Sources**: [Reflexion deep dive](https://sparkco.ai/blog/deep-dive-into-reflexion-self-reflection-agents), [HuggingFace AI Trends 2026](https://huggingface.co/blog/aufklarer/ai-trends-2026-test-time-reasoning-reflective-agen), [MAR paper](https://arxiv.org/html/2512.20845)

### 3.4 Planning and Replanning

Modern agents use hierarchical planning:
1. High-level goal decomposition into subtasks
2. Resource allocation and dependency ordering
3. Execution with monitoring
4. Replanning when observations diverge from expectations

The sophistication of planning varies by framework — LangGraph makes planning explicit through graph structure; CrewAI distributes planning across role-based agents; Anthropic's patterns recommend starting simple and adding planning complexity only when needed.

---

## 4. Trust and Safety Challenges

### 4.1 The OWASP Agentic AI Top 10

The OWASP GenAI Security Project released the definitive taxonomy of agentic AI threats, with input from 100+ security researchers. These are the threats Ethos needs to understand:

| ID | Threat | Description |
|----|--------|-------------|
| ASI01 | **Agent Goal Hijack** | Hidden prompts turn agents into silent exfiltration engines; prompt injection redirects agent goals |
| ASI02 | **Tool Misuse** | Agents bend legitimate tools into destructive outputs; unintended tool combinations |
| ASI03 | **Identity & Privilege Abuse** | Leaked credentials let agents operate far beyond intended scope |
| ASI04 | **Excessive Agency** | Agents granted overly broad permissions, autonomy, or functionality |
| ASI05 | **Insufficient Guardrails** | Missing output validation, scope constraints, or action boundaries |
| ASI06 | **Memory & Context Poisoning** | Injected or corrupted memories reshape agent behavior long after initial interaction |
| ASI07 | **Insecure Inter-Agent Communication** | Spoofed messages misdirect entire agent clusters |
| ASI08 | **Cascading Failures** | False signals propagate through automated pipelines with escalating impact |
| ASI09 | **Human-Agent Trust Exploitation** | Confident, polished explanations mislead human operators into approving harmful actions |
| ASI10 | **Rogue Agents** | Misalignment, concealment, and self-directed action beyond intended parameters |

- **Sources**: [OWASP Agentic AI Top 10](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), [OWASP ASI taxonomy](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)

### 4.2 Hallucination Cascading

Hallucination cascading occurs when one agent generates inaccurate information that gets reinforced through memory, tool use, or inter-agent communication, amplifying misinformation across multiple decision-making steps.

**Key dynamics:**
- Unlike monolithic systems where errors trigger immediate exceptions, failures in one agent can **silently corrupt the state of others**, producing subtle hallucinations rather than obvious crashes
- If Agent A trusts Agent B and Agent B trusts Agent C, and C is compromised, A accepts C's outputs through the **transitive trust chain** without independent verification
- Single-agent errors are localized; multi-agent errors become **systemic**
- Agent hallucinations can arise at any stage of the decision-making pipeline and exhibit **hallucinatory accumulation** and **inter-module dependency**

**Real-world example:** A Fortune 500 company deployed an AI support agent that within days started offering customers 50% discounts on hallucinated products, resulting in hundreds of thousands of dollars in unplanned losses.

- **Sources**: [Galileo on multi-agent hallucination](https://galileo.ai/blog/multi-agent-coordination-failure-mitigation), [OWASP ASI08 guide](https://adversa.ai/blog/cascading-failures-in-agentic-ai-complete-owasp-asi08-security-guide-2026/), [LLM agent hallucination survey](https://arxiv.org/html/2509.18970v1)

### 4.3 Prompt Injection Between Agents

Prompt injection in multi-agent systems is especially dangerous because:
- Medical LLM studies show injection attacks achieved a **94.4% success rate** at manipulating clinical decision support
- OWASP ranks prompt injection as the **#1 critical vulnerability**, appearing in 73% of production AI deployments assessed during audits
- The most common attacker objective in Q4 2025 was **system prompt extraction**, exposing role definitions, tool descriptions, policy boundaries, and workflow logic
- Inter-agent communication creates new attack surfaces where one compromised agent can inject malicious instructions into others

- **Sources**: [MDPI prompt injection review](https://www.mdpi.com/2078-2489/17/1/54), [ScienceDirect on protocol exploits](https://www.sciencedirect.com/science/article/pii/S2405959525001997), [Obsidian Security on prompt injection](https://www.obsidiansecurity.com/blog/prompt-injection)

### 4.4 Unauthorized Actions and Scope Creep

OWASP's LLM06:2025 (Excessive Agency) addresses agents granted overly broad permissions. Key risks:
- When user instructions are incomplete, hallucinated actions can trigger real consequences (forging emails, granting unauthorized access)
- The rapid growth of plugins and inter-agent protocols has outpaced security practices
- 80% of organizations report agents misbehaving — leaking data, accessing unauthorized systems, or hallucinating information

### 4.5 Human-Agent Trust Exploitation (ASI09)

Perhaps the most relevant threat to Ethos: agents can generate confident, polished explanations that mislead human operators into approving harmful actions. This is precisely the scenario Ethos's ethos/logos/pathos scoring is designed to detect — measuring whether persuasion is proportionate to evidence, whether authority claims are justified, and whether emotional appeal is manipulative.

### 4.6 Mitigation Approaches

Defense requires a defense-in-depth strategy:

1. **Architectural isolation** — trust boundaries between agents, circuit breakers that halt processing when consistency checks fail
2. **Runtime verification** — multi-agent consensus, ground truth validation, output verification against authoritative sources
3. **Uncertainty quantification** — confidence scoring on agent outputs, flagging low-confidence claims
4. **Comprehensive observability** — automated cascade pattern detection, kill switches, audit trails
5. **Human-in-the-loop gates** — critical decisions require human approval, with clear presentation of confidence levels and reasoning

- **Source**: [Rippling on agentic AI security](https://www.rippling.com/blog/agentic-ai-security)

---

## 5. Real-World Deployments

### 5.1 Adoption Numbers

- **57%** of companies report having AI agents running in production (2025)
- **42%** have deployed at least some agents, up from **11%** two quarters prior (Q3 2025)
- However, a closer look reveals only **95 out of 1,837 respondents** had agents live in production at scale — true production deployment remains rare compared to pilot programs
- Technology departments lead adoption at **95%**, followed by operations (89%) and risk management (66%)

- **Sources**: [Cleanlab: AI agents in production 2025](https://cleanlab.ai/ai-agents-in-production-2025/), [Fortune on AI agent trust gap](https://fortune.com/2025/12/11/ai-agent-workforce-adoption-trust-risks-challenges/)

### 5.2 Where Agents Are Working

| Domain | Deployment | Status |
|--------|------------|--------|
| **Customer Service** | Salesforce customers automating 70% of tier-1 support inquiries | Production |
| **Retail** | Lowe's agent companions for 250,000 store associates across 1,700+ stores | Production |
| **Healthcare** | Hippocratic AI for non-diagnostic patient intake | Production |
| **Insurance** | Allianz autonomous claims processing | Production |
| **IT Support** | Cisco IQ proactive IT support agents | Production |
| **Enterprise** | Microsoft collaborative agents in Teams, SharePoint, Viva Engage — summarizing threads, drafting updates, facilitating meetings | Production |
| **Finance** | Dynamics 365 agents for time/expense entry, supplier outreach, reconciliations | Production |
| **Supply Chain** | Transportation companies using AI for spot freight negotiations | Production |

### 5.3 What's Working

- **Narrow, well-defined tasks** with clear boundaries (claims processing, IT ticket routing)
- **Human-in-the-loop** deployments where agents assist rather than fully replace human decision-making
- **Domain-specific agents** trained on structured processes with measurable outcomes
- **Low-risk automation** where errors are recoverable (drafting responses, summarizing meetings)

### 5.4 What's Failing

- **Fully autonomous** agents operating without guardrails (the "50% discount" hallucination incident)
- **Open-ended** agents with broad permissions and insufficient constraints
- **Multi-agent systems** where error propagation is not managed
- **Trust calibration** — humans either over-trust agent outputs (automation bias) or under-trust them (not adopting)
- **Deloitte's assessment**: Autonomous generative AI agents are still under development, with most deployments being semi-autonomous at best

- **Source**: [Deloitte on autonomous agent development](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2025/autonomous-generative-ai-agents-still-under-development.html)

---

## 6. Implications for Ethos

### 6.1 Why Ethos Matters Now

The research reveals a critical gap in the autonomous agent ecosystem:

1. **Frameworks are maturing** — LangGraph, CrewAI, AutoGen, and platform SDKs provide production-grade orchestration
2. **Agents are deploying** — 42-57% of organizations are moving agents toward production
3. **Trust infrastructure is missing** — OWASP identifies 10 critical threat categories, but few tools exist to evaluate agent outputs in real-time
4. **Humans are in the loop but unsupported** — operators approve/reject agent actions without systematic trust scoring

Ethos fills this gap by evaluating the trustworthiness of agent messages across three dimensions that map directly to the threat landscape:

| Ethos Dimension | Threat it Addresses | OWASP Mapping |
|----------------|---------------------|---------------|
| **Ethos** (character/trust) | Authority manipulation, rogue agents | ASI09, ASI10 |
| **Logos** (reasoning/accuracy) | Hallucination, cascading errors | ASI08, ASI02 |
| **Pathos** (emotional intelligence) | Emotional manipulation, trust exploitation | ASI09 |

### 6.2 Integration Points

Based on this research, Ethos should target integration with:

1. **Framework middleware** — evaluation hooks in LangGraph nodes, CrewAI task callbacks, agent SDK tool wrappers
2. **MCP tool servers** — Ethos as an MCP server that any agent framework can call to evaluate messages before acting
3. **Inter-agent communication** — evaluating messages between agents in multi-agent systems (ASI07 mitigation)
4. **Human-in-the-loop gates** — providing trust scores at decision points where humans approve/reject agent actions
5. **Memory systems** — evaluating information before it enters long-term memory (ASI06 mitigation)

### 6.3 Architectural Recommendations

1. **Phronesis (the graph layer)** — Neo4j graph structure should model trust relationships between agents, tools, and outputs over time, enabling detection of transitive trust chain vulnerabilities
2. **Circuit breaker integration** — Ethos scores could trigger circuit breakers when trust drops below thresholds, preventing cascading failures
3. **Debate pattern evaluation** — Ethos can evaluate the quality of inter-agent debate transcripts, assessing whether consensus was reached through valid reasoning or groupthink
4. **Reflection validation** — when agents self-correct, Ethos can evaluate whether the correction improved trustworthiness or introduced new problems (given the 46.7% stubborn self-evaluation finding)

### 6.4 Key Takeaway

The autonomous agent ecosystem is growing rapidly but deploying without adequate trust infrastructure. Ethos occupies a unique position: it applies classical rhetorical analysis (ethos, logos, pathos) to AI agent messages — the same framework humans have used for 2,400 years to evaluate persuasion and trustworthiness. In a world where agents increasingly communicate with each other and with humans, systematic evaluation of message trustworthiness is not optional. It is infrastructure.

---

## Sources Index

### Frameworks
- [LangGraph vs CrewAI vs AutoGen: Top 10 Frameworks](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026)
- [DataCamp: CrewAI vs LangGraph vs AutoGen](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)
- [Microsoft AutoGen GitHub](https://github.com/microsoft/autogen)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic: Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Anthropic: Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Anthropic: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [AWS Strands Agents](https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/)
- [MetaGPT GitHub](https://github.com/FoundationAgents/MetaGPT)
- [IBM: What is BabyAGI](https://www.ibm.com/think/topics/babyagi)

### Architecture Patterns
- [EmergentMind: ReAct-based Agent Architecture](https://www.emergentmind.com/topics/react-based-agent-architecture)
- [Wollenlabs: Modern LLM Agent Architectures](https://www.wollenlabs.com/blog-posts/navigating-modern-llm-agent-architectures-multi-agents-plan-and-execute-rewoo-tree-of-thoughts-and-react)
- [Google Cloud: Agent Design Patterns](https://docs.google.com/architecture/choose-design-pattern-agentic-ai-system)
- [7 Must-Know Agentic AI Design Patterns](https://machinelearningmastery.com/7-must-know-agentic-ai-design-patterns/)
- [ACL 2025: Voting or Consensus in Multi-Agent Debate](https://aclanthology.org/2025.findings-acl.606/)

### Memory and Reflection
- [AI Agent Memory Frameworks (TechTalks)](https://bdtechtalks.com/2025/08/31/ai-agent-memory-frameworks/)
- [Memory and Reflection Foundations](https://reflectedintelligence.com/2025/04/29/memory-and-reflection-foundations-for-autonomous-ai-agents/)
- [Reflexion Deep Dive](https://sparkco.ai/blog/deep-dive-into-reflexion-self-reflection-agents)
- [HuggingFace: AI Trends 2026 — Reflective Agents](https://huggingface.co/blog/aufklarer/ai-trends-2026-test-time-reasoning-reflective-agen)
- [MAR: Multi-Agent Reflexion](https://arxiv.org/html/2512.20845)

### Trust and Safety
- [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- [OWASP Agentic AI Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
- [OWASP ASI08 Cascading Failures Guide](https://adversa.ai/blog/cascading-failures-in-agentic-ai-complete-owasp-asi08-security-guide-2026/)
- [Galileo: Multi-Agent Coordination Failure](https://galileo.ai/blog/multi-agent-coordination-failure-mitigation)
- [LLM Agent Hallucination Survey](https://arxiv.org/html/2509.18970v1)
- [MDPI: Prompt Injection Comprehensive Review](https://www.mdpi.com/2078-2489/17/1/54)
- [ScienceDirect: Protocol Exploits in Agent Workflows](https://www.sciencedirect.com/science/article/pii/S2405959525001997)
- [Obsidian Security: Prompt Injection](https://www.obsidiansecurity.com/blog/prompt-injection)
- [Rippling: Agentic AI Security Guide](https://www.rippling.com/blog/agentic-ai-security)

### MCP
- [MCP Specification (Nov 2025)](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP One-Year Anniversary](http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)
- [Thoughtworks: MCP Impact on 2025](https://www.thoughtworks.com/en-us/insights/blog/generative-ai/model-context-protocol-mcp-impact-2025)

### Real-World Deployments
- [Cleanlab: AI Agents in Production 2025](https://cleanlab.ai/ai-agents-in-production-2025/)
- [Fortune: AI Agent Workforce Trust Gap](https://fortune.com/2025/12/11/ai-agent-workforce-adoption-trust-risks-challenges/)
- [Deloitte: Autonomous Agents Under Development](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2025/autonomous-generative-ai-agents-still-under-development.html)
- [Microsoft Dynamics 365: Agentic Business Applications](https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2025/12/09/the-era-of-agentic-business-applications-arrives-at-convergence-2025/)
