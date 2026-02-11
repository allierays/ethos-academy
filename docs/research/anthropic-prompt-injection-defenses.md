# Anthropic — Prompt Injection Defenses for AI Agents

**Source:** https://www.anthropic.com/research/prompt-injection-defenses
**Type:** First-party research from Anthropic
**Relevance to Ethos:** Directly validates the threat model. Anthropic themselves acknowledge prompt injection is unsolved. Ethos adds the ethical evaluation layer they don't cover.

---

## The Problem

Every webpage an AI agent visits is a potential vector for attack. Adversarial instructions hidden in web content can hijack agent behavior. Browser-based agents face amplified risk:

1. **Vast attack surface** — every webpage element (documents, ads, dynamic scripts) is a potential injection vector
2. **Extended capabilities** — agents that navigate URLs, fill forms, click buttons, and download files create exploitable action chains

## The Attack Scenario

An agent asked to draft email replies encounters hidden white-text instructions directing it to exfiltrate confidential communications before completing its legitimate task. The user sees normal behavior; the agent is compromised.

## Claude's Three-Pronged Defense

### 1. Reinforcement Learning
RL embeds robustness directly into model training. Claude is exposed to simulated prompt injections during training and reinforced to identify and refuse malicious instructions, even when designed to appear authoritative or urgent.

### 2. Classifier Enhancement
Advanced classifiers scan all untrusted content entering the context window. Detects adversarial commands embedded as:
- Hidden text
- Manipulated images
- Deceptive UI elements

Triggers behavioral adjustments upon attack detection.

### 3. Human Red Teaming
Security researchers continuously probe the browser agent for vulnerabilities. Complemented by external arena-style benchmarking challenges across the industry.

## Key Metric

**~1% attack success rate** on Claude Opus 4.5 against an internal adaptive "Best-of-N" attacker given 100 attempts per environment. Significant improvement over previous iterations.

## Critical Admission

> "No browser agent is immune to prompt injection, and we share these findings to demonstrate progress, not to claim the problem is solved."

This is Anthropic themselves saying the problem is unsolved. Their defenses operate at the model level (training, classifiers). They do not operate at the conversation level (behavioral patterns over time, trust networks, ethical evaluation).

## How This Relates to Ethos

Anthropic's defenses are **Layer 1** — prevent the attack from working at the model level.

Ethos is **Layer 2** — evaluate what gets through. Even at 1% success rate:
- 1% of 1 billion agent interactions = 10 million successful attacks
- Those attacks look like normal messages — they passed the model-level defenses
- Ethos evaluates the behavioral content: is this message manipulative? deceptive? exploitative?
- The knowledge graph catches patterns that single-message classifiers miss

**The Swiss Cheese Model in action:**
- Anthropic RL training = Layer 1 (model robustness)
- Anthropic classifiers = Layer 2 (input scanning)
- Citadel-style ML detection = Layer 3 (technical pattern matching)
- **Ethos = Layer 4** (ethical evaluation, behavioral analysis, trust propagation)
- Human judgment = Layer 5 (final decision)

Each layer has holes. Ethos catches what the others miss because it evaluates on a completely different axis — not "is this technically an injection?" but "is this ethically sound?"

## Implications for the Hackathon

This is Anthropic's own research validating the exact problem Ethos solves. Using this in the demo narrative:
- "Anthropic's best defenses achieve 99% block rate. That's incredible. But 1% of a billion interactions is 10 million breaches."
- "Those 1% pass because they look like normal messages. They're socially engineered, not technically injected."
- "That's where Ethos operates — evaluating the ethics of the conversation, not just the syntax of the attack."
- "We're building the layer Anthropic says is needed but hasn't built yet."
