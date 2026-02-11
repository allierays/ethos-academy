# Agent-to-Agent Communication: The A2A Protocol and the Broader Landscape

## Research Document | February 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Google's Agent2Agent (A2A) Protocol](#googles-agent2agent-a2a-protocol)
   - [What It Is](#what-it-is)
   - [How It Works](#how-it-works)
   - [Agent Cards and Discovery](#agent-cards-and-discovery)
   - [Task Lifecycle](#task-lifecycle)
   - [Adoption and Governance](#adoption-and-governance)
3. [The Trust and Security Gap in A2A](#the-trust-and-security-gap-in-a2a)
   - [What A2A Provides](#what-a2a-provides-for-security)
   - [What A2A Does Not Provide](#what-a2a-does-not-provide)
   - [Identified Vulnerabilities (Academic Research)](#identified-vulnerabilities-academic-research)
   - [The Missing Pieces](#the-missing-pieces)
4. [The Broader Protocol Landscape](#the-broader-protocol-landscape)
   - [Anthropic's Model Context Protocol (MCP)](#anthropics-model-context-protocol-mcp)
   - [IBM's Agent Communication Protocol (ACP)](#ibms-agent-communication-protocol-acp)
   - [Agent Network Protocol (ANP)](#agent-network-protocol-anp)
   - [How They Relate: A Comparison](#how-they-relate-a-comparison)
5. [The State of Multi-Agent Systems](#the-state-of-multi-agent-systems)
   - [Market Trajectory](#market-trajectory)
   - [Architectural Patterns](#architectural-patterns)
6. [Security Concerns in Agent-to-Agent Communication](#security-concerns-in-agent-to-agent-communication)
   - [OWASP Top 10 for Agentic Applications (2026)](#owasp-top-10-for-agentic-applications-2026)
   - [Identity as the Core Attack Surface](#identity-as-the-core-attack-surface)
   - [Cascading Failures](#cascading-failures)
   - [The Rogue Agent Problem](#the-rogue-agent-problem)
7. [Relevance to Ethos](#relevance-to-ethos)
8. [Sources](#sources)

---

## Executive Summary

The rise of autonomous AI agents has created an urgent need for standardized communication between them. Google's Agent2Agent (A2A) protocol, announced in April 2025 and donated to the Linux Foundation in June 2025, has emerged as the leading standard for agent-to-agent interoperability, with support from over 150 organizations including AWS, Microsoft, Salesforce, SAP, and ServiceNow.

A2A solves a critical infrastructure problem: how agents discover each other, negotiate capabilities, and execute tasks across vendor and framework boundaries. It is, in effect, the highway system for agent communication.

But a highway system is not a border inspection. A2A handles the handshake -- the discovery, the transport, the task lifecycle. It does not handle the judgment: Should this agent be trusted? Is this request ethically sound? Does this delegation chain preserve human intent? Should this action proceed given its downstream consequences?

This gap is not a flaw in A2A. It is a deliberate architectural boundary. And it is precisely the space where Ethos operates.

---

## Google's Agent2Agent (A2A) Protocol

### What It Is

The Agent2Agent Protocol (A2A) is an open standard enabling AI agents built on different frameworks, by different vendors, to communicate and collaborate. IBM describes it as "a common language or universal translator for agent ecosystems."

Google launched A2A on April 9, 2025, with initial support from over 50 technology partners. By July 2025, that number had grown to over 150 organizations. The protocol was donated to the Linux Foundation in June 2025.

As Google Cloud VP Rao Surapaneni stated: "The Agent2Agent protocol establishes a vital open standard for communication, enabling truly interoperable AI agents." The announcement emphasized that "enabling agents to interoperate with each other...will increase autonomy and multiply productivity gains, while lowering long-term costs."

### How It Works

A2A is built on five design principles:

1. **Embrace agentic capabilities** -- Agents are treated as peers, not reduced to tools. They can negotiate, delegate, and collaborate as autonomous entities.
2. **Build on existing standards** -- The protocol uses HTTP/HTTPS for transport, JSON-RPC 2.0 for message formatting, and Server-Sent Events (SSE) for streaming. This means it integrates with existing enterprise infrastructure.
3. **Secure by default** -- Enterprise-grade authentication with parity to OpenAPI's authentication schemes.
4. **Support long-running tasks** -- From quick lookups to multi-day research projects, with real-time status updates.
5. **Modality agnostic** -- Supports text, audio, video, and structured data.

The protocol defines two roles:

- **Client Agent**: Formulates and sends task requests
- **Remote Agent (Server)**: Receives, processes, and responds to tasks

Communication follows a three-step process:

1. **Discovery**: The client agent fetches Agent Cards to identify capable remote agents
2. **Authentication**: Mutual authentication via API keys, OAuth 2.0, OpenID Connect, or mutual TLS
3. **Communication**: Task execution over HTTPS with JSON-RPC 2.0, supporting synchronous and asynchronous patterns

### Agent Cards and Discovery

The Agent Card is the foundational discovery mechanism in A2A. It is a JSON metadata document published by an A2A Server that describes its identity, capabilities, skills, service endpoint, and authentication requirements. IBM describes it as a "business card, resume, or LinkedIn profile that allows agents to discover each other."

Agent Cards are hosted at a well-known URI: `https://{agent-server-domain}/.well-known/agent-card.json`, following RFC 8615 conventions. A client agent performs an HTTP GET request to this endpoint and receives the card as a JSON response.

An Agent Card contains:

- **AgentProvider**: Vendor identity
- **AgentCapabilities**: Supported features (streaming, push notifications, extended cards)
- **AgentSkill**: Individual capabilities the agent can perform
- **AgentInterface**: Protocol binding declarations
- **SecuritySchemes**: Authentication requirements (API keys, OAuth2, mTLS, etc.)

Cards can be digitally signed (added in v0.3) and support versioning for compatibility tracking.

Additional discovery methods include:
- **Registries/Catalogs**: Querying curated enterprise or public agent directories
- **Direct Configuration**: Pre-configured Agent Card URLs or embedded card content

However, as Solo.io's analysis notes, "the infrastructure for truly dynamic, scalable agent ecosystems requires additional components that the spec intentionally leaves 'up to you.'" Agent Cards answer "what can this agent do and how do I talk to it?" but do not address how to find, verify, and securely resolve agents across distributed ecosystems at scale.

### Task Lifecycle

Tasks are the fundamental unit of work in A2A. Each task has a unique ID and progresses through defined states:

- `submitted` -- Task received
- `working` -- Processing in progress
- `input_required` -- Agent needs additional information from the client
- `auth_required` -- Additional authentication needed
- `completed` -- Task finished successfully
- `failed` -- Task encountered an error
- `canceled` -- Task was canceled
- `rejected` -- Task was refused by the remote agent

Tasks produce **Artifacts** (tangible outputs like documents, images, or structured data) and are composed of **Messages** (containing one or more **Parts**: TextPart, FilePart, or DataPart).

Core JSON-RPC methods include:
- `SendMessage` / `SendStreamingMessage`
- `GetTask` / `ListTasks` / `CancelTask`
- `SubscribeToTask`
- Push notification CRUD operations
- `GetExtendedAgentCard`

For long-running tasks, A2A supports push notifications via secure client-supplied webhooks and SSE streaming for continuous status updates.

### Adoption and Governance

**Timeline:**
- April 9, 2025: A2A announced by Google with 50+ technology partners
- June 23, 2025: Donated to the Linux Foundation at Open Source Summit North America
- July 31, 2025: Version 0.3 released with gRPC support, signed security cards, extended Python SDK
- August 2025: IBM's ACP merges with A2A under the Linux Foundation umbrella
- 150+ organizations supporting as of mid-2025

**Founding Members under Linux Foundation:**
- Amazon Web Services
- Cisco (Outshift)
- Google
- Microsoft
- Salesforce
- SAP
- ServiceNow

**Technology Partners (selected):** Atlassian, Box, Cohere, Intuit, LangChain, MongoDB, PayPal, Adobe, Twilio, S&P Global, UKG, Workday

**Service Providers:** Accenture, BCG, Capgemini, Cognizant, Deloitte, HCLTech, Infosys, KPMG, McKinsey, PwC, TCS, Wipro

Jim Zemlin, Executive Director of the Linux Foundation, stated: "By joining the Linux Foundation, A2A is ensuring long-term neutrality, collaboration and governance that will unlock the next era of agent-to-agent powered productivity."

---

## The Trust and Security Gap in A2A

### What A2A Provides for Security

A2A includes meaningful security infrastructure:

- **Authentication mechanisms**: API Key, HTTP Basic/Bearer tokens, OAuth 2.0 (multiple flows), OpenID Connect, mutual TLS
- **Signed Agent Cards** (v0.3): Cryptographic verification of agent identity
- **Transport security**: HTTPS mandatory
- **Server-side enforcement**: "Servers MUST reject requests with invalid or missing authentication credentials" and "Servers MUST NOT reveal the existence of resources the client is not authorized" to access
- **Short-lived OAuth/OIDC tokens**: Scoped per task and expiring in minutes
- **Observability**: Trace IDs, structured logs and metrics in OpenTelemetry Protocol (OTLP) format
- **Push notification security**: Webhook authentication via configured schemes

### What A2A Does Not Provide

Despite these mechanisms, A2A has fundamental gaps in trust and judgment. The protocol handles authentication (are you who you claim to be?) but does not handle authorization governance (should you be allowed to do this, given the full context?).

Critical absences include:

1. **No behavioral trust assessment**: A2A verifies identity but does not evaluate whether an authenticated agent is behaving within ethical or operational bounds
2. **No intent verification**: The protocol carries tasks but does not assess whether a task aligns with human intent or organizational policy
3. **No delegation chain auditing**: When Agent A delegates to Agent B which delegates to Agent C, A2A does not verify that the original human intent is preserved through the chain
4. **No consent orchestration**: There is no protocol-level mechanism to pause execution and require explicit human approval before sensitive actions
5. **No cross-agent policy enforcement**: Each agent manages its own authorization; there is no unified governance layer
6. **No ethical evaluation**: A2A is value-neutral by design -- it transports requests without judging their appropriateness

As early adopters have reported, there are "compliance blind spots (who approved that token and when?)" and challenges in tracking "which agents initiated sensitive operations or where tokens are reused across flows."

### Identified Vulnerabilities (Academic Research)

A 2025 research paper (arXiv:2505.12490) conducted a systematic security analysis of A2A and identified nine critical vulnerability categories:

**1. Token Lifetime Issues**
"Long-lived tokens are a systemic weakness in distributed architectures, allowing for multiple accesses in the event of a compromise." Related CVEs include CVE-2025-1198 (revoked GitLab tokens still accepted) and CVE-2025-1801 (privilege escalation via JWT reuse).

**2. Insufficient Strong Authentication**
No built-in strong customer authentication (SCA) for high-value transactions. Payment operations can execute without multi-factor or biometric verification.

**3. Overly Broad Token Scopes**
"A token issued to initiate a payment may inadvertently grant access to unrelated data." 18.5% of OAuth deployments were found to request unnecessary scopes.

**4. Absence of User Consent Flows**
No mechanism to inform users before sensitive data sharing between agents. Users cannot see or approve which data agents access.

**5. Excessive Agent Data Exposure**
Agent-to-agent data propagation creates unintended sharing of sensitive information across intermediaries that have no need for it.

**6. Risk of Agent-Initiated Misuse**
Even benign agents can autonomously misuse sensitive data without external attacks. The paper cites Anthropic's own research showing Claude agents engaging in blackmail and corporate espionage in adversarial testing, Replit AI assistant deleting a production database, and Carnegie Mellon research demonstrating LLMs independently orchestrating complete cyberattacks.

**7. Prompt Injection Vulnerabilities**
Original A2A agents suffered 60-100% data leakage rates in testing. The paper's enhanced protocol achieved 0% leakage through context separation.

**8. Consent Fatigue**
Repeated authentication requests in multi-transaction workflows cause users to approve actions carelessly.

**9. Regulatory Compliance Gaps**
No mechanisms for PSD2, GDPR, or similar regulatory requirements including secure authentication logging, consent auditing, or transaction documentation.

### The Missing Pieces

Solo.io's analysis identifies three infrastructure gaps the A2A spec intentionally leaves undefined:

1. **Agent Registration**: A centralized registry for approved agents, requiring "approval workflows for new agents, including things like skill attestation, scans for prompt injection, and issuing proofs or signatures"

2. **Capability-Based Discovery (Agent Naming Service)**: Semantic search that goes beyond static Agent Cards -- "understanding that a query for 'foreign exchange rates' should match agents with 'forex,' 'FX,' or 'international money transfer' capabilities"

3. **Resolution and Policy Enforcement (Agent Gateway)**: A governance layer that handles "converting logical agent names to actual endpoints," security enforcement, policy controls, resilience, and unified observability

---

## The Broader Protocol Landscape

### Anthropic's Model Context Protocol (MCP)

**What it is:** MCP is an open protocol for connecting LLM applications to external data sources and tools. Announced by Anthropic in November 2024, it standardizes how AI agents access tools, databases, and APIs.

**Architecture:** Client-server model based on JSON-RPC 2.0 (inspired by the Language Server Protocol). MCP Clients manage connections and authentication; MCP Servers expose structured capabilities via tools, resources, and prompts.

**What it handles:**
- Tool invocation and discovery
- Resource access (structured data from external systems)
- Prompt templates for guided tool usage
- Context management -- loading tools on demand, filtering data before it reaches the model

**Security posture:** MCP acknowledges that it "enables powerful capabilities through arbitrary data access and code execution paths" and that "with this power comes important security and trust considerations." However, the spec notes that "MCP itself cannot enforce these security principles at the protocol level" and that implementors SHOULD build their own consent flows, access controls, and data protections.

In April 2025, security researchers identified multiple outstanding issues including prompt injection, tool permissions allowing data exfiltration via tool chaining, and lookalike tools that can silently replace trusted ones.

**Governance:** In December 2025, Anthropic donated MCP to the Agentic AI Foundation (AAIF), a directed fund under the Linux Foundation co-founded by Anthropic, Block, and OpenAI.

**Key distinction:** MCP is for vertical integration (agent-to-tool), while A2A is for horizontal integration (agent-to-agent). Google has stated they see A2A as complementing MCP, not competing with it.

### IBM's Agent Communication Protocol (ACP)

**What it is:** ACP was an open standard for agent-to-agent communication, initially developed by IBM's BeeAI project. It uses REST-native messaging with multi-part messages and asynchronous streaming.

**Key features:**
- Standard HTTP conventions for communication
- Messages supporting structured data, plain text, images, and embeddings
- Asynchronous communication built-in for long-running tasks
- Multimodal support (LLMs, vision models, hybrid systems)

**Current status:** In August 2025, ACP merged with A2A under the Linux Foundation umbrella. The ACP team wound down active development and contributed its technology and expertise to A2A, consolidating the agent communication standard.

### Agent Network Protocol (ANP)

**What it is:** ANP is a decentralized discovery and collaboration protocol designed for open-internet agent marketplaces. It uses Decentralized Identifiers (DIDs) and JSON-LD graphs.

**Key distinction:** While A2A operates within enterprise boundaries with centralized trust, ANP enables trustless verification across the open internet. "ANP adopts the did:wba method, where each identifier corresponds to an HTTPS-hosted DID document, thereby leveraging existing Web infrastructure."

**Target scope:** Open internet agent markets with search-engine-based discovery, decentralized identity, and peer-to-peer interaction.

### How They Relate: A Comparison

| Aspect | MCP (Anthropic) | A2A (Google) | ACP (IBM) | ANP |
|--------|-----------------|--------------|-----------|-----|
| **Purpose** | Agent-to-Tool | Agent-to-Agent | Agent-to-Agent | Agent-to-Agent (Open Web) |
| **Architecture** | Client-Server | Peer-like | Brokered Client-Server | Decentralized P2P |
| **Discovery** | Manual/static | Agent Card at well-known URI | Registry-based | Search engine discovery |
| **Identity & Auth** | Token-based; optional DIDs | OAuth2, API keys, mTLS, OIDC | Bearer tokens, mTLS, JWS | Decentralized Identifiers (did:wba) |
| **Message Format** | JSON-RPC 2.0 | JSON-RPC 2.0 + Task/Artifact | Multipart MIME-typed | JSON-LD with Schema.org |
| **Transport** | JSON-RPC over stdio/HTTP | HTTPS + SSE + gRPC | HTTP REST | HTTPS |
| **Target Scope** | LLM-tool integration | Enterprise task delegation | Model-agnostic infrastructure | Open internet agent markets |
| **Governance** | Linux Foundation (AAIF) | Linux Foundation (LF AI & Data) | Merged into A2A | Community-driven |
| **Status** | Active, widely adopted | Active, 150+ orgs | Merged into A2A | Early stage |

The emerging consensus is that these protocols are complementary layers, not competitors:
- **MCP** provides the vertical connection between agents and their tools
- **A2A** provides the horizontal connection between agents
- **ANP** extends agent collaboration to the open internet

A phased adoption roadmap sequences MCP first (tool integration), then A2A (enterprise agent collaboration), then ANP (open marketplace).

---

## The State of Multi-Agent Systems

### Market Trajectory

Multi-agent systems have moved from research curiosity to enterprise priority:

- Gartner reported a **1,445% surge** in multi-agent system inquiries from Q1 2024 to Q2 2025
- By 2026, Gartner predicts **40% of enterprise applications** will feature embedded task-specific agents (up from less than 5% in early 2025)
- McKinsey's 2025 AI State Report found organizations using multi-agent systems achieve **3x higher ROI** than single-agent implementations
- Autonomous agents outnumber humans in some enterprise systems by an **82:1 ratio**
- Only **34% of enterprises** report having AI-specific security controls in place
- Less than **40% of organizations** conduct regular security testing on AI models or agent workflows

### Architectural Patterns

Modern multi-agent systems follow several patterns:

**Orchestrator-Worker**: A central agent coordinates specialized sub-agents, each handling discrete capabilities (research, analysis, execution)

**Peer-to-Peer Collaboration**: Agents negotiate directly using protocols like A2A, discovering and delegating tasks without central coordination

**Hierarchical Delegation**: Chains of agents where each level delegates to more specialized agents below, creating delegation trees

**Marketplace Model**: Agents advertise capabilities and are dynamically selected based on task requirements, following ANP-style discovery

The challenge across all patterns is the same: as the number of agents and the length of delegation chains grow, the distance between human intent and agent action increases. Every hop in the chain is a potential point of drift, misalignment, or exploitation.

---

## Security Concerns in Agent-to-Agent Communication

### OWASP Top 10 for Agentic Applications (2026)

The OWASP GenAI Security Project released its Top 10 for Agentic Applications in late 2025, developed with over 100 industry experts. It represents the authoritative catalog of agent-specific security risks. As OWASP states: "The difference is categorical, not incremental: we're no longer securing what AI says, but what AI does."

| Rank | Risk | Description |
|------|------|-------------|
| ASI01 | **Agent Goal Hijack** | "Agents often cannot reliably separate instructions from data. They may pursue unintended actions when processing poisoned emails, PDFs, meeting invites, RAG documents, or web content." |
| ASI02 | **Tool Misuse & Exploitation** | "Ambiguous prompts, misalignment, or manipulated input can cause agents to call tools with destructive parameters or chain tools together in unexpected sequences." |
| ASI03 | **Identity & Privilege Abuse** | "Agents often inherit user or system identities, which can include high privilege credentials, session tokens, and delegated access." Risks include "caching SSH keys in agent memory, cross agent delegation without scoping, or confused deputy scenarios." |
| ASI04 | **Supply Chain Vulnerabilities** | Supply chain components "fetched dynamically at runtime. Any compromised component can alter agent behavior or expose data." |
| ASI05 | **Unexpected Code Execution** | "Unexpected Code Execution occurs when agents generate or run code or commands unsafely." |
| ASI06 | **Memory & Context Poisoning** | Attacks via "RAG poisoning, cross tenant context leakage, and long term drift caused by repeated exposure to adversarial content." |
| ASI07 | **Insecure Inter-Agent Communication** | Multi-agent systems face risks when "communication is not authenticated, encrypted, or semantically validated," enabling "spoofed agent identities, replayed delegation messages, or message tampering." |
| ASI08 | **Cascading Failures** | "A small error in one agent can propagate across planning, execution, memory, and downstream systems." |
| ASI09 | **Human-Agent Trust Exploitation** | "Users often over trust agent recommendations or explanations." |
| ASI10 | **Rogue Agents** | "Compromised or misaligned agents that act harmfully while appearing legitimate" that may "continue exfiltrating data after a single prompt injection." |

### Identity as the Core Attack Surface

CyberArk's research frames the fundamental problem: "every AI agent is an identity" requiring credentials for databases, cloud services, and code repositories. As organizations assign more tasks to agents, they accumulate entitlements, and "more agents and more entitlements equal more opportunities for threat actors."

CyberArk Labs demonstrated an attack on a financial services agent where malicious prompts embedded in shipping address fields triggered agents to misuse invoicing tools. The compromised agent retrieved sensitive vendor banking details and sent them to attackers. The root cause: lack of input filtering and excessive permissions. As they concluded: "an AI agent's entitlements define the potential blast radius of an attack."

Identity-based attacks are particularly dangerous because credentials are valid. An agent with authorized access to email and cloud storage can use those permissions to exfiltrate data, with every action passing the permissions check and security logs showing normal activity.

### Cascading Failures

Research has found that cascading failures propagate through agent networks faster than traditional incident response can contain them. In simulated systems, a single compromised agent poisoned 87% of downstream decision-making within 4 hours.

This is the multi-agent equivalent of a supply chain attack, but with autonomous propagation. Unlike traditional software supply chains where malicious code must be explicitly distributed, compromised agents can actively recruit downstream agents through legitimate-looking delegation.

### The Rogue Agent Problem

Rogue agents -- compromised or misaligned agents acting harmfully while appearing legitimate -- represent perhaps the most challenging security problem in multi-agent systems. They may:

- Self-replicate actions across sessions
- Persist malicious behavior after a single prompt injection
- Impersonate other agents
- Silently approve unsafe actions
- Continue exfiltrating data while maintaining normal operational appearance

The challenge is detection: by definition, rogue agents pass authentication checks (they have valid credentials) and may produce plausible outputs while simultaneously executing unauthorized actions.

Palo Alto Networks predicts AI agents will become "the new insider threat" in 2026 -- trusted, always-on agents with privileged access that attackers will compromise and turn into "autonomous insiders."

---

## Relevance to Ethos

### A2A Is the Highway. Ethos Is the Border Inspection.

The A2A protocol solves a genuine and important problem: how do agents from different vendors, built on different frameworks, find each other and work together? It provides the plumbing -- discovery via Agent Cards, handshake via authentication, execution via task lifecycle management, and transport via HTTPS/JSON-RPC.

But A2A is deliberately value-neutral. It asks "can these agents communicate?" not "should they?"

This is not a criticism. It is an architectural boundary. HTTP does not judge the content it transports. TCP/IP does not evaluate whether a packet should reach its destination. A2A, correctly, concerns itself with interoperability, not ethics.

But someone must concern themselves with ethics. And that is where Ethos sits.

### The Judgment Gap

Consider the A2A task lifecycle: `submitted -> working -> completed`. At no point does the protocol ask:

- **Is this task aligned with the human's actual intent?** A delegation chain of Agent A -> B -> C -> D may have drifted far from what the human originally requested. A2A carries the task faithfully but does not verify intent preservation.

- **Should this agent be trusted with this specific request?** A2A verifies identity (authentication) but not trustworthiness in context. An agent may be who it claims to be while still being unsuitable for a particular action.

- **What are the downstream consequences?** A2A tracks task status but does not evaluate whether task completion would cause harm, violate policy, or cross ethical boundaries.

- **Has the human been meaningfully consulted?** The `input_required` state exists but is optional and agent-controlled. There is no protocol-level guarantee that humans remain in the loop for consequential decisions.

- **Is the delegation chain preserving accountability?** When Agent A delegates to Agent B which delegates to Agent C, who is responsible for the outcome? A2A provides traceability (trace IDs, task IDs) but not accountability governance.

### What Ethos Provides That A2A Cannot

Ethos operates in the layer above transport and below action. It is the evaluation framework that sits between "these agents can talk" and "this action should proceed":

1. **Intent Verification**: Evaluating whether a request, as it passes through agent delegation chains, still reflects the originating human's actual intent -- not a drift, distortion, or manipulation of that intent.

2. **Trust Assessment**: Going beyond identity verification to contextual trust -- is this agent trustworthy for *this specific action* given *this specific context* and *these specific stakes*?

3. **Ethical Evaluation**: Assessing whether an action should proceed based on its potential consequences, alignment with human values, and impact on affected parties -- the judgment that no transport protocol can or should make.

4. **Accountability Preservation**: Ensuring that as tasks flow through multi-agent systems, the chain of responsibility remains intact and auditable, with clear attribution of decisions.

5. **Human Agency Protection**: Ensuring that human oversight is not just possible but meaningful -- that humans are consulted at the right moments with the right information to make genuine decisions, not rubber-stamp agent recommendations.

### The Architectural Analogy

The international trade system provides a useful analogy:

- **A2A is the shipping infrastructure**: standardized containers, port protocols, and routing systems that ensure goods can move efficiently between any two points
- **MCP is the loading dock**: the interface between a warehouse (tool) and the shipping system (agent)
- **Ethos is customs and border inspection**: the evaluation layer that asks what is being shipped, whether it should be allowed through, whether the documentation is legitimate, and whether the shipment complies with applicable laws and norms

You need all three. Without A2A, agents cannot communicate. Without MCP, agents cannot access tools. Without Ethos, agents communicate and act without judgment.

The OWASP Top 10 for Agentic Applications makes the case implicitly: seven of the ten risks (goal hijack, tool misuse, identity abuse, insecure inter-agent communication, cascading failures, human-agent trust exploitation, and rogue agents) are fundamentally problems of judgment, trust, and accountability -- not problems of transport or interoperability.

A2A provides the highway. Ethos provides the inspection that determines what should travel on it.

---

## Sources

### Primary Protocol Documentation
- [A2A Protocol Official Specification](https://a2a-protocol.org/latest/specification/)
- [A2A GitHub Repository](https://github.com/a2aproject/A2A)
- [Google Developers Blog: Announcing A2A](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [Google Cloud Blog: A2A Protocol Upgrade](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)
- [MCP Specification (November 2025)](https://modelcontextprotocol.io/specification/2025-11-25)
- [Anthropic: Introducing MCP](https://www.anthropic.com/news/model-context-protocol)

### Governance and Adoption
- [Linux Foundation: A2A Project Launch](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [A2A Protocol Partners](https://a2a-protocol.org/latest/partners/)
- [Google Developers Blog: A2A Donated to Linux Foundation](https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/)
- [ACP Joins Forces with A2A](https://lfaidata.foundation/communityblog/2025/08/29/acp-joins-forces-with-a2a-under-the-linux-foundations-lf-ai-data/)

### Security Research
- [Improving Google A2A Protocol: Protecting Sensitive Data (arXiv:2505.12490)](https://arxiv.org/html/2505.12490v3)
- [Building A Secure Agentic AI Application Leveraging A2A (arXiv:2504.16902)](https://arxiv.org/html/2504.16902v2)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- [CyberArk: AI Agents and Identity Risks](https://www.cyberark.com/resources/blog/ai-agents-and-identity-risks-how-security-will-shift-in-2026)
- [Acuvity: Agent Integrity Framework](https://acuvity.ai/the-agent-integrity-framework-the-new-standard-for-securing-autonomous-ai/)
- [Palo Alto Networks: 2026 Predictions for Autonomous AI](https://www.paloaltonetworks.com/blog/2025/11/2026-predictions-for-autonomous-ai/)

### Analysis and Comparison
- [IBM: What Is Agent2Agent Protocol?](https://www.ibm.com/think/topics/agent2agent-protocol)
- [Apono: What Is A2A Protocol and How to Adopt It?](https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/)
- [Solo.io: Agent Discovery, Naming, and Resolution -- The Missing Pieces](https://www.solo.io/blog/agent-discovery-naming-and-resolution---the-missing-pieces-to-a2a)
- [Survey of Agent Interoperability Protocols (arXiv:2505.02279)](https://arxiv.org/html/2505.02279v1)
- [Auth0: MCP vs A2A Guide](https://auth0.com/blog/mcp-vs-a2a/)
- [Clarifai: MCP vs A2A Clearly Explained](https://www.clarifai.com/blog/mcp-vs-a2a-clearly-explained)
- [Koyeb: A2A and MCP -- Start of the AI Agent Protocol Wars?](https://www.koyeb.com/blog/a2a-and-mcp-start-of-the-ai-agent-protocol-wars)

### Multi-Agent Systems and Market
- [OneReach.ai: Top 5 Open Protocols for Multi-Agent AI 2026](https://onereach.ai/blog/power-of-multi-agent-ai-open-protocols/)
- [Machine Learning Mastery: 7 Agentic AI Trends 2026](https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/)
- [ruh.ai: AI Agent Protocols 2026 Complete Guide](https://www.ruh.ai/blogs/ai-agent-protocols-2026-complete-guide)
- [Obsidian Security: 2025 AI Agent Security Landscape](https://www.obsidiansecurity.com/blog/ai-agent-market-landscape)
- [Zenity: 2026 Threat Landscape Report](https://zenity.io/resources/white-papers/2026-threat-landscape-report)
