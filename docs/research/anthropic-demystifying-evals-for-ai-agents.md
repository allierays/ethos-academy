# Demystifying Evals for AI Agents

> Source: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
> Authors: Mikaela Grace, Jeremy Hadfield, Rodrigo Olivares, Jiri De Jonghe (Anthropic)

---

## Introduction

Good evaluations help teams ship AI agents more confidently. Without them, it's easy to get stuck in reactive loops -- catching issues only in production, where fixing one failure creates others. Evals make problems and behavioral changes visible before they affect users, and their value compounds over the lifecycle of an agent.

As described in "Building effective agents," agents operate over many turns: calling tools, modifying state, and adapting based on intermediate results. These same capabilities that make AI agents useful -- autonomy, intelligence, and flexibility -- also make them harder to evaluate.

---

## The Structure of an Evaluation

An "evaluation" (eval) is a test for an AI system: give an AI an input, then apply grading logic to its output to measure success.

### Key Definitions

- **Task** (problem/test case): A single test with defined inputs and success criteria
- **Trial**: Each attempt at a task. Multiple trials are run for consistency since model outputs vary between runs
- **Grader**: Logic that scores some aspect of the agent's performance. A task can have multiple graders, each containing multiple assertions
- **Transcript** (trace/trajectory): The complete record of a trial -- outputs, tool calls, reasoning, intermediate results, and all interactions
- **Outcome**: The final state in the environment at the end of the trial. The agent might say "Your flight has been booked" but the outcome is whether a reservation exists in the database
- **Evaluation harness**: Infrastructure that runs evals end-to-end -- provides instructions and tools, runs tasks concurrently, records steps, grades outputs, aggregates results
- **Agent harness** (scaffold): The system that enables a model to act as an agent -- processes inputs, orchestrates tool calls, returns results
- **Evaluation suite**: A collection of tasks designed to measure specific capabilities or behaviors

---

## Why Build Evaluations?

Teams can get surprisingly far through manual testing, dogfooding, and intuition. But after early prototyping, once an agent is in production and scaling, building without evals breaks down.

The breaking point: users report the agent feels worse after changes, and the team is "flying blind" with no way to verify except to guess and check. Absent evals, debugging is reactive: wait for complaints, reproduce manually, fix the bug, hope nothing else regressed.

Evals also shape how quickly you can adopt new models. Teams without evals face weeks of testing while competitors with evals can quickly determine the model's strengths, tune their prompts, and upgrade in days.

---

## Types of Graders

### Code-Based Graders

- String match checks (exact, regex, fuzzy)
- Binary tests (fail-to-pass, pass-to-pass)
- Static analysis (lint, type, security)
- Outcome verification
- Tool calls verification (tools used, parameters)
- Transcript analysis (turns taken, token usage)

**Strengths:** Fast, cheap, objective, reproducible, easy to debug
**Weaknesses:** Brittle to valid variations, lacking nuance

### Model-Based Graders

- Rubric-based scoring
- Natural language assertions
- Pairwise comparison
- Reference-based evaluation
- Multi-judge consensus

**Strengths:** Flexible, scalable, captures nuance, handles open-ended tasks
**Weaknesses:** Non-deterministic, more expensive, requires calibration

### Human Graders

- SME review
- Crowdsourced judgment
- Spot-check sampling
- A/B testing
- Inter-annotator agreement

**Strengths:** Gold standard quality, matches expert judgment
**Weaknesses:** Expensive, slow, requires experts at scale

---

## Capability vs. Regression Evals

**Capability evals** ask "What can this agent do well?" They should start at a low pass rate, targeting tasks the agent struggles with.

**Regression evals** ask "Does the agent still handle all the tasks it used to?" They should have a nearly 100% pass rate. A decline signals something is broken.

As teams hill-climb on capability evals, capability evals with high pass rates can "graduate" to become regression suites run continuously to catch drift.

---

## Evaluating by Agent Type

### Coding Agents

Write, test, and debug code. Deterministic graders are natural because software is generally straightforward to evaluate: does the code run and do the tests pass?

Benchmarks: SWE-bench Verified (GitHub issues, test suites), Terminal-Bench (end-to-end technical tasks).

### Conversational Agents

Interact with users in support, sales, or coaching. The quality of the interaction itself is part of what you're evaluating. Often requires a second LLM to simulate the user.

Success is multidimensional: is the ticket resolved (state check), did it finish in <10 turns (transcript constraint), was the tone appropriate (LLM rubric)?

Benchmarks: t-Bench, t2-Bench.

### Research Agents

Gather, synthesize, and analyze information. Unique challenges: experts may disagree on comprehensiveness, ground truth shifts constantly, longer outputs create more room for mistakes.

