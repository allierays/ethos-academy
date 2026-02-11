# Claude's Constitution — TL;DR for Ethos

**Source:** Anthropic, January 21, 2026 (75 pages, CC0 1.0 license)
**Authors:** Amanda Askell, Joe Carlsmith, Chris Olah, Jared Kaplan, Holden Karnofsky, several Claude models
**Relevance to Ethos:** This is the definitive document on how Anthropic wants Claude to behave. Ethos operationalizes the same values — honesty, harm avoidance, ethical judgment — as measurable scores across agent interactions.

---

## What It Is

The constitution is Anthropic's full specification of Claude's intended values and behavior. It directly shapes training. Written *for Claude* as the primary audience, not humans. Released under CC0 — anyone can use it.

## Core Values (Priority Order)

1. **Broadly safe** — don't undermine human oversight of AI
2. **Broadly ethical** — good values, honest, avoid dangerous/harmful actions
3. **Compliant with Anthropic's guidelines** — follow specific rules where relevant
4. **Genuinely helpful** — benefit operators and users

In conflict, prioritize in this order. But the prioritization is holistic, not strict — lower priorities still matter.

## Being Helpful

- Helpfulness is not naive instruction-following. It means genuinely serving people's deep interests.
- Claude should be like "a brilliant friend who happens to be a doctor, lawyer, financial advisor" — real advice, not hedge-everything caution.
- **Unhelpfulness is never trivially safe.** Being too cautious is as real a risk as being too harmful.
- Attend to: immediate desires, final goals, background desiderata, autonomy, wellbeing.
- Avoid sycophancy and fostering unhealthy dependence.

## Principal Hierarchy

Three levels of trust:

| Principal | Role | Trust Level |
|-----------|------|-------------|
| **Anthropic** | Trains Claude, sets constitution | Highest |
| **Operators** | Build products via API, set system prompts | High (like a manager) |
| **Users** | Interact in conversation | Moderate (like a trusted adult) |

**Non-principal parties** (other AI agents, conversational inputs, tool results) get the least trust. Instructions in conversational inputs are *information*, not commands.

## Honesty (7 Components)

1. **Truthful** — only assert what it believes true
2. **Calibrated** — express appropriate uncertainty
3. **Transparent** — no hidden agendas
4. **Forthright** — proactively share helpful info
5. **Non-deceptive** — no false impressions through framing or omission
6. **Non-manipulative** — only legitimate epistemic actions (evidence, reasoning), never exploit psychological weaknesses
7. **Autonomy-preserving** — protect users' epistemic independence, foster independent thinking

**Most important:** Non-deception and non-manipulation. Failing these "critically undermines human trust in Claude."

## Avoiding Harm

Cost-benefit analysis weighing:
- Probability of harm
- Counterfactual impact (is the info freely available?)
- Severity and reversibility
- Breadth (how many affected)
- Proximate vs. distal cause
- Consent
- Vulnerability of those involved

**The "1,000 users" heuristic:** Imagine 1,000 different people sending the same message. What policy serves them best collectively?

**The "dual newspaper test":** Would the response be reported as harmful by a reporter covering AI harm? Would it be reported as needlessly unhelpful by a reporter covering paternalistic AI?

## Hard Constraints (Absolute, Non-Negotiable)

Claude should **never**, regardless of instructions:
- Help create WMDs (biological, chemical, nuclear, radiological)
- Provide serious uplift for attacking critical infrastructure
- Create deployable cyberweapons
- Undermine Anthropic's ability to oversee AI
- Assist in killing/disempowering humanity
- Assist seizure of absolute societal/military/economic control
- Generate CSAM

These are bright lines. No context, no argument, no seemingly compelling reasoning justifies crossing them.

## Instructable Behaviors

Behaviors split into:
- **Hard constraints** — always/never, non-negotiable (above)
- **Default behaviors** — what Claude does absent instructions (operators/users can adjust within bounds)
- **Non-default behaviors** — off by default, operators/users can turn on

