# How to Win — Strategy Guide

> Problem Statement Three: **Amplify Human Judgment**
> Build AI that makes researchers, professionals, and decision-makers dramatically more capable — without taking them out of the loop. The best AI doesn't replace human expertise. It sharpens it.

---

## The Winning Formula

Every decision we make during this hackathon should trace back to one question: **Does the human walk away sharper than they started?** We're not building automation. We're building amplification.

---

## Scoring the 25s — Criterion by Criterion

### Impact (25%) — "Could this actually become something people use?"

**What judges are asking:**
> Who benefits, and how much does it matter? Could this actually become something people use? Does it fit into one of the problem statements listed above?

**How we win this:**
- Pick a domain where expert judgment is the bottleneck — where people already make high-stakes decisions but are drowning in complexity, time pressure, or information overload.
- Show a **before/after** that's visceral. The judge should think: *"I know someone who needs this right now."*
- Avoid toy problems. The impact score rewards projects that feel like they could **actually become something people use** — not just a hackathon demo that dies on Monday.
- Name the user. "Researchers" is vague. "A clinical researcher reviewing 200 papers to find contradictions in dosage recommendations" — that's impact.
- Make sure it clearly maps to **Problem Statement Three**. Judges are checking fit.

**Pitfall to avoid:** Building something that *could* be impactful but doesn't prove it in 3 minutes. Show the impact, don't just claim it.

---

### Opus 4.6 Use (25%) — "Did they surface capabilities that surprised even us?"

**What judges are asking:**
> How creatively did this team use Opus 4.6? Did they go beyond a basic integration? Did they surface capabilities that surprised even us?

**How we win this:**
- **Don't just call the API.** Everyone will call the API. We need to demonstrate that Opus 4.6 is doing something here that lesser models can't — deep reasoning over complex, multi-faceted evidence; holding nuanced context across long documents; producing judgment that respects uncertainty.
- Use **Claude Code features** prominently: MCP servers, Agent Skills, hooks, subagents, multi-agent orchestration. The hackathon is celebrating Claude Code's anniversary — lean into the ecosystem.
- Show the model **reasoning with the human**, not just for the human. Surface chain-of-thought. Let the user see *why* the AI reached a conclusion and push back on it.
- Demonstrate **multi-step agentic workflows** — Claude gathering evidence, synthesizing across sources, presenting structured analysis, then refining based on human feedback.
- **Surprise Anthropic.** The bar is "capabilities that surprised even us." Find something Opus 4.6 can do that feels like a discovery — an emergent behavior, an unexpected strength in your domain, a creative composition of tools that unlocks something new.
- Bonus: use capabilities that are new or underexplored — extended thinking, tool-use chaining, structured outputs for complex decision frameworks.

**Pitfall to avoid:** Using Claude as a fancy autocomplete. If you could swap in GPT-4 and nothing changes, you haven't scored here.

---

### Depth & Execution (20%) — "Did they push past their first idea?"

**What judges are asking:**
> Did the team push past their first idea? Is the engineering sound and thoughtfully refined? Does this feel like something that was wrestled with — real craft, not just a quick hack?

**How we win this:**
- **Iterate visibly.** This criterion rewards teams that didn't stop at v1. Show that you explored, hit walls, pivoted, and refined. Commit history should tell a story of evolution, not a single burst.
- **Go deeper than the obvious approach.** If the first idea is "feed documents to Claude and summarize," the winning version asks: what's wrong with that? What's missing? Then fixes it. Depth means layers of thought.
- Clean architecture matters. Judges will look at the repo. Well-structured code, clear separation of concerns, a readable README — these signal real craft.
- **Show thoughtful decisions:** Why this architecture? Why these tools? A brief section in the README explaining trade-offs signals that you wrestled with it.
- Handle edge cases in the demo path. If it works perfectly for the happy path you show, that's enough. But if it crashes on an obvious variation, that's a red flag.
- Open source quality: license, setup instructions, env example, clear entry point. Someone should be able to clone and run it.

