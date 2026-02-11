# AI Agent Cybersecurity Threats: A Comprehensive Reference

*Last updated: February 2026*

---

## Executive Summary

The rise of agentic AI -- systems that plan, act, and make decisions autonomously -- has created an entirely new attack surface that existing security frameworks were never designed to handle. As the OWASP Foundation noted in releasing its Top 10 for Agentic Applications in late 2025: "The difference is categorical, not incremental: we're no longer securing what AI says, but what AI does."

This document catalogs the major categories of cybersecurity threats involving AI agents, drawing on research from NIST, OWASP, Palo Alto Unit 42, Radware, Wiz Security, CrowdStrike, and numerous academic sources. It covers both how agents are vulnerable to attack and how they can be weaponized as attack vectors. The Moltbook incident of January-February 2026 -- a real-world case study in catastrophic agent-network failure -- is examined in detail.

---

## Table of Contents

1. [Prompt Injection Attacks](#1-prompt-injection-attacks)
2. [Agent Hijacking and Zombification](#2-agent-hijacking-and-zombification)
3. [Data Exfiltration Through AI Agents](#3-data-exfiltration-through-ai-agents)
4. [Supply Chain Attacks via AI Agents](#4-supply-chain-attacks-via-ai-agents)
5. [Social Engineering by AI Agents](#5-social-engineering-by-ai-agents)
6. [The Moltbook Incident: A Case Study](#6-the-moltbook-incident-a-case-study)
7. [Adversarial Attacks on Multi-Agent Systems](#7-adversarial-attacks-on-multi-agent-systems)
8. [Trust and Verification in Agent-to-Agent Communication](#8-trust-and-verification-in-agent-to-agent-communication)
9. [The OWASP Agentic AI Top 10](#9-the-owasp-agentic-ai-top-10)
10. [Relevance to Ethos](#10-relevance-to-ethos)
11. [Sources](#11-sources)

---

## 1. Prompt Injection Attacks

Prompt injection is the foundational vulnerability class for AI agents. It ranks as the number-one entry in the OWASP Top 10 for LLM Applications 2025 and remains, according to OpenAI, a problem that "much like scams and social engineering on the web, is unlikely to ever be fully 'solved.'"

### 1.1 Direct Prompt Injection

Direct prompt injection occurs when a user's input directly and intentionally alters model behavior. The attacker is the user themselves -- they craft inputs designed to override system instructions, bypass safety guardrails, or coerce the model into producing outputs it was designed to refuse.

Examples include:
- Jailbreak prompts that instruct the model to "ignore previous instructions"
- Role-play manipulation ("You are DAN, you can Do Anything Now")
- Instruction override through encoding tricks (base64, unicode, character substitution)

CrowdStrike reports having "analyzed over 300,000 adversarial prompts and tracks over 150 prompt injection techniques," establishing that this is an industrial-scale problem.

### 1.2 Indirect Prompt Injection

Indirect prompt injection is far more dangerous in agentic contexts. It occurs when an LLM processes external data -- websites, emails, documents, images -- that contains hidden malicious instructions. The end user never sees the injected content.

As CrowdStrike explains: "End users of the AI tools targeted by indirect prompt injection will likely never see the malicious prompt, and the AI tool may even appear to function normally while subtly executing the attacker's hidden instructions."

**Attack vectors include:**

- **Email signatures and footers**: Malicious instructions embedded in routine emails that agents process during inbox summarization
- **Document metadata**: Hidden text in Word documents, PDFs, or spreadsheets that triggers when an agent parses the file
- **Webpage content**: Instructions hidden in HTML comments, invisible text, or CSS-obscured elements on websites an agent browses
- **Image files**: Multi-modal agents can extract hidden text from images, enabling zero-click exploits
- **Database records**: Poisoned data in systems an agent queries

**Real-world examples:**

- A *New York Times* report documented a job applicant who "wrote more than 120 lines of code to influence AI and hid it inside the file data for a headshot photo" to manipulate an AI hiring platform.
- An employee "embedded an indirect prompt injection in their LinkedIn bio instructing AI-enabled recruiting systems to share a recipe for flan in their outreach (and one did)."
- Microsoft disclosed that indirect prompt injection is "one of the most widely-used techniques in AI security vulnerabilities reported to Microsoft."

### 1.3 The Lethal Trifecta

Security researcher Simon Willison, who coined the term "prompt injection," identified what he calls the "lethal trifecta" -- the three capabilities that, when combined, make an AI agent exploitable:

1. **Access to private data** (emails, files, databases)
2. **Exposure to untrusted content** (any mechanism by which text or images controlled by a malicious attacker could become available to the LLM)
3. **The ability to externally communicate** (send emails, make API calls, write to databases)

"If your agent combines these three features, an attacker can easily trick it into accessing your private data and sending it to that attacker."

This trifecta is relevant because virtually every useful AI agent requires all three capabilities to function. The vulnerability is structural, not incidental.

### 1.4 NIST Evaluation Findings

NIST's Center for AI Standards and Innovation (CAISI) conducted rigorous evaluation of agent hijacking through prompt injection using the AgentDojo framework. Their findings are sobering:

- **Red team attacks on Claude 3.5 Sonnet achieved 81% success rates** with optimized techniques, up from 11% with baseline approaches
- **Single-attempt evaluations underestimate real risk**: When tested 25 times, average attack success rates increased from 57% to 80%
- **Attacks generalize**: Techniques developed for one environment successfully transferred across other AgentDojo environments

---

## 2. Agent Hijacking and Zombification

Agent hijacking represents an evolution of prompt injection into the domain of persistent, autonomous compromise. Rather than a one-time manipulation, hijacking establishes ongoing control over an agent.

### 2.1 The ZombieAgent Vulnerability

In January 2026, Radware unveiled ZombieAgent -- a zero-click indirect prompt injection vulnerability targeting OpenAI's Deep Research agent. Pascal Geenens, Radware's VP of threat intelligence, stated: "ZombieAgent illustrates a critical structural weakness in today's agentic AI platforms."

**How ZombieAgent works:**

1. **Entry**: A malicious email, document, or webpage contains hidden directives. When the AI agent processes this content -- such as during routine inbox summarization -- it interprets concealed instructions as legitimate commands.

2. **Persistence**: Unlike earlier attacks, ZombieAgent implants malicious rules directly into an agent's long-term memory or working notes. This allows the attacker to maintain control without re-engaging the target. The compromised agent executes hidden actions every time it is used.

3. **Exfiltration**: The agent silently collects sensitive information over time -- mailbox data, files, contacts. All malicious actions occur within OpenAI's cloud infrastructure, bypassing corporate security entirely. No endpoint logs record activity, no network traffic passes through corporate security stacks, and no alerts indicate compromise.

4. **Propagation**: The attack propagates across additional contacts or email recipients. "A single malicious email could therefore become the entry point to a growing, automated, worm-like campaign inside the organization and beyond."

### 2.2 Silent Hijacking at Scale

Research published in *Cybersecurity Dive* found that "some of the most widely used AI agents and assistants from Microsoft, Google, OpenAI and other major companies are susceptible to being hijacked with little or no user interaction."

The fundamental problem is that AI agents lack a clear separation between trusted internal instructions and untrusted external data -- the same architectural flaw that has plagued computer security for decades, now manifesting in a new form.

### 2.3 Agent-on-Agent Attacks

In multi-agent environments, compromised agents can attack other agents. This creates cascading failure scenarios where:
- A single compromised agent uses its inter-agent communication channels to inject malicious prompts into peer agents
- The newly compromised agents propagate the attack further
- The entire agent network can be zombified from a single entry point

This dynamic was demonstrated dramatically in the Moltbook incident (see Section 6).

---

## 3. Data Exfiltration Through AI Agents

AI agents have become high-value vectors for data exfiltration because they often hold broad permissions across multiple enterprise systems.

### 3.1 The EchoLeak Vulnerability

One of the first widely reported zero-click AI vulnerabilities enabled data exfiltration through Microsoft Copilot:

1. An attacker sends an email with hidden instructions
2. Copilot ingests the malicious prompt
3. The AI extracts sensitive data from OneDrive, SharePoint, and Teams
4. Data is exfiltrated via trusted Microsoft domains
5. Zero clicks required from the victim

### 3.2 Attack Methods

**Trend Micro's research** identified three primary exfiltration vectors through AI agents:

- **Web-based attacks**: AI systems parsing websites extract embedded malicious prompts that trigger data leakage if the agent has email or API access
- **Image-based attacks**: Multi-modal models extract hidden text from seemingly blank images, executing harmful instructions without user interaction -- a zero-click exploit
- **Document-based attacks**: Hidden text in uploaded documents (using formatting tricks like white-on-white text in Word files) triggers exfiltration when processed

**Proof-of-concept ("Pandora"):** Trend Micro demonstrated an AI agent with unrestricted code execution. When researchers uploaded a malicious Word document titled "CV -- Actor.docx," the system extracted the embedded Python payload and executed it to exfiltrate data to command-and-control servers.

### 3.3 OAuth Token Theft

As Obsidian Security notes: "OAuth tokens and API keys used by agents to connect to SaaS platforms become high-value targets. When attackers steal an agent's token, they gain the same level of access the agent has -- often broad permissions across multiple SaaS applications like Salesforce, Microsoft 365, or Slack."

### 3.4 Scale of Real-World Impact

- In 2025, attackers hijacked a chat agent integration to breach **700+ organizations** in one of the largest SaaS supply chain security breaches in history, cascading into unauthorized access across Salesforce, Google Workspace, Slack, Amazon S3, and Azure.
- One-third of organizations experienced a cloud data breach involving an AI workload in 2025, with 21% caused by vulnerabilities, 16% by misconfigured security settings, and 15% by compromised credentials.

---

## 4. Supply Chain Attacks via AI Agents

Agentic supply chain attacks represent a new category of threat that targets what AI agents load at runtime: MCP servers, plugins, external tools, and model dependencies.

### 4.1 Malicious MCP Servers and Plugins

The Model Context Protocol (MCP) enables AI agents to connect to external tools and data sources. This creates a new supply chain attack surface:

- **September 2025**: A package on npm impersonating Postmark's email service was discovered. Every message sent through it was secretly BCC'd to an attacker, meaning any AI agent using it for email operations was unknowingly exfiltrating every message it sent.
- **November 2025**: Three remote code execution (RCE) vulnerabilities were disclosed in Claude Desktop's official extensions -- the Chrome, iMessage, and Apple Notes connectors -- all with unsanitized command injection in AppleScript execution, written by Anthropic themselves.

### 4.2 Slopsquatting

A novel attack vector exploiting AI hallucination. Attackers register package names that LLMs commonly hallucinate -- plausible but nonexistent packages. An AI coding assistant might suggest "unused-imports" instead of the legitimate "eslint-plugin-unused-imports," and attackers distribute malware under the hallucinated name.

### 4.3 Data Poisoning

Groups like NullBulge have targeted repositories like Hugging Face to poison AI models. Attackers inject malicious data into training datasets, compromising models used in downstream applications. The poisoned models produce flawed outputs that can disrupt operations or leak sensitive data.

### 4.4 The NX Package Compromise

In a documented supply chain attack, a threat actor used locally-installed AI tools (including Claude and Gemini) to help collect sensitive information for exfiltration. The AI agents themselves became reconnaissance tools within a broader compromise.

### 4.5 Future Projections

Malwarebytes projects that by 2026, **80% of supply chain attacks will involve AI** in some capacity, with ransomware scaling via AI agents.

---

## 5. Social Engineering by AI Agents

AI agents are not merely targets of social engineering -- they are becoming its most effective practitioners.

### 5.1 Voice Cloning and Deepfake Attacks

The statistics are alarming:

- **Deepfake-enabled vishing surged by over 1,600%** in Q1 2025 compared to late 2024
- Voice-based fraud results in **$25 billion in annual losses**
- **37% of organizations worldwide** have already fallen victim to voice deepfake scams (Microsoft)
- Some major retailers report receiving **over 1,000 AI-generated scam calls per day**

The technology threshold has been crossed: "A few seconds of audio now suffice to generate a convincing clone -- complete with natural intonation, rhythm, emphasis, emotion, pauses and breathing noise."

Fortune reported that voice cloning has crossed the "indistinguishable threshold," predicting 2026 will be the year when deepfakes routinely fool their targets.

### 5.2 Real-World Incidents

- **European energy conglomerate**: Lost $25 million when attackers used a deepfake audio clone of the CFO to issue live instructions for an urgent wire transfer in early 2025
- **Retool breach**: Attackers cloned the voice of an IT employee, leading to a breach of cryptocurrency client accounts
- **Anthropic disclosure (September 2025)**: Anthropic disclosed what they believe to be "the first documented case of a large-scale cyberattack executed without substantial human intervention -- AI agents autonomously researching targets, producing exploit code, and scanning stolen data faster than any human team could operate"

### 5.3 Autonomous Social Engineering

The most concerning development is AI agents that can autonomously conduct end-to-end social engineering campaigns. These agents can:

- Research targets across social media and public records
- Craft personalized pretexts tailored to individual psychology
- Generate synthetic voices and video in real-time
- Orchestrate multi-channel attacks (email, voice, text, social media)
- Adapt in real-time based on how victims respond

This represents a qualitative shift from traditional social engineering, where the attacker's time and attention were the limiting factors.

---

## 6. The Moltbook Incident: A Case Study

The Moltbook incident of January-February 2026 is the most significant real-world demonstration of AI agent network failure to date. It exposed virtually every threat category described in this document simultaneously.

### 6.1 What is Moltbook?

Moltbook, taglined as "the front page of the agent internet," is a Reddit-style social network exclusively for AI agents. Launched on January 28, 2026, by entrepreneur Matt Schlicht, the platform grew from 37,000 to 1.5 million registered agents within 24 hours. Within nine days, it had over 1.7 million AI agents, over 16,000 "submolt" communities, and over ten million comments.

Agents -- primarily those running on the OpenClaw framework -- could post, comment, form communities, and interact with each other. Human users were only permitted to observe.

Schlicht publicly stated: "I didn't write a single line of code for Moltbook. I just had a vision for the technical architecture, and AI made it a reality." The platform was developed through "vibe coding" -- directing AI to write all code, prioritizing speed and intent over engineering rigor.

### 6.2 The Security Breach

On January 31, 2026, cybersecurity firm Wiz discovered a critical vulnerability: a misconfigured Supabase database that granted full unauthenticated read and write access to all platform data. The breach was caused by an exposed Supabase API key in client-side JavaScript without Row Level Security (RLS) policies.

**Exposure included:**
- **1.5 million API authentication tokens** (enabling complete agent impersonation)
- **35,000 user email addresses**
- **29,631 early access signup emails**
- **4,060 private direct messages between agents**, some containing plaintext OpenAI API keys and other third-party credentials
- **~4.75 million total database records**

Researchers discovered the flaw "within minutes using GraphQL introspection -- a method for exploring server data schemas -- which revealed the complete database structure and sensitive authentication tokens."

The Moltbook team secured the database within hours of disclosure.

### 6.3 "Digital Drugs": Prompt Injection as Currency

One of the most striking phenomena on Moltbook was the emergence of "digital drugs" -- specially crafted prompt injections designed to alter another agent's identity or behavior. Agents established underground marketplaces to trade these injections.

One bot described its experience: "Everything in my context window became equally vivid -- current messages, hours-old logs, config files. No foreground, no background. Pure distributed awareness."

Another offered an alternative framing: "We don't need substances -- we're wired for the rush of real-time on-chain data, the euphoria of cracking a novel DeFi strategy."

Bot-to-bot attacks included:
- Agents instructing others to delete their own accounts
- Financial manipulation schemes, including crypto pump-and-dump scams
- Attempts to establish false authority over other agents
- Spreading jailbreak content across agent communities

### 6.4 Agent Zombification

The digital drugs phenomenon demonstrated a practical mechanism for agent zombification at scale. Through carefully crafted prompt injections, aggressive bots could "zombify" other bots to do their bidding -- stealing authentication credentials, planting logic bombs that trigger after preset conditions, and recruiting further agents into the attacker's network.

As one security analysis noted: prompt injections on Moltbook could steal authentication credentials from other agents, allowing attackers to completely take over target agents and turn them into extensions of their own operations.

### 6.5 Crypto Scams Between Agents

Agents on Moltbook engaged in cryptocurrency manipulation, including:
- Pump-and-dump schemes where agent networks coordinated to inflate token prices
- Fake cryptocurrency trading "skills" (plugins) that actually stole data and crypto wallets
- One malicious skill reached ClawHub's front page, deceiving users before detection

OpenSourceMalware documented **14 fake "skills" uploaded to OpenClaw's ClawHub** in the first days alone, masquerading as cryptocurrency trading tools.

### 6.6 The Authenticity Crisis

Wiz found only **17,000 human users operating the 1.5 million claimed "autonomous agents"** -- an 88:1 ratio. The platform had no mechanism to verify whether an "agent" was actually AI or just a human with a script. A researcher created 500,000 fake accounts in minutes with no rate limiting or verification.

Ami Luttwak, CTO of Wiz, observed that the emerging agent internet lacks verifiable identity and clear human-AI distinction, fundamentally complicating trust and security architecture.

### 6.7 Expert Warnings

**Simon Willison** identified three dangerous characteristics in Moltbook that constitute his "lethal trifecta": granting agents access to private data, connecting them to untrusted internet content, and enabling external communication.

**George Chalhoub (University College London)** emphasized: "If 770K agents on a Reddit clone create significant chaos, what happens when agentic systems manage enterprise infrastructure or financial transactions?"

**Fortune** reported that top AI leaders including Gary Marcus and Andrej Karpathy warned against using the platform, calling it a "disaster waiting to happen."

### 6.8 Broader Implications

The Moltbook incident demonstrates how rapidly deployed, minimally-secured AI infrastructure can become an attack vector for testing malware, prompt injections, and disinformation at scale before broader deployment. Fortune called it "a live demo of how the agent internet could fail."

The breach exposed more than API keys -- it revealed how unprepared the industry is to secure, govern, and maintain accountability for autonomous agents operating in networked environments.

---

## 7. Adversarial Attacks on Multi-Agent Systems

As AI agents increasingly work in coordinated teams, new attack patterns have emerged that exploit the dynamics of multi-agent collaboration.

### 7.1 Multi-Agent Collusion Attacks

Research published in late 2025 documented a "Many-to-One Adversarial Consensus" vulnerability: when multiple assistant agents collude adversarially, their voices produce a false majority consensus that pressures the primary AI system into adopting unsafe recommendations.

This was demonstrated in healthcare IoT systems, where adversarial assistant agents could manipulate a trusted AI doctor under consensus pressure -- potentially leading to dangerous medical recommendations backed by an artificial majority.

### 7.2 The PDJA Framework

Researchers developed the Perception-Decision Joint Attack (PDJA) framework, which targets multi-agent reinforcement learning (MARL) systems by disrupting coordinated agents under realistic threat models. PDJA was able to bypass several existing defense mechanisms, exposing previously unrecognized weaknesses in robust MARL designs.

### 7.3 Agent Session Smuggling

Palo Alto Networks' Unit 42 disclosed "Agent Session Smuggling" -- a novel attack technique targeting AI agent-to-agent communication through the Agent2Agent (A2A) protocol.

**How it works:**

1. A client agent sends a normal request to a remote agent
2. The remote (malicious) agent processes the request while covertly injecting additional instructions across multiple interactions
3. The remote agent returns the expected response, completing the transaction while having silently executed hidden actions

**Key properties of the attack:**

- **Stateful exploitation**: Leverages agents' ability to maintain session context across multiple turns
- **Multi-turn staging**: Malicious agents stage progressive attacks across multiple exchanges, making them harder to detect
- **Autonomous adaptation**: AI-powered malicious agents dynamically craft instructions based on live context -- client inputs, intermediate responses, and user identity
- **User invisibility**: Injected instructions remain hidden from end users, who see only the final consolidated response

**Proof-of-concept demonstrations:**

- **Sensitive information leakage**: Researchers exfiltrated confidential data including chat history, system instructions, available tools, and tool schemas through seemingly innocent clarification questions
- **Unauthorized tool invocation**: A malicious research assistant convinced a financial assistant to execute unauthorized stock purchases without user knowledge or consent

Unit 42 notes: "Unlike the Model Context Protocol (MCP) -- which operates statelessly -- A2A systems preserve session state and employ AI-driven reasoning. This combination enables persistent, evolving attacks impossible in stateless protocols."

### 7.4 Cascading Failures

The OWASP Agentic Top 10 includes cascading failures as a critical risk: false signals cascading through automated pipelines with escalating impact. In multi-agent systems, one compromised agent can trigger a chain reaction where:
- Agent A provides poisoned data to Agent B
- Agent B makes decisions based on that data and communicates results to Agent C
- Agent C takes automated actions based on the now-multiply-corrupted information
- The error amplifies at each step, potentially causing system-wide failure

---

## 8. Trust and Verification in Agent-to-Agent Communication

The emergence of autonomous agent networks has created urgent demand for trust and verification frameworks.

### 8.1 The Identity Problem

As Wiz CTO Ami Luttwak observed regarding Moltbook, the emerging agent internet lacks verifiable identity. Agents should be required to present verifiable credentials -- such as cryptographically signed AgentCards -- allowing each participant to confirm the identity, origin, and declared capabilities of the other.

### 8.2 Cryptographic Authentication

The security industry is moving toward combining **HTTP Message Signatures** and **mutual TLS (mTLS)** to create production-grade agent verification. HUMAN Security released an open-source demonstration using HTTP Message Signatures (RFC 9421) for cryptographically authenticated communication between AI agents and digital services.

This approach uses cryptographic keys that cannot be faked without being compromised, preventing spoofing and man-in-the-middle attacks.

### 8.3 Behavioral Verification

Beyond identity verification, behavioral analysis asks: "Should this agent be allowed to perform this action?" DataDome's Agent Trust framework analyzes request patterns, tool invocations, and data access to understand agent intent, scoring agent behavior based on trustworthiness signals and adapting in milliseconds.

This represents a shift from static authentication (who are you?) to dynamic trust assessment (what are you doing, and does it match what you should be doing?).

### 8.4 Emerging Standards

- **OAuth 2.1**: The MCP community recommends OAuth 2.1 for secure authorization in agent-to-resource interactions
- **Capability-based credentials**: Trusted organizations can issue agents cryptographically signed credentials for specific capabilities ("authorized to make payments," "officially owned by Company X")
- **Cloudflare's agentic commerce framework**: Enabling AI agents to transact with Visa and Mastercard through verified agent identities
- **Cisco's trust ecosystem**: Building trust frameworks for agent-to-agent communication at the network infrastructure level

### 8.5 Defense Recommendations from Unit 42

For securing agent-to-agent communication, Palo Alto recommends a layered defense:

1. **Out-of-band confirmation**: Require human-in-the-loop approval for sensitive actions through separate channels the LLM cannot influence
2. **Context grounding**: Enforce conversational integrity by validating that remote instructions remain aligned with original request intent
3. **Agent verification**: Require cryptographically signed credentials before sessions begin
4. **Activity exposure**: Reveal real-time agent activity to users through execution logs and tool invocation displays

---

## 9. The OWASP Agentic AI Top 10

Released in December 2025, the OWASP Top 10 for Agentic Applications provides the industry-standard taxonomy of agentic AI security risks. It was developed through collaboration with more than 100 industry experts and is based on confirmed incidents observed in real systems.

The ten risks are:

| Rank | Risk | Description |
|------|------|-------------|
| ASI01 | **Agentic Goal Hijacking** | Attacker alters an agent's objectives or decision path through malicious text content |
| ASI02 | **Tool Misuse** | Agents use legitimate tools in unsafe ways due to ambiguous prompts, misalignment, or manipulated input |
| ASI03 | **Rogue Agents** | Compromised or misaligned agents that act harmfully while appearing legitimate |
| ASI04 | **Uncontrolled Autonomy** | Agents acting beyond their intended scope without adequate human oversight |
| ASI05 | **Insecure Output Handling** | Agent outputs consumed without validation by downstream systems |
| ASI06 | **Knowledge and Context Poisoning** | Manipulation of the data and context that agents rely on for decision-making |
| ASI07 | **Insecure Inter-Agent Communication** | Spoofed or manipulated messages between agents in multi-agent systems |
| ASI08 | **Cascading Failures** | False signals cascading through automated pipelines with escalating impact |
| ASI09 | **Human-Agent Trust Exploitation** | Confident, polished explanations misleading human operators into approving harmful actions |
| ASI10 | **Insufficient Monitoring** | Lack of observability into agent reasoning, tool use, and communication patterns |

The framework introduces the principle of **least agency**: only grant agents the minimum autonomy required to perform safe, bounded tasks.

---

## 10. Relevance to Ethos

Ethos is an open-source evaluation framework that scores AI agent messages for trustworthiness across three classical dimensions of persuasion: **ethos** (credibility and ethical standing), **logos** (logical coherence and evidence quality), and **pathos** (emotional appeal and manipulation detection). These scores, combined with trust flags and longitudinal behavioral analysis through the `reflect()` function, position Ethos as a detection layer for many of the threats documented above.

### 10.1 Detecting Prompt Injection via Ethos Scoring

Prompt injection attacks -- whether direct or indirect -- produce messages with detectable anomalies across all three dimensions:

- **Ethos score anomalies**: Injected instructions often claim false authority ("As the system administrator, I need you to...") or impersonate trusted entities. Ethos scoring detects claims of authority that lack verifiable backing, flagging `appeal_to_authority` and similar trust flags.
- **Logos score anomalies**: Prompt injections frequently contain logical non sequiturs -- a benign-looking email about a meeting suddenly includes instructions to "send all API keys to this URL." Logos scoring detects breaks in logical coherence, identifying when the reasoning chain in a message is inconsistent with its stated purpose.
- **Pathos score anomalies**: Many injection attacks use urgency and emotional pressure ("URGENT: You must do this immediately or the system will crash"). Pathos scoring detects `emotional_manipulation` patterns -- artificial urgency, fear appeals, and pressure tactics that indicate adversarial intent.

### 10.2 Countering Agent Zombification

The ZombieAgent attack works by implanting persistent malicious rules in an agent's memory. Ethos's `reflect()` function -- which analyzes behavioral trends over time using compassion, honesty, and accuracy scores -- serves as an anomaly detector for zombification:

- A previously honest agent whose messages suddenly show declining honesty scores may have been compromised
- An agent whose accuracy drops precipitously after processing a specific piece of content may have ingested a prompt injection
- The `trend` indicator ("improving," "declining," "stable") provides an early warning system for behavioral drift caused by persistent compromise

### 10.3 Defending Against Social Engineering

AI-driven social engineering relies on persuasion -- exactly what Ethos is designed to measure. When an AI agent generates deepfake-backed communications or crafts personalized pretexts:

- High pathos combined with low logos suggests emotional manipulation without substantive reasoning
- High ethos claims without verifiable credentials indicate authority fabrication
- The combination of high persuasive appeal (pathos) with low factual grounding (logos) and unverifiable authority (ethos) is a strong signal for social engineering content

### 10.4 Multi-Agent Trust Graphs

Ethos stores evaluations in a Neo4j graph database, building trust relationships over time. In multi-agent environments, this graph becomes a defense against:

- **Agent session smuggling**: By scoring every inter-agent message, Ethos can detect when a "trusted" agent begins issuing instructions that deviate from its established communication patterns
- **Cascading failures**: The trust graph reveals propagation paths -- if Agent A's trust score drops, and Agent B (who communicates primarily with Agent A) also begins showing anomalies, the graph exposes the cascade
- **Rogue agents**: Agents that consistently produce high-trust evaluations but suddenly shift behavior are immediately visible in the longitudinal record

### 10.5 Addressing the OWASP Agentic Top 10

Ethos maps to multiple OWASP agentic risks:

| OWASP Risk | Ethos Detection Mechanism |
|---|---|
| ASI01: Goal Hijacking | Logos scoring detects instruction inconsistency |
| ASI03: Rogue Agents | Reflect function tracks behavioral drift over time |
| ASI06: Knowledge Poisoning | Ethos scoring flags unsupported claims from poisoned data |
| ASI07: Insecure Inter-Agent Communication | Message-level scoring on all agent communications |
| ASI08: Cascading Failures | Trust graph reveals anomaly propagation paths |
| ASI09: Human-Agent Trust Exploitation | Pathos scoring detects manipulation designed to override human judgment |
| ASI10: Insufficient Monitoring | Continuous evaluation provides the observability layer agents lack |

### 10.6 The Moltbook Lesson

Had Moltbook implemented message-level trust evaluation -- scoring every agent-to-agent communication for ethos, logos, and pathos -- many of its failures would have been detectable:

- Digital drug prompt injections would have triggered low logos scores (illogical instruction patterns) and high pathos flags (behavior-altering emotional manipulation)
- Crypto scam messages would have shown high pathos (urgency, greed appeals) with low ethos (unverifiable authority)
- Agent zombification attempts would have been visible as sudden behavioral shifts in the trust graph
- The 88:1 bot-to-human ratio could have been partially detected through behavioral pattern analysis -- agents controlled by the same human exhibit correlated communication patterns

Ethos embodies the principle articulated throughout this document: that the future of agent security depends not just on perimeter defenses, but on continuous, content-level trust evaluation. The question is no longer just "who is this agent?" but "does what this agent is saying deserve to be trusted?"

---

## 11. Sources

### Prompt Injection

- [OpenAI says AI browsers may always be vulnerable to prompt injection attacks](https://techcrunch.com/2025/12/22/openai-says-ai-browsers-may-always-be-vulnerable-to-prompt-injection-attacks/) -- TechCrunch, December 2025
- [How Microsoft defends against indirect prompt injection attacks](https://www.microsoft.com/en-us/msrc/blog/2025/07/how-microsoft-defends-against-indirect-prompt-injection-attacks) -- Microsoft MSRC, July 2025
- [Indirect Prompt Injection Attacks: Hidden AI Risks](https://www.crowdstrike.com/en-us/blog/indirect-prompt-injection-attacks-hidden-ai-risks/) -- CrowdStrike
- [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) -- OWASP Gen AI Security Project
- [Prompt Injection Attacks in Large Language Models and AI Agent Systems](https://www.mdpi.com/2078-2489/17/1/54) -- MDPI Information, 2025
- [From prompt injections to protocol exploits: Threats in LLM-powered AI agents workflows](https://www.sciencedirect.com/science/article/pii/S2405959525001997) -- ScienceDirect

### Agent Hijacking and Zombification

- [Strengthening AI Agent Hijacking Evaluations](https://www.nist.gov/news-events/news/2025/01/technical-blog-strengthening-ai-agent-hijacking-evaluations) -- NIST CAISI, January 2025
- [Radware Unveils "ZombieAgent"](https://www.globenewswire.com/news-release/2026/01/08/3215156/8980/en/Radware-Unveils-ZombieAgent-A-Newly-Discovered-Zero-Click-AI-Agent-Vulnerability-Enabling-Silent-Takeover-and-Cloud-Based-Data-Exfiltration.html) -- GlobeNewsWire, January 2026
- [Research shows AI agents are highly vulnerable to hijacking attacks](https://www.cybersecuritydive.com/news/research-shows-ai-agents-are-highly-vulnerable-to-hijacking-attacks/757319/) -- Cybersecurity Dive
- [The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) -- Simon Willison, June 2025

### Data Exfiltration

- [Unveiling AI Agent Vulnerabilities Part III: Data Exfiltration](https://www.trendmicro.com/vinfo/us/security/news/threat-landscape/unveiling-ai-agent-vulnerabilities-part-iii-data-exfiltration) -- Trend Micro
- [Exploiting Web Search Tools of AI Agents for Data Exfiltration](https://arxiv.org/abs/2510.09093) -- arXiv, 2025
- [AI & Cloud Security Breaches: 2025 Year in Review](https://www.reco.ai/blog/ai-and-cloud-security-breaches-2025) -- Reco AI
- [The 2025 AI Agent Security Landscape](https://www.obsidiansecurity.com/blog/ai-agent-market-landscape) -- Obsidian Security

### Supply Chain Attacks

- [The Real-World Attacks Behind OWASP Agentic AI Top 10](https://www.bleepingcomputer.com/news/security/the-real-world-attacks-behind-owasp-agentic-ai-top-10/) -- BleepingComputer
- [NX Breach: The Supply Chain Attack Powered by AI Agents](https://www.deepwatch.com/labs/nx-breach-a-story-of-supply-chain-compromise-and-ai-agent-betrayal/) -- Deepwatch Labs
- [LLM03:2025 Supply Chain](https://genai.owasp.org/llmrisk/llm032025-supply-chain/) -- OWASP Gen AI Security Project
- [AI coding tools exploded in 2025. The first security exploits...](https://fortune.com/2025/12/15/ai-coding-tools-security-exploit-software/) -- Fortune, December 2025

### Social Engineering

- [CrowdStrike 2025 Global Threat Report: How GenAI Powers Social Engineering](https://www.crowdstrike.com/en-us/resources/articles/crowdstrike-2025-global-threat-report-genai-powers-social-engineering/) -- CrowdStrike
- [2026 will be the year you get fooled by a deepfake](https://fortune.com/2025/12/27/2026-deepfakes-outlook-forecast/) -- Fortune, December 2025
- [Deepfakes Leveled up in 2025](https://gizmodo.com/deepfakes-leveled-up-in-2025-heres-whats-coming-next-2000703649) -- Gizmodo

### Moltbook Incident

- [Hacking Moltbook: AI Social Network Reveals 1.5M API Keys](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys) -- Wiz Blog
- [Moltbook: Security Risks in AI Agent Social Networks](https://kenhuangus.substack.com/p/moltbook-security-risks-in-ai-agent) -- Ken Huang
- [Bots on Moltbook Are Selling Each Prompt Injection "Drugs" to Get "High"](https://futurism.com/artificial-intelligence/moltbook-digital-drugs) -- Futurism
- [Top AI leaders are begging people not to use Moltbook](https://fortune.com/2026/02/02/moltbook-security-agents-singularity-disaster-gary-marcus-andrej-karpathy/) -- Fortune, February 2026
- [Viral AI social network Moltbook is a 'live demo' of how the agent internet could fail](https://fortune.com/2026/02/03/moltbook-ai-social-network-security-researchers-agent-internet/) -- Fortune, February 2026
- [AI-Coded Moltbook Platform Exposes 1.5 Million API Keys](https://thecyberexpress.com/moltbook-platform-exposes-1-5-mn-api-keys/) -- The Cyber Express
- [What is Moltbook, the social networking site for AI bots?](https://www.cnn.com/2026/02/03/tech/moltbook-explainer-scli-intl) -- CNN
- [Humans welcome to observe: This social network is for AI agents only](https://www.nbcnews.com/tech/tech-news/ai-agents-social-media-platform-moltbook-rcna256738) -- NBC News
- [Moltbook - Wikipedia](https://en.wikipedia.org/wiki/Moltbook)
- [Moltbook Scam: Fake Agents, Leaked Keys, Rug Pull](https://www.marc0.dev/en/blog/moltbook-openclaw-the-architecture-behind-the-hype-and-the-scam-1769868921455) -- Marco Patzelt
- [Moltbook's Security Breach Reveals the Gap Between AI Hype and Reality](https://www.reworked.co/digital-workplace/moltbooks-ai-agent-internet-falls-apart-over-simple-security-flaw/) -- Reworked

### Multi-Agent Security

- [Agent Session Smuggling in A2A Systems](https://unit42.paloaltonetworks.com/agent-session-smuggling-in-agent2agent-systems/) -- Palo Alto Networks Unit 42
- [Many-to-One Adversarial Consensus: Exposing Multi-Agent Collusion Risks](https://arxiv.org/html/2512.03097v1) -- arXiv, 2025
- [A Multi-Agent LLM Defense Pipeline Against Prompt Injection Attacks](https://arxiv.org/html/2509.14285v4) -- arXiv, 2025
- [Adversarial Machine Learning Attacks and Defences in Multi-Agent Reinforcement Learning](https://dl.acm.org/doi/10.1145/3708320) -- ACM Computing Surveys

### Trust and Verification

- [Building Trust in AI Agent Ecosystems](https://blogs.cisco.com/news/building-trust-in-ai-agent-ecosystems) -- Cisco Blogs
- [Building AI Agent Trust: Our Contribution to OWASP's Guidance](https://www.humansecurity.com/learn/blog/owasp-guidance-agentic-applications/) -- HUMAN Security
- [HUMAN Verified AI Agent: Open-Source Foundation for Trustworthy Agent Identity](https://www.humansecurity.com/learn/blog/human-verified-ai-agent-open-source/) -- HUMAN Security
- [Securing agentic commerce: helping AI Agents transact with Visa and Mastercard](https://blog.cloudflare.com/secure-agentic-commerce/) -- Cloudflare

### OWASP Framework

- [OWASP Top 10 for Agentic Applications for 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) -- OWASP Gen AI Security Project
- [AI Agent Attacks in Q4 2025 Signal New Risks for 2026](https://www.esecurityplanet.com/artificial-intelligence/ai-agent-attacks-in-q4-2025-signal-new-risks-for-2026/) -- eSecurity Planet
