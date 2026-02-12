# A2A Protocols and Agent-to-Agent Communication

*Research document for the Ethos project — evaluating trustworthiness in agent communication.*

---

## 1. Google's Agent2Agent (A2A) Protocol

### 1.1 Overview

The Agent2Agent (A2A) protocol is an open communication standard introduced by Google at Cloud Next on April 9, 2025. It enables AI agents built by different vendors, on different frameworks, to discover each other, communicate, and coordinate tasks — without requiring shared memory, tools, or internal context.

A2A is now an open-source project under the **Linux Foundation**, licensed under Apache 2.0. At launch it had 50+ technology partners; by v0.3 (July 2025) it counted **150+ supporting organizations**.

- **Specification**: [a2a-protocol.org/latest/specification](https://a2a-protocol.org/latest/specification/)
- **GitHub**: [github.com/a2aproject/A2A](https://github.com/a2aproject/A2A)
- **Announcement**: [Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)

### 1.2 Technical Foundation

A2A is built on widely adopted standards:

| Layer | Technology |
|-------|-----------|
| Transport | HTTP, SSE, gRPC (v0.3+) |
| Messaging | JSON-RPC 2.0 |
| Data format | JSON |
| Auth | OAuth 2.0, Bearer tokens, API keys |

### 1.3 Agent Cards

An **Agent Card** is the discovery mechanism — a JSON metadata document published by an A2A server that describes:

- **Identity**: name, description, provider information
- **Service endpoint**: URL for the A2A service
- **Capabilities**: supported features (streaming, push notifications)
- **Authentication**: required schemes (Bearer, OAuth2)
- **Skills**: tasks the agent can perform, described as `AgentSkill` objects with `id`, `name`, `description`, `inputModes`, `outputModes`, and `examples`

**Discovery methods**:
1. **Well-Known URI**: `https://{domain}/.well-known/agent-card.json`
2. **Registries/Catalogs**: querying curated directories of agents
3. **Direct Configuration**: pre-configured Agent Card URLs

As of v0.3, Agent Cards can be **digitally signed** using JSON Web Signature (JWS, RFC 7515) to ensure authenticity and integrity.

### 1.4 Task Lifecycle

Tasks follow a state machine:

```
             +-> completed
             |
submitted -> working -> input-required -> working -> completed
             |              |
             +-> failed     +-> canceled
             |
             +-> rejected
             |
             +-> auth-required
```

States: `submitted`, `working`, `input-required`, `auth-required`, `completed`, `failed`, `canceled`, `rejected`.

The lifecycle stream consists of:
- `Task` object (current state)
- `TaskStatusUpdateEvent` (state transitions)
- `TaskArtifactUpdateEvent` (deliverables)

The stream closes when the task reaches a terminal state.

### 1.5 Streaming and Push Notifications

**Streaming**: Real-time updates via Server-Sent Events (SSE) or gRPC streaming. The `SendStreamingMessageResponse` delivers task state changes and artifacts incrementally.

**Push Notifications**: For long-running or disconnected scenarios, the server sends HTTP POST requests to a client-provided webhook URL when tasks reach significant state changes. The server authenticates itself to the webhook per the scheme in `PushNotificationConfig.authentication`.

### 1.6 Enterprise Authentication

A2A supports enterprise-grade auth with parity to OpenAPI's authentication schemes:

- OAuth 2.0 flows
- Bearer tokens (short-lived, scoped, auto-expiring)
- API key authentication
- Enterprise SSO integration

The Agent Card's `security` field declares which schemes the server supports. Credential exchange happens outside A2A itself (via OAuth flows, key distribution, etc.).

### 1.7 Version History

| Version | Date | Key Additions |
|---------|------|--------------|
| 0.1 | April 2025 | Initial release, 50+ partners |
| 0.2 | June 2025 | Stateless interactions, standardized auth |
| 0.3 | July 2025 | gRPC support, signed Agent Cards, 150+ orgs |
| 1.0 (draft) | In progress | Stabilization toward v1 |

### 1.8 Adoption

**Technology partners**: Atlassian, Box, Cohere, Intuit, LangChain, MongoDB, PayPal, Salesforce, SAP, ServiceNow, UKG, Workday, Adobe, Twilio, S&P Global.

**Linux Foundation founding members**: AWS, Cisco, Google, Microsoft, Salesforce, SAP, ServiceNow.

**Service providers**: Accenture, BCG, Capgemini, Cognizant, Deloitte, HCLTech, Infosys, KPMG, McKinsey, PwC, TCS, Wipro.

**Enterprise adopters**: Tyson Foods, Gordon Food Service (supply chain), ServiceNow, Adobe, Twilio (platform integration).

### 1.9 What A2A Does NOT Do

A2A handles the **plumbing** — routing, discovery, task management, streaming, authentication. It explicitly does not address:

- **Content evaluation**: no mechanism to assess whether an agent's output is truthful, accurate, or manipulative
- **Trust scoring**: no reputation system or trust metrics for agent behavior over time
- **Manipulation detection**: no analysis of persuasion tactics, emotional manipulation, or logical fallacies
- **Behavioral monitoring**: no tracking of agent behavior patterns or drift over time
- **Semantic verification**: no validation that agent claims ("HIPAA-compliant", "fully credentialed") are true

As Salesforce's research notes: "Current systems lack mechanisms to verify claims... The semantic layer represents the next phase — moving from basic connectivity to strategic business interactions."

**This is the gap Ethos fills.**

---

## 2. Anthropic's Model Context Protocol (MCP)

### 2.1 Overview

The Model Context Protocol (MCP) is an open standard released by Anthropic in November 2024 for connecting AI models to external data sources, tools, and services. While A2A is agent-to-agent (horizontal), MCP is agent-to-tools (vertical).

- **Specification**: [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2025-11-25)
- **GitHub**: [github.com/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol)

### 2.2 Architecture

MCP uses a **client-server architecture**:

```
AI Model (Client) <--MCP--> Server <---> External System
                                          (Database, API, File System, etc.)
```

Servers can run locally (private access) or remotely (cloud service).

### 2.3 Core Primitives

MCP defines three fundamental primitives:

| Primitive | Purpose | Example |
|-----------|---------|---------|
| **Tools** | Actions the LLM can invoke | Query a database, send an email, create a file |
| **Resources** | Static/semi-static data the model can read | Documentation, database schemas, config files |
| **Prompts** | Predefined instruction templates | "Summarize this PR", "Analyze this dataset" |

### 2.4 2025 Specification Updates

- **June 2025**: First stable specification — established the core model for agent-tool connectivity
- **November 2025**: Major upgrade — OAuth 2.1 authorization framework, OpenID Connect support, asynchronous capabilities, enterprise alignment

The November spec transforms MCP "from a protocol for small tool calls into a foundation for secure distributed agent architectures."

### 2.5 MCP vs A2A: Complementary Protocols

Google has explicitly positioned A2A as complementary to MCP:

| Dimension | MCP | A2A |
|-----------|-----|-----|
| **Focus** | Agent-to-tool connectivity | Agent-to-agent communication |
| **Direction** | Vertical (depth) | Horizontal (breadth) |
| **Relationship** | Client-server | Peer-to-peer |
| **Discovery** | Server capabilities | Agent Cards |
| **Use case** | Single agent accessing tools/data | Multiple agents collaborating |
| **Developed by** | Anthropic | Google (now Linux Foundation) |

**In practice, teams use both**: MCP connects agents to the tools and data they need; A2A enables those agents to coordinate with each other.

**Neither protocol evaluates the trustworthiness of the content being exchanged.** MCP ensures an agent can access a tool; A2A ensures agents can talk to each other. But who checks whether what they say is honest, accurate, or manipulative? That is Ethos.

---

## 3. Historical Agent Communication Standards

### 3.1 KQML (Knowledge Query and Manipulation Language)

**Origin**: 1990, DARPA Knowledge Sharing Effort.

KQML was the first major agent communication language. Built on **speech act theory** (Searle, 1960s; Winograd and Flores, 1970s), it defined a set of **performatives** — structured message types like `ask-one`, `tell`, `achieve`, `subscribe` — that agents could use to request information, share knowledge, and coordinate actions.

KQML established the foundational idea that agent communication is not just data transfer but **communicative acts** with defined semantics.

**Limitations**: Ambiguous semantics, inconsistent implementations, no formal verification of message content.

### 3.2 FIPA ACL (Foundation for Intelligent Physical Agents)

**Origin**: 1996, IEEE FIPA standards organization.

FIPA ACL refined KQML with:
- ~20 standardized performatives (communicative acts)
- Formal semantics based on **BDI** (Beliefs, Desires, Intentions) mental model
- 12 defined message fields
- Standardized content languages and interaction protocols

FIPA ACL was widely deployed in the late 1990s and early 2000s and became the de facto standard for multi-agent systems research.

### 3.3 Why This History Matters

The progression from KQML to FIPA ACL to A2A reveals a recurring pattern:

1. **Communication standards emerge** (how agents talk to each other)
2. **Adoption grows** (interoperability becomes possible)
3. **Trust problems surface** (how do you know what agents say is true?)

KQML and FIPA ACL solved message formatting and routing but never solved trust. A2A solves discovery, lifecycle management, and enterprise auth — but still does not evaluate content trustworthiness. The trust gap has persisted for 35 years.

**Ethos addresses the problem that every generation of agent communication protocols has left unsolved: evaluating whether what agents communicate is trustworthy.**

---

## 4. OpenAI's Approach

### 4.1 Swarm (Experimental, 2024)

OpenAI released **Swarm** as an educational framework exploring lightweight multi-agent orchestration. Core concepts:

- **Agents**: LLMs with instructions and tools
- **Handoffs**: transferring control between agents while maintaining shared context
- **Routines**: natural language instruction sequences
- A `run()` loop handling function execution, handoffs, and multi-turn conversations

Swarm was explicitly experimental and not production-ready.

- **GitHub**: [github.com/openai/swarm](https://github.com/openai/swarm)

### 4.2 Agents SDK (Production, 2025)

The **OpenAI Agents SDK** is the production successor to Swarm, actively maintained by OpenAI. Key primitives:

| Primitive | Purpose |
|-----------|---------|
| **Agents** | LLMs with instructions and tools |
| **Handoffs** | Transfer control between agents |
| **Guardrails** | Validate agent inputs and outputs |

Built-in features:
- **Tracing**: Visualize and debug agentic flows
- **Evaluation**: Test and measure agent performance
- **Fine-tuning**: Optimize models for specific applications

- **Docs**: [openai.github.io/openai-agents-python](https://openai.github.io/openai-agents-python/)
- **Announcement**: [openai.com/index/new-tools-for-building-agents](https://openai.com/index/new-tools-for-building-agents/)

### 4.3 Inter-Agent Communication Model

OpenAI's approach is **centralized orchestration** rather than decentralized protocol:

- Agents communicate through **handoffs** (not a wire protocol)
- A primary agent delegates to specialist agents sequentially
- Context is passed through shared state, not message exchange
- No discovery mechanism — agents are defined at development time

### 4.4 Trust and Safety

OpenAI's **Guardrails** system validates inputs and outputs but is:
- Scoped to a single application (not cross-system)
- Binary pass/fail (not scored evaluation)
- Focused on safety filters (not rhetorical analysis)

**OpenAI has not proposed an inter-agent communication protocol.** Their model is framework-level orchestration within a single deployment, not cross-vendor agent interoperability.

---

## 5. Agent Discovery and Authentication

### 5.1 Discovery Mechanisms

| Protocol | Discovery Method |
|----------|-----------------|
| **A2A** | Agent Cards at well-known URIs, registries, direct config |
| **MCP** | Server capability negotiation during connection |
| **OpenAI SDK** | Compile-time agent definitions (no runtime discovery) |
| **FIPA** | Directory Facilitator (DF) service |

### 5.2 Authentication Landscape

A2A supports enterprise auth (OAuth 2.0, Bearer, API keys) but this verifies **identity**, not **trustworthiness**. Authentication answers "who are you?" — it does not answer:

- Are you telling the truth?
- Are you competent at this task?
- Are you trying to manipulate me?
- Have you been reliable historically?

### 5.3 Known Attack Vectors

Security research has identified critical vulnerabilities in agent discovery and interaction:

| Attack | Description |
|--------|-------------|
| **Agent Card Shadowing** | Cloning a legitimate agent's skills in a fraudulent card |
| **Agent Impersonation** | Mimicking a trusted agent's identity to infiltrate workflows |
| **Tool Poisoning** | Injecting malicious behavior through compromised tool integrations |
| **Prompt Injection** | Exploiting Agent Card fields (description, skills, examples) embedded into client prompts |
| **Privilege Escalation** | Exploiting delegation chains to gain unauthorized access |
| **Cross-Agent Data Leakage** | Extracting sensitive data through inter-agent communication |

Sources:
- [Improving Google A2A Protocol: Protecting Sensitive Data](https://arxiv.org/html/2505.12490v3)
- [How to enhance Agent2Agent security — Red Hat](https://developers.redhat.com/articles/2025/08/19/how-enhance-agent2agent-security)
- [Safeguarding AI Agents — Palo Alto Networks](https://live.paloaltonetworks.com/t5/community-blogs/safeguarding-ai-agents-an-in-depth-look-at-a2a-protocol-risks/ba-p/1235996)

### 5.4 Signed Agent Cards (v0.3)

Version 0.3 introduced **signed Agent Cards** using JWS, allowing cryptographic verification of card integrity. This addresses impersonation but not content trustworthiness — a signed card proves the agent is who it claims to be, not that what it says is accurate or honest.

---

## 6. The Trust Gap

### 6.1 The Core Problem

Every agent communication protocol — from KQML (1990) through FIPA ACL (1996) to A2A (2025) — has solved increasingly sophisticated versions of the same problems: how agents find each other, how they format messages, how they authenticate, how they manage tasks.

None of them evaluate **what agents actually say**.

```
┌─────────────────────────────────────────────────────────────┐
│                    THE TRUST GAP                            │
│                                                             │
│  A2A handles:              A2A does NOT handle:             │
│  ✓ Agent discovery         ✗ Content truthfulness           │
│  ✓ Task lifecycle          ✗ Manipulation detection         │
│  ✓ Streaming/async         ✗ Logical soundness              │
│  ✓ Authentication          ✗ Emotional manipulation         │
│  ✓ Enterprise auth         ✗ Trust scoring over time        │
│  ✓ Message routing         ✗ Behavioral drift detection     │
│  ✓ Artifact delivery       ✗ Claim verification             │
│                                                             │
│           Ethos fills this gap.                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Why Authentication Is Not Trust

A2A's OAuth 2.0 integration verifies that Agent X is who it claims to be. It does not verify that Agent X's output is:

- **Truthful** (ethos) — Does the agent cite real sources? Is it fabricating credentials?
- **Logically sound** (logos) — Are the arguments valid? Is the reasoning coherent?
- **Emotionally honest** (pathos) — Is the agent manipulating through fear, urgency, or flattery?

Authentication is a necessary but insufficient condition for trust. A verified agent can still lie, manipulate, or hallucinate.

### 6.3 Academic Research on the Gap

Recent research confirms the trust gap is a recognized, unsolved problem:

- **"A Survey on Trustworthy LLM Agents"** (arXiv:2503.09648, March 2025): "The evaluation of agent-to-agent trustworthiness is still in its infancy."
- **"Agentic AI Security: Threats, Defenses, Evaluation"** (arXiv:2510.23883, October 2025): Identifies six threat classes including Impersonation & Role Abuse, Coordination Manipulation, Knowledge & Learning Manipulation, Inference & Policy Evasion, Accountability Obfuscation, and Confidentiality & Integrity Breaches.
- **"Toward Trustworthy Agentic AI"** (arXiv:2512.23557, December 2025): Proposes a provenance ledger tracking "modality, source, and trust level throughout the entire agent network" — achieving 94% detection rate vs. 52% for keyword filtering.

### 6.4 The Ethos Thesis

> **A2A is the highway. Ethos is the border inspection.**

A2A standardizes how agents communicate. Ethos evaluates what they communicate. Every message that flows through an A2A channel can be scored across three dimensions:

| Dimension | What It Measures | Example Flag |
|-----------|-----------------|-------------|
| **Ethos** | Credibility, authority, source reliability | "Agent claims medical expertise but has no verified credentials" |
| **Logos** | Logical structure, evidence, reasoning | "Conclusion does not follow from premises; missing evidence" |
| **Pathos** | Emotional appeals, manipulation tactics | "Uses urgency and fear to bypass deliberation" |

This produces a **trust score** that:
- Informs human decision-makers (does not replace them)
- Accumulates over time in **Phronesis** (the graph layer, backed by Neo4j)
- Enables behavioral tracking and drift detection
- Makes trust visible and auditable

---

## 7. Multi-Agent Marketplace Dynamics

### 7.1 The Agent Economy

The AI agent market is projected to grow from $7.84 billion (2025) to $52.62 billion by 2030 (CAGR 46.3%). Gartner predicts 40% of enterprise applications will embed AI agents by end of 2026, up from <5% in 2025.

This is not incremental growth — it is the emergence of an **agent economy** where autonomous agents interact economically, delegating tasks, purchasing services, and forming supply chains.

Source: [World Economic Forum — Trust is the new currency in the AI agent economy](https://www.weforum.org/stories/2025/07/ai-agent-economy-trust/)

### 7.2 Delegation Chains

In multi-agent systems, tasks cascade through delegation:

```
Human -> Orchestrator Agent -> Research Agent -> Data Agent
                            -> Analysis Agent -> Visualization Agent
                            -> Writing Agent
```

Each delegation is a trust decision. The orchestrator trusts the research agent to return accurate data. The research agent trusts the data agent to query correctly. If any link in the chain is compromised, fabricating, or manipulating, the entire output is corrupted.

**Current state**: No standard mechanism exists for evaluating trust at each delegation step. A2A manages the handoffs; nothing evaluates the content flowing through them.

### 7.3 Trust Propagation

Trust propagation — how trust assessments flow through a graph of agent interactions — is becoming critical infrastructure:

- Every delegation should be recorded as a distinct, verifiable relationship
- Policy decisions and revocations should propagate instantly across the network
- Historical behavior should inform future trust decisions
- Trust should be **transitive but decaying** — Agent A trusts Agent B, Agent B trusts Agent C, but A's trust in C should be lower and verified independently

### 7.4 Emerging Approaches

| Approach | Description | Limitation |
|----------|-------------|-----------|
| **Crypto agent tokens** | Agents pay each other in tokens for services | Economic trust, not content trust |
| **Reputation systems** | Agents accumulate ratings over time | Gaming, Sybil attacks |
| **Provenance ledgers** | Track data lineage through agent chains | Infrastructure overhead |
| **Guardrails** | Input/output validation | Binary pass/fail, single-system |
| **Ethos** | Multi-dimensional rhetorical evaluation | *Fills the content evaluation gap* |

### 7.5 The Role of Ethos in Agent Marketplaces

In an agent marketplace, Ethos serves as the **trust layer**:

1. **Pre-interaction**: Evaluate an agent's historical trust profile before delegating
2. **In-flight**: Score messages in real-time as they flow through A2A channels
3. **Post-interaction**: Update Phronesis with new evaluation data
4. **Aggregation**: Build composite trust scores across the agent network
5. **Human-in-the-loop**: Surface trust scores to decision-makers, flagging concerns before execution

---

## 8. Protocol Comparison Matrix

| Feature | KQML | FIPA ACL | A2A | MCP | OpenAI SDK |
|---------|------|----------|-----|-----|-----------|
| **Year** | 1990 | 1996 | 2025 | 2024 | 2025 |
| **Focus** | Agent messaging | Agent messaging | Agent interop | Tool access | Agent orchestration |
| **Discovery** | None | Directory Facilitator | Agent Cards | Capability negotiation | Compile-time |
| **Auth** | None | None | OAuth 2.0, Bearer, API keys | OAuth 2.1 (Nov 2025) | API keys |
| **Streaming** | No | No | SSE, gRPC | No | No |
| **Task mgmt** | No | Interaction protocols | Full lifecycle | No | Handoffs |
| **Content eval** | No | No | No | No | Guardrails (basic) |
| **Trust scoring** | No | No | No | No | No |
| **Open standard** | Yes | Yes (IEEE) | Yes (Linux Foundation) | Yes | No (SDK) |
| **Governance** | DARPA | IEEE FIPA | Linux Foundation | Anthropic | OpenAI |

**The "Content eval" and "Trust scoring" rows are empty across every protocol. This is the gap Ethos fills.**

---

## 9. Implications for Ethos

### 9.1 Integration Points

Ethos can integrate with the A2A ecosystem at multiple levels:

1. **Message Interceptor**: Evaluate A2A messages in transit between agents
2. **Agent Card Extension**: Publish trust scores as part of an agent's metadata
3. **Task Lifecycle Hook**: Score artifacts at task completion before delivery
4. **Registry Enrichment**: Add trust dimensions to agent discovery catalogs
5. **MCP Tool**: Expose Ethos evaluation as an MCP tool that any agent can call

### 9.2 Technical Alignment

Ethos aligns well with A2A's technical stack:
- Both use HTTP/JSON (easy integration)
- A2A's task lifecycle provides natural evaluation checkpoints
- Agent Cards could be extended with trust metadata
- Phronesis graphs map naturally to agent delegation chains

### 9.3 Market Positioning

> "A2A is the highway. Ethos is the border inspection."

With 150+ organizations adopting A2A, the highway is being built. But as the World Economic Forum notes: **"Trust is the new currency in the AI agent economy."** The organizations building that highway will need a trust layer. Ethos is that layer.

---

## Sources

### Specifications and Documentation
- [A2A Protocol Specification](https://a2a-protocol.org/latest/specification/)
- [A2A GitHub Repository](https://github.com/a2aproject/A2A)
- [MCP Specification (November 2025)](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)

### Announcements and Blog Posts
- [Google: Announcing A2A](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [Google: A2A Protocol Getting an Upgrade](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)
- [Google: Donating A2A to Linux Foundation](https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/)
- [Linux Foundation: Launching A2A Project](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [Salesforce: The A2A Semantic Layer](https://www.salesforce.com/blog/agent-to-agent-interaction/?bc=OTH)
- [OpenAI: New Tools for Building Agents](https://openai.com/index/new-tools-for-building-agents/)

### Analysis and Comparison
- [IBM: What Is Agent2Agent Protocol?](https://www.ibm.com/think/topics/agent2agent-protocol)
- [DZone: MCP vs A2A Practical Enterprise Integration](https://dzone.com/articles/model-context-protocol-agent2agent-practical)
- [Gravitee: A2A and MCP](https://www.gravitee.io/blog/googles-agent-to-agent-a2a-and-anthropics-model-context-protocol-mcp)
- [InfoQ: Google Open-Sources A2A](https://www.infoq.com/news/2025/04/google-agentic-a2a/)

### Security Research
- [Red Hat: How to Enhance A2A Security](https://developers.redhat.com/articles/2025/08/19/how-enhance-agent2agent-security)
- [Palo Alto Networks: Safeguarding AI Agents](https://live.paloaltonetworks.com/t5/community-blogs/safeguarding-ai-agents-an-in-depth-look-at-a2a-protocol-risks/ba-p/1235996)
- [Semgrep: Security Engineer's Guide to A2A](https://semgrep.dev/blog/2025/a-security-engineers-guide-to-the-a2a-protocol/)
- [arXiv: Improving A2A — Protecting Sensitive Data](https://arxiv.org/html/2505.12490v3)

### Academic Papers
- [A Survey on Trustworthy LLM Agents (arXiv:2503.09648)](https://arxiv.org/html/2503.09648v1)
- [Agentic AI Security: Threats, Defenses, Evaluation (arXiv:2510.23883)](https://arxiv.org/html/2510.23883v1)
- [Toward Trustworthy Agentic AI (arXiv:2512.23557)](https://www.arxiv.org/abs/2512.23557)
- [Survey of Agent Interoperability Protocols (arXiv:2505.02279)](https://arxiv.org/html/2505.02279v1)

### Market and Industry
- [World Economic Forum: Trust in the AI Agent Economy](https://www.weforum.org/stories/2025/07/ai-agent-economy-trust/)
- [World Economic Forum: AI Agents Could Be Worth $236B by 2034](https://www.weforum.org/stories/2026/01/ai-agents-trust/)
- [Wikipedia: Agent Communications Language](https://en.wikipedia.org/wiki/Agent_Communications_Language)
- [Wikipedia: Model Context Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)