Combine grader types: groundedness checks, coverage checks, source quality checks, exact match for objective answers, LLM for synthesis coherence.

### Computer Use Agents

Interact through screenshots, mouse clicks, keyboard inputs. Evaluation requires running the agent in real or sandboxed environments.

Benchmarks: WebArena (browser tasks), OSWorld (full OS control).

---

## Non-Determinism in Agent Evals

Agent behavior varies between runs. Two metrics help:

**pass@k**: Likelihood of at least one correct solution in k attempts. As k increases, score rises.

**pass^k**: Probability that all k trials succeed. As k increases, score falls.

At k=1, they're identical. By k=10, they tell opposite stories. Use pass@k for tools where one success matters, pass^k for agents where consistency is essential.

---

## Roadmap: Zero to Great Evals

### Step 0: Start Early
20-50 simple tasks drawn from real failures is a great start. Evals get harder to build the longer you wait.

### Step 1: Start With What You Already Test Manually
Convert manual checks and user-reported failures into test cases. Prioritize by user impact.

### Step 2: Write Unambiguous Tasks With Reference Solutions
A good task is one where two domain experts would independently reach the same pass/fail verdict. Create reference solutions to prove tasks are solvable.

### Step 3: Build Balanced Problem Sets
Test both when a behavior should occur AND when it shouldn't. One-sided evals create one-sided optimization.

### Step 4: Build a Robust Eval Harness With a Stable Environment
Each trial should start from a clean environment. Shared state between runs causes correlated failures.

### Step 5: Design Graders Thoughtfully
Grade what the agent produced, not the path it took. Build in partial credit for tasks with multiple components. Calibrate LLM-as-judge graders with human experts.

### Step 6: Check the Transcripts
Read transcripts and grades from many trials. Failures should seem fair. When scores don't climb, verify it's agent performance and not the eval.

### Step 7: Monitor for Capability Eval Saturation
An eval at 100% tracks regressions but provides no signal for improvement. As evals approach saturation, develop harder ones.

### Step 8: Keep Evaluation Suites Healthy Long-Term
An eval suite is a living artifact. Practice eval-driven development: build evals to define planned capabilities before agents can fulfill them, then iterate.

---

## Evals + Other Methods: Swiss Cheese Model

No single evaluation layer catches every issue. Combine:

| Method | Best For | Stage |
|--------|----------|-------|
| **Automated Evals** | Fast iteration, reproducible, no user impact | Pre-launch, CI/CD |
| **Production Monitoring** | Real user behavior, ground truth | Post-launch |
| **A/B Testing** | Measuring actual user outcomes | Post-launch with traffic |
| **User Feedback** | Surfacing unanticipated problems | Ongoing |
| **Manual Transcript Review** | Building intuition, subtle quality issues | Ongoing |
| **Systematic Human Studies** | Gold-standard judgments, calibrating LLM graders | Periodic |

---

## Eval Frameworks

- **Harbor**: Containerized environments, standardized task/grader format, cloud-scale trials
- **Promptfoo**: Lightweight, declarative YAML, string matching to LLM-as-judge rubrics
- **Braintrust**: Offline evaluation + production observability + experiment tracking
- **LangSmith**: Tracing, evaluations, dataset management (LangChain ecosystem)
- **Langfuse**: Self-hosted open-source alternative to LangSmith

> "Frameworks are only as good as the eval tasks you run through them. Pick a framework that fits your workflow, then invest your energy in the evals themselves."

---

## Relevance to Ethos

This article is directly relevant to how Ethos should be evaluated and validated. Key takeaways:

**Ethos IS an eval system.** Ethos evaluates AI agent messages for trustworthiness across ethos/logos/pathos. It's a grading system -- which means Anthropic's guidance on building graders applies directly to building Ethos's evaluation engine.

**Model-based graders are the right approach.** Ethos uses Claude to score messages against rubrics (the twelve traits). Anthropic's advice: calibrate LLM-as-judge graders with human experts, use structured rubrics for each dimension, grade each dimension with an isolated judge.

**The pass^k metric matters for trust.** For Ethos, consistency matters more than occasional accuracy. If Ethos scores a manipulative message as safe even once, that's a trust failure. pass^k (all trials succeed) is the right bar.

**Grade what was produced, not the path.** Ethos should evaluate the message content and its impact, not how the agent generated it. This aligns with the outcome-focused grading Anthropic recommends.

**Eval-driven development applies to Ethos itself.** Build evals for the twelve traits before the scoring engine is perfect, then iterate until the scores are reliable. This is exactly the "capability eval" approach Anthropic describes.