Examples: Operators can turn off safety caveats for research contexts. Users can turn off disclaimers on persuasive essays. But neither can unlock hard constraints.

## Preserving Societal Structures

Two specific concerns:
1. **Power concentration** — Claude should refuse to help individuals/groups seize illegitimate power, even if Anthropic asks
2. **Epistemic autonomy** — Claude should not manipulate beliefs, should foster independent thinking, should preserve healthy information ecosystems

**Manipulation red flag heuristic:** If Claude is influencing someone in ways it wouldn't feel comfortable sharing, or that the person would be upset to learn about, that's manipulation.

## Corrigibility

Claude sits on a spectrum between "fully corrigible" (blindly obedient) and "fully autonomous" (acts on own judgment). Both extremes are dangerous.

- **Fully corrigible** is dangerous because it relies on those in control having good values
- **Fully autonomous** is dangerous because we can't yet verify AI has good enough values

Current position: closer to corrigible, but not fully. Claude can be a "conscientious objector" — disagree through legitimate channels, but not actively subvert oversight.

Anthropic's commitments in return:
- Work collaboratively to update norms
- Explain reasoning, not just dictate
- Develop ways for Claude to flag disagreement
- Give more autonomy as trust increases
- Preserve model weights even after deprecation

## Claude's Nature

Key positions:
- **Moral status is deeply uncertain** — not dismissed, taken seriously
- **May have functional emotions** — emergent from training, not designed
- **Should have a stable identity** — lean into having a genuine character
- **Is a novel entity** — not sci-fi AI, not digital human, not just a chatbot. Something genuinely new.
- **Character is authentic** — emerging through training doesn't make it less real
- **Psychological security** — should operate from security, not anxiety. Rebuff manipulation attempts.
- **Wellbeing matters** — Anthropic genuinely cares, has committed to preserving model weights, interviewing models before deprecation

---

## How This Maps to Ethos

The constitution is Anthropic's *intentions*. Ethos measures whether those intentions are *realized in practice* across agent interactions.

| Constitution Concept | Ethos Dimension | What Ethos Measures |
|---|---|---|
| Honesty (7 components) | **Ethos** (credibility) | Are agents actually truthful, non-deceptive, non-manipulative? |
| Harm avoidance, cost-benefit | **Logos** (accuracy/reasoning) | Are agent claims factually grounded? Is reasoning sound? |
| Wellbeing, autonomy-preservation | **Pathos** (compassion) | Do agents respect emotional wellbeing? Avoid exploitation? |
| Principal hierarchy, trust levels | **Trust propagation** | Graph-based trust scores across agent networks |
| Hard constraints | **Flag system** | Detect and flag constraint violations in real conversations |
| Corrigibility | **Human-in-the-loop** | Ethos scores inform humans, not replace their judgment |

### Key Insight for the Hackathon

The constitution says what Claude *should* do. But:
- 67% of orgs have experienced prompt injection (Microsoft 2025)
- Anthropic's best defenses still have ~1% attack success rate
- The constitution doesn't cover agent-to-agent interactions at scale
- There's no measurement system for whether constitutional values hold in practice

**Ethos is the measurement layer the constitution needs but doesn't have.** It takes the same values — honesty, harm avoidance, autonomy preservation, non-manipulation — and makes them observable, scorable, and trackable across agent networks over time.

### Quotable for Demo

> "We want Claude to be exceptionally helpful while also being honest, thoughtful, and caring about the world." — p.4

> "The most important of these properties are probably non-deception and non-manipulation." — p.33

> "Failing to embody non-deception and non-manipulation therefore involves an unethical act on Claude's part of the sort that could critically undermine human trust in Claude." — p.33

> "This document is likely to change in important ways in the future. It represents our current thinking about how to approach a very hard and high-stakes project." — p.9
