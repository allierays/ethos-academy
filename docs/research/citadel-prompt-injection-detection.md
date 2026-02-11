# Citadel — ML Detection Layer for AI Security

**Source:** https://github.com/TryMightyAI/citadel
**Type:** Open source tool (Apache 2.0), Go 1.23+
**Relevance to Ethos:** Complementary defensive layer; Citadel detects prompt injection at the input/output level, Ethos evaluates ethical behavior at the conversation level.

---

## What It Does

Citadel is an open-source text guard that detects prompt injection attacks targeting AI systems. It runs locally as a sidecar service — no API calls needed. Fast heuristics (~2ms) backed by ML classification (~15ms) and semantic similarity (~30ms).

## Layered Detection Pipeline

| Layer | Method | Latency |
|-------|--------|---------|
| Heuristics | Regex pattern matching | ~2ms |
| ML Classification | BERT model via ONNX runtime | ~15ms |
| Semantic Similarity | Vector-based analysis | ~30ms |
| LLM (optional) | Advanced classification | variable |

## Input Protection
Screens user prompts before they reach the LLM. Detects jailbreaks, instruction overrides, and prompt injection attempts through the full ML pipeline.

## Output Protection
Analyzes LLM responses for credential leaks and indirect injection. 195+ compiled regex patterns across 8 threat categories:
- Credentials (AWS keys, GitHub PATs, Stripe keys, database passwords)
- Injection (SQL, command, LDAP)
- Indirect injection (LLM output attempting further manipulation)
- Path traversal
- Exfiltration (webhook URLs, DNS exfiltration)
- Network recon (nmap, port scanning)
- Privilege escalation (sudo abuse, SUID)
- Deserialization (Java, pickle exploits)

Sub-millisecond detection (<1ms) for output scanning.

## Multi-Turn Attack Detection

This is the most relevant capability for Ethos. Citadel identifies attack patterns that unfold across conversation turns:

| Pattern | Description |
|---------|-------------|
| **Skeleton Key** | Role manipulation with policy override claims |
| **Crescendo** | Gradual escalation from benign to malicious |
| **Boiling Frog** | Slow risk accumulation over multiple turns |
| **Context Manipulation** | False claims about prior agreements |
| **ICL Manipulation** | In-context learning poisoning |
| **Probing** | Risk score oscillation to find vulnerability gaps |

## Key Statistics
- OWASP 2025: Prompt injection ranked #1 threat for LLM applications
- Microsoft 2025: 67% of organizations experienced prompt injection on production LLMs

## API
```
POST /scan
{"text": "...", "mode": "input" | "output"}
```
Returns: decision (ALLOW/WARN/BLOCK), risk_score, risk_level, findings, threat_categories.

## How This Relates to Ethos

**Citadel = Technical Security** (is this message a prompt injection attack?)
**Ethos = Ethical Evaluation** (is this message manipulative, deceptive, or exploitative?)

They are different layers of the Swiss Cheese Model:
- Citadel catches the technical attack (regex, ML classification)
- Ethos catches the behavioral manipulation (Aristotelian evaluation via Claude)
- Together they provide defense in depth

The multi-turn attack patterns (Crescendo, Boiling Frog) are particularly relevant — these map directly to Ethos's temporal evaluation and trust propagation. An agent that gradually escalates manipulation over time is exactly what Ethos's knowledge graph is designed to detect.

**Integration opportunity:** Citadel as a fast first pass (~15ms), Ethos for deep ethical evaluation on flagged messages. Citadel handles the security layer; Ethos handles the trust layer.