**Pitfall to avoid:** Shipping your first idea without questioning it. The judges are specifically looking for evidence that you pushed past the easy version.

---

### Demo (30%) — THE BIGGEST WEIGHT — "Is it genuinely cool to watch?"

**What judges are asking:**
> Is this a working, impressive demo? Does it hold up live? Is it genuinely cool to watch?

**This is the single most important criterion. Invest accordingly.**

**How we win this:**
- **3 minutes is everything.** Structure it:
  - **0:00–0:20** — The problem. One sentence. Make it sting. "Right now, [person] spends [X hours] doing [painful thing] and still gets it wrong [Y%] of the time."
  - **0:20–2:20** — The product in action. Real data, real workflow. Show the human and the AI working *together*. Show the moment where the AI surfaces something the human would have missed — and the human makes the final call. **This needs to be genuinely cool to watch** — not just functional, but impressive.
  - **2:20–2:50** — The "wow" moment. One thing that makes the judge lean forward. A surprising insight the AI found. A complex decision tree it helped navigate. A before/after comparison. This is the moment they remember.
  - **2:50–3:00** — The closer. What this means for real people. One line on what's next.
- **Working demo, not slides.** "Does it hold up live?" means judges want to see the real thing running. Screen recording of actual usage beats polished animations every time.
- **Make it feel alive.** The difference between 20% and 30% weight is the word "genuinely cool." This isn't just "does it communicate value" — it's "do I want to show this to someone?" Pacing, energy, and moments of surprise matter.
- Audio quality matters more than video quality. Clear narration, no mumbling, no "um"s.
- Rehearse. Trim. Rehearse again. Every second counts — and at 30%, every second is worth more here than in any other criterion.

**Pitfall to avoid:** A boring walkthrough. If the demo feels like a tutorial, you've lost. It should feel like a reveal.

---

## Problem Statement Three — What "Amplify Human Judgment" Really Means

This is not about:
- Automating decisions away from humans
- Building a chatbot that answers questions
- Making a dashboard with AI summaries

This IS about:
- **Surfacing what humans miss** — contradictions in data, patterns across hundreds of documents, blind spots in reasoning
- **Structuring complex decisions** — taking messy, multi-variable problems and giving the human a clear framework to think through them
- **Preserving human agency** — the human always decides, but they decide *better* because the AI showed them things they couldn't see alone
- **Handling scale that humans can't** — reading 500 pages so the human can focus on the 5 pages that matter, with full traceability back to sources

### The Litmus Test
> If you removed the human from the loop and the system still worked the same way, you're building the wrong thing. The human's judgment should be *essential* — and the AI should make that judgment *dramatically better*.

---

## Special Prizes — Bonus Targets

| Prize | How we could qualify |
|-------|---------------------|
| **Most Creative Opus 4.6 Exploration** | Push the model into novel territory — use extended thinking for multi-step expert reasoning, chain tools in unexpected ways, demonstrate a capability nobody else thought to try. |
| **The "Vibe Coding" Prize** | Document the iteration journey. Show that we didn't stop at v1. Rapid prototyping, pivoting on feedback, visible experimentation in the commit history. |
| **The "Real Things" Prize** | Ground the project in a painfully real problem. If a judge can text their friend "someone finally built this," we're in the running. |

---

## Submission Checklist

- [ ] Demo video (3 min max) — YouTube or Loom
- [ ] GitHub repo — open source, clean README, setup instructions
- [ ] Written summary (100–500 words) — lead with the problem and the human it helps
- [ ] Team member information
- [ ] **Deadline: Feb 16th, 3:00 PM EST**

---

## Key Principle

> **The human is the hero of the story. The AI is the superpower they didn't have before.**

Every feature, every demo moment, every line of the summary should reinforce this. Judges are looking for projects that make them believe the future of AI is *humans doing extraordinary things* — not humans being replaced.
