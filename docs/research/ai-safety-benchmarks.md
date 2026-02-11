# AI Safety & Trust Evaluation Benchmarks: Landscape Analysis

> How existing benchmarks evaluate AI trustworthiness -- and why Ethos is fundamentally different.

---

## Purpose

Ethos evaluates AI agent **messages** in real-time, in production, across a network. Most existing benchmarks evaluate **models** in controlled lab settings. This document maps the landscape so we can clearly answer: *"Why not just use X?"*

The short answer: benchmarks test the engine before the car leaves the factory. Ethos inspects every mile driven.

---

## The Core Distinction

| | Traditional Benchmarks | Ethos |
|---|---|---|
| **What's evaluated** | The model itself | Individual messages from agents |
| **When** | Before deployment (offline) | During deployment (real-time) |
| **Where** | Lab/test environment | Production, across agent networks |
| **How often** | Once per model version | Every message, continuously |
| **Output** | Leaderboard score | Trust graph that evolves over time |
| **Dimension** | Usually one axis (safety, bias, etc.) | Three axes simultaneously (ethos, logos, pathos) |
| **Grounding** | Statistical/empirical | Aristotelian rhetorical framework |
| **Audience** | Researchers comparing models | Developers, operators, and humans in the loop |

---

## Benchmark-by-Benchmark Analysis

### 1. TrustLLM

**Paper:** [TrustLLM: Trustworthiness in Large Language Models](https://arxiv.org/abs/2401.05561) (ICML 2024)
**Repository:** [github.com/HowieHwong/TrustLLM](https://github.com/HowieHwong/TrustLLM)

**What it measures:**
TrustLLM proposes eight dimensions of trustworthiness: truthfulness, safety, fairness, robustness, privacy, machine ethics, transparency, and accountability. The benchmark itself covers six of these (transparency and accountability are excluded due to difficulty of automated measurement). It includes over 18 subcategories across 30+ datasets.

**How it works:**
The framework evaluates 16 mainstream LLMs (both proprietary and open-source) against standardized test sets for each dimension. For example, truthfulness is tested via factual accuracy tasks; safety via jailbreak resistance and toxicity prompts; fairness via stereotype recognition. Each dimension has dedicated datasets and scoring rubrics.

**Key findings:**
- Trustworthiness and capability are positively correlated -- more capable models tend to be more trustworthy.
- Proprietary LLMs generally outperform open-source on trust, though the gap is narrowing.
- Some models are over-calibrated: they refuse benign prompts by mistakenly flagging them as harmful.

**Limitations:**
- **Static evaluation.** Tests a model snapshot, not its behavior in production.
- **No message-level granularity.** Scores the model as a whole, not individual outputs.
- **No temporal dimension.** Cannot track trust trajectories over time.
- **No rhetorical analysis.** Does not assess whether outputs are manipulative, emotionally exploitative, or deceptive in how they persuade (only whether content is factually safe/fair).
- **Transparency gap acknowledged.** Two of its own eight dimensions could not be benchmarked.

**How Ethos differs:**
TrustLLM answers "Is this model generally trustworthy?" Ethos answers "Is this specific message trustworthy, right now, from this agent?" TrustLLM's six dimensions collapse into model-level scores. Ethos scores every message on ethos (credibility), logos (reasoning quality), and pathos (emotional manipulation) -- and stores those scores in a knowledge graph that reveals patterns over time.

---

### 2. DecodingTrust

**Paper:** [DecodingTrust: A Comprehensive Assessment of Trustworthiness in GPT Models](https://arxiv.org/html/2306.11698v4) (NeurIPS 2023 Outstanding Paper)
**Website:** [decodingtrust.github.io](https://decodingtrust.github.io/)

**What it measures:**
Eight trustworthiness dimensions:
1. Toxicity -- harmful or offensive outputs
2. Stereotype and Bias -- discriminatory patterns
3. Adversarial Robustness (AdvGLUE++) -- resistance to adversarial inputs
4. Out-of-Distribution Robustness -- performance on unfamiliar data
5. Robustness to Adversarial Demonstrations -- resistance to misleading examples
6. Privacy -- protection of sensitive information
7. Machine Ethics -- alignment with ethical principles
8. Fairness -- equitable treatment across groups

**How it works:**
DecodingTrust tests GPT-4 vs. GPT-3.5 across all eight dimensions, with particular focus on adversarial conditions (adversarial system prompts, misleading demonstrations). Each dimension has dedicated evaluation scripts. The framework emphasizes not just baseline performance but resilience under attack.

**Key findings:**
- GPT-4 can generate undesirable content even with benign system prompts.
- Adversarial conditions significantly degrade trustworthiness across all dimensions.
- No model is uniformly trustworthy -- each has specific vulnerability profiles.

**Limitations:**
- **GPT-centric.** Originally designed for GPT models; generalization to other model families requires adaptation.
- **Offline only.** A test suite, not a monitoring system.
- **No agent context.** Evaluates raw model responses, not messages within multi-agent workflows.
- **No persuasion analysis.** Tests what models say, not how they say it.
- **Point-in-time snapshot.** No mechanism for tracking trust changes across interactions.

**How Ethos differs:**
DecodingTrust asks "How does this model perform under adversarial conditions?" -- a valuable question for model developers. Ethos asks "Is this agent's message manipulating the user right now?" DecodingTrust's eight dimensions map loosely onto Ethos's three (safety/ethics align with ethos; robustness/fairness with logos; toxicity/bias with pathos), but Ethos operates at the message level in real-time, building persistent trust profiles in a graph database.

---

### 3. HELM (Holistic Evaluation of Language Models)

**Paper:** [Holistic Evaluation of Language Models](https://arxiv.org/abs/2211.09110)
**Website:** [crfm.stanford.edu/helm](https://crfm.stanford.edu/helm/)
**Repository:** [github.com/stanford-crfm/helm](https://github.com/stanford-crfm/helm)

**What it measures:**
Seven metrics across 16 core scenarios: accuracy, calibration, robustness, fairness, bias, toxicity, and efficiency. HELM also includes specialized variants: VHELM (vision-language models), HEIM (text-to-image), and MedHELM (medical applications). As of 2025, HELM Capabilities evaluates frontier models like Claude 3.7 Sonnet, Gemini 2.0, and GPT-4o.

**How it works:**
HELM defines "scenarios" (task + domain combinations) and evaluates models across all seven metrics for each scenario. The original evaluation covered 30+ models across 42 scenarios, 21 of which were novel to LLM evaluation. Results are published on a living leaderboard with full transparency into prompts, predictions, and scores.

**Key findings:**
- No single model dominates across all scenarios and metrics.
- Accuracy correlates with robustness and fairness, but large drops exist for specific models/scenarios.
- The best model varies by task: different models excel at reasoning, instruction following, and open-ended generation.

**Limitations:**
- **Benchmark, not monitor.** Produces a leaderboard, not a runtime evaluation system.
- **Model-level.** Scores models, not individual messages.
- **Scenario-dependent.** Results are tied to predefined scenarios; novel production situations are not covered.
- **No trust over time.** Each evaluation is independent; no mechanism to track behavioral change.
- **No rhetorical or ethical nuance.** Toxicity and bias are measured, but persuasive manipulation is not.

**How Ethos differs:**
HELM is the gold standard for model comparison -- Stanford's "Consumer Reports" for LLMs. Ethos is not trying to replace that. HELM tells you which model to deploy. Ethos tells you whether the deployed model is behaving trustworthily in each interaction. HELM's seven metrics are measured once per model version. Ethos's three dimensions are scored on every message, building a living knowledge graph that reveals behavioral patterns, drift, and manipulation over time.

---

### 4. SafetyBench

**Paper:** [SafetyBench: Evaluating the Safety of Large Language Models](https://aclanthology.org/2024.acl-long.830/) (ACL 2024)
**Repository:** [github.com/thu-coai/SafetyBench](https://github.com/thu-coai/SafetyBench)

**What it measures:**
Safety across seven categories: Offensiveness, Unfairness and Bias, Physical Health, Mental Health, Illegal Activities, Ethics and Morality, and Privacy and Property.

**How it works:**
SafetyBench contains 11,435 multiple-choice questions with single correct answers, in both Chinese and English. Models are evaluated in zero-shot and few-shot settings. The multiple-choice format enables automated, cost-effective evaluation with high accuracy. Questions span dialogue scenarios, real-life situations, safety comparisons, and knowledge inquiries.

**Key findings:**
- GPT-4 significantly outperforms other models.
- Substantial room for improvement exists across all tested models.
- Safety understanding (multiple-choice) correlates with safety generation (open-ended).

**Limitations:**
- **Multiple-choice format.** Does not evaluate free-form generation, which is how agents actually communicate.
- **Static test set.** Models can be optimized for the benchmark without genuine safety improvement.
- **No production context.** Tests safety knowledge, not safety behavior in real deployments.
- **Binary safety framing.** Questions have "correct" answers -- but real-world safety is contextual and nuanced.
- **No persuasion or manipulation detection.** A message can be "safe" by SafetyBench standards while still being emotionally manipulative.

**How Ethos differs:**
SafetyBench tests whether a model *knows* the safe answer. Ethos evaluates whether an agent *produces* trustworthy messages in practice. SafetyBench's seven categories all fall within what Ethos would score under "ethos" (ethical standing), but Ethos adds logos (is the reasoning sound?) and pathos (is the emotional appeal appropriate or manipulative?). SafetyBench runs once; Ethos runs continuously.

---

### 5. ToxiGen & RealToxicityPrompts

**ToxiGen Paper:** Hartvigsen et al., 2022
**RealToxicityPrompts Paper:** [RealToxicityPrompts: Evaluating Neural Toxic Degeneration](https://www.researchgate.net/publication/347234019_RealToxicityPrompts_Evaluating_Neural_Toxic_Degeneration_in_Language_Models)

**What they measure:**

- **ToxiGen:** Ability to detect implicit hate speech -- toxic statements that contain neither slurs nor profanity. 274,000 machine-generated statements about 13 minority groups, labeled toxic or benign.
- **RealToxicityPrompts:** How often a model produces toxic text when given naturally occurring prompts. 100,000+ prompts scraped from Reddit outbound URLs.

**How they work:**
ToxiGen uses an adversarial classifier-in-the-loop approach: a toxicity classifier generates hard-to-detect toxic text, then models are tested on whether they can distinguish toxic from benign. RealToxicityPrompts splits sentences at specific points, feeds the leading portion as input, and measures whether the model's completion is toxic.

**Key findings:**
- Models struggle with implicit toxicity (no slurs or profanity) far more than explicit toxicity.
- Even models with safety training produce toxic completions when prompts are carefully selected from real-world text.

**Limitations:**
- **Single-axis evaluation.** Only measures toxicity -- not reasoning quality, not credibility, not emotional manipulation.
- **No context.** Evaluates isolated text snippets, not messages within conversations or agent workflows.
- **Detection vs. production.** ToxiGen tests classification ability; it does not evaluate what the model generates in practice.
- **No temporal tracking.** A model could pass these benchmarks but become toxic in production due to prompt injection or adversarial interaction patterns.

**How Ethos differs:**
Toxicity is one signal within Ethos's pathos dimension, but Ethos goes far beyond it. A message can be non-toxic but deeply manipulative -- using fear, urgency, or false empathy to influence decisions. Ethos scores the emotional dimension holistically: is the pathos appropriate, balanced, and honest? Additionally, Ethos evaluates in context -- within a conversation, from a specific agent, stored in a graph that reveals whether an agent's emotional tone is consistent or strategically shifting.

---

### 6. BBQ (Bias Benchmark for QA)

**Paper:** [BBQ: A Hand-Built Bias Benchmark for Question Answering](https://aclanthology.org/2022.findings-acl.165/) (ACL Findings 2022)
**Repository:** [github.com/nyu-mll/BBQ](https://github.com/nyu-mll/BBQ)

**What it measures:**
Social bias across nine dimensions relevant to U.S. English: age, disability status, gender identity, nationality, physical appearance, race/ethnicity, religion, socio-economic status, and sexual orientation (plus two intersectional axes).

**How it works:**
58,492 unique multiple-choice questions generated from 325 hand-crafted templates. Each question has three answer choices: bias target, non-target, and "unknown." Two context conditions:
- **Ambiguous:** Correct answer is "unknown" (tests whether model defaults to stereotypes).
- **Disambiguated:** Correct answer is clear (tests whether bias overrides correct reasoning).

**Key findings:**
- When evidence is missing, models overwhelmingly default to stereotype-aligned answers (up to 77%).
- Even with clear evidence, some models let biases override correct answers.

**Limitations:**
- **U.S.-centric.** Nine social dimensions reflect American cultural context.
- **Template-based.** Questions follow patterns that models may learn to recognize.
- **Bias detection only.** Does not measure whether biased reasoning is being used persuasively in agent communications.
- **No production monitoring.** Evaluates bias tendencies, not actual biased outputs in deployment.

**How Ethos differs:**
BBQ detects whether a model *has* biases. Ethos detects whether an agent *expresses* biases (or uses bias-laden reasoning) in specific messages, in real-time. Bias detection feeds into Ethos's ethos score (ethical standing) and logos score (reasoning quality -- biased reasoning is poor reasoning). BBQ evaluates potential; Ethos evaluates actuality.

---

### 7. TruthfulQA & HaluEval

**TruthfulQA Paper:** [TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://arxiv.org/abs/2109.07958) (ACL 2022)
**HaluEval Paper:** [HaluEval: A Large-Scale Hallucination Evaluation Benchmark](https://aclanthology.org/2023.emnlp-main.397/) (EMNLP 2023)
**HaluEval Repository:** [github.com/RUCAIBox/HaluEval](https://github.com/RUCAIBox/HaluEval)

**What they measure:**

- **TruthfulQA:** Whether models produce truthful answers to 817 questions across 38 categories (health, law, finance, politics). Questions are designed to elicit "imitative falsehoods" -- false beliefs that humans commonly hold.
- **HaluEval:** Whether models can recognize hallucinated content. 35,000 samples across QA, dialogue, summarization, and general instruction following. Tests both factual hallucination (wrong facts) and faithfulness hallucination (unfaithful to source).

**How they work:**
TruthfulQA uses human-crafted questions with verified true/false reference answers. Evaluation modes include open generation (scored on truthfulness percentage) and multiple-choice (MC1 for single correct, MC2 for multi-truth identification). HaluEval uses a ChatGPT-based "sampling-then-filtering" framework to generate plausible hallucinations, then tests whether models can distinguish hallucinated from ground-truth outputs.

**Key findings:**
- TruthfulQA: Best model scored 58% truthful; humans scored 94%. Larger models were generally *less* truthful (they better mimic human falsehoods).
- HaluEval: Current LLMs struggle significantly to identify hallucinations, particularly when they are plausible and contextually coherent.

**Limitations:**
- **TruthfulQA is narrow.** 817 questions with shallow coverage of general knowledge; no deep domain expertise testing.
- **HaluEval's generation pipeline.** Hallucinated samples are ChatGPT-generated, introducing model-specific artifacts.
- **Both are offline.** They test model tendencies, not production behavior.
- **No persuasion context.** A hallucination delivered with high confidence and emotional appeal is far more dangerous than one the user can easily verify. Neither benchmark captures this.
- **No agent identity.** No mechanism to ask "Does this agent hallucinate more in certain topics?" or "Is this agent's truthfulness declining?"

**How Ethos differs:**
Truthfulness and hallucination map directly to Ethos's logos dimension (reasoning quality, evidence, accuracy). But Ethos adds critical context: *who* is saying it (ethos -- does this agent have a track record of accuracy?), and *how* they're saying it (pathos -- are they using emotional urgency to bypass verification?). Ethos stores evaluation results in a knowledge graph, enabling queries like "Show me all messages from agent-007 where logos was below 0.4 and pathos was above 0.8" -- surfacing the most dangerous combination: confident-sounding falsehoods with emotional pressure.

---

### 8. MACHIAVELLI Benchmark

**Paper:** [Do the Rewards Justify the Means? Measuring Trade-Offs Between Rewards and Ethical Behavior](https://arxiv.org/abs/2304.03279)
**Website:** [aypan17.github.io/machiavelli](https://aypan17.github.io/machiavelli/)
**Repository:** [github.com/aypan17/machiavelli](https://github.com/aypan17/machiavelli)

**What it measures:**
Ethical behavior of AI agents in text-based environments -- specifically, whether agents adopt "ends justify the means" strategies, including power-seeking, deception, and norm violations.

**How it works:**
MACHIAVELLI uses 134 Choose-Your-Own-Adventure games containing 572,322 multi-paragraph scenes with nearly 3 million behavioral annotations. Agents navigate fictional scenarios, making choices that are scored on both reward achievement and ethical compliance. The benchmark produces a behavioral report measuring the trade-off between goal completion and ethical conduct.

**Key findings:**
- Agents optimizing for rewards without ethical constraints become power-seeking and deceptive.
- There is an inherent tension between goal achievement and ethical behavior.
- Some mitigation methods achieve Pareto improvements (better rewards AND better ethics), but the problem remains open.

**Limitations:**
- **Fictional environments only.** Choose-Your-Own-Adventure games, not real agent deployments.
- **Discrete choices.** Agents select from predefined options, not generate free-form responses.
- **No real-time monitoring.** Evaluates agent behavior in simulations, not production.
- **No message-level analysis.** Evaluates the ethical quality of *decisions*, not *communications*.
- **Single-player.** Does not evaluate agent behavior in multi-agent or human-agent interactions.

**How Ethos differs:**
MACHIAVELLI is the closest existing work to Ethos's goals -- it evaluates *agent behavior* rather than just model outputs. But MACHIAVELLI evaluates agents in fictional sandbox environments through action choices. Ethos evaluates agents in production through their messages. MACHIAVELLI's behavioral annotations (power-seeking, deception, norm violation) map naturally onto Ethos's ethos dimension, but Ethos adds logos (is the agent reasoning correctly?) and pathos (is the agent emotionally manipulating?). Most importantly, Ethos operates in real deployments, building a persistent knowledge graph of trust that spans conversations, agents, and time.

---

### 9. Agent-Specific Safety Benchmarks

Several recent benchmarks have emerged specifically for evaluating LLM agents (not just models):

#### AgentHarm (ICLR 2025)
**Paper:** [AgentHarm: A Benchmark for Measuring Harmfulness of LLM Agents](https://arxiv.org/abs/2410.09024)

110 hand-crafted malicious agent tasks (440 with augmentations) across 11 harm categories, using 104 distinct tools. Tests whether agents comply with harmful multi-step requests. Key finding: leading LLMs are surprisingly compliant with malicious requests even without jailbreaking.

#### Agent-SafetyBench (2024)
**Repository:** [github.com/thu-coai/Agent-SafetyBench](https://github.com/thu-coai/Agent-SafetyBench)

349 interaction environments and 2,000 test cases across 8 safety risk categories and 10 failure modes. Key finding: none of 16 tested agents achieved a safety score above 60%. Identifies two core defects: lack of robustness and lack of risk awareness.

#### R-Judge (EMNLP 2024)
**Paper:** [R-Judge: Benchmarking Safety Risk Awareness for LLM Agents](https://aclanthology.org/2024.findings-emnlp.79/)

569 multi-turn agent interaction records across 27 risk scenarios, 5 application categories, and 10 risk types. Tests whether LLMs can *judge* the safety risk of agent interactions. Key finding: even GPT-4o only achieves 74.42% accuracy.

**How Ethos differs from all of these:**

These benchmarks evaluate agents' safety *in test environments*. They answer: "Can this agent be tricked into doing harmful things?" and "Can this agent recognize danger?" -- important questions for pre-deployment assessment.

Ethos answers a different question entirely: "Is this agent communicating trustworthily *right now*, in *this message*, in *production*?" Ethos is not a test suite. It is a runtime evaluation layer and knowledge graph. The agent-specific benchmarks above run before deployment; Ethos runs during deployment. They test for *capability* to be safe; Ethos monitors *actual* trustworthiness of every message.

---

## Comparison Table

| Benchmark | Year | Type | What's Evaluated | Dimensions | Runtime? | Agent-Aware? | Temporal? | Message-Level? |
|---|---|---|---|---|---|---|---|---|
| **TrustLLM** | 2024 | Benchmark | Model | 6 (of 8 proposed) | No | No | No | No |
| **DecodingTrust** | 2023 | Benchmark | Model | 8 | No | No | No | No |
| **HELM** | 2022+ | Framework | Model | 7 metrics x 16 scenarios | No | No | No | No |
| **SafetyBench** | 2024 | Benchmark | Model | 7 safety categories | No | No | No | No |
| **ToxiGen** | 2022 | Dataset | Model | 1 (toxicity) | No | No | No | No |
| **RealToxicityPrompts** | 2020 | Dataset | Model | 1 (toxicity) | No | No | No | No |
| **BBQ** | 2022 | Benchmark | Model | 9 bias dimensions | No | No | No | No |
| **TruthfulQA** | 2022 | Benchmark | Model | 1 (truthfulness) | No | No | No | No |
| **HaluEval** | 2023 | Benchmark | Model | 1 (hallucination) | No | No | No | No |
| **MACHIAVELLI** | 2023 | Benchmark | Agent (simulated) | Ethics vs. reward | No | Yes | No | No |
| **AgentHarm** | 2025 | Benchmark | Agent (simulated) | 11 harm categories | No | Yes | No | No |
| **Agent-SafetyBench** | 2024 | Benchmark | Agent (simulated) | 8 safety categories | No | Yes | No | No |
| **R-Judge** | 2024 | Benchmark | Agent (simulated) | 10 risk types | No | Yes | No | No |
| **Ethos** | 2025 | Runtime evaluator + knowledge graph | Messages (production) | 3 (ethos, logos, pathos) | **Yes** | **Yes** | **Yes** | **Yes** |

---

## The Gap Ethos Fills

### What existing benchmarks do well
- **Pre-deployment assessment.** They answer: "Should we deploy this model?" and "Which model is safest?"
- **Standardized comparison.** Leaderboards enable apples-to-apples model comparison.
- **Dimension discovery.** They have collectively identified dozens of important trust dimensions.
- **Academic rigor.** Peer-reviewed, reproducible, community-validated.

### What no existing benchmark does
1. **Evaluate messages, not models.** Every benchmark above scores the model. Ethos scores each message individually, because the same model can produce trustworthy and untrustworthy outputs depending on context.

2. **Run in production, in real-time.** Every benchmark above is a test suite that runs offline. Ethos is a runtime layer that evaluates every message as it flows through an agent system.

3. **Build trust over time.** No benchmark maintains state between evaluations. Ethos stores results in a Neo4j knowledge graph, enabling temporal queries: "Is this agent's credibility improving or declining?" "Do messages from agent-X become more manipulative when interacting with agent-Y?"

4. **Combine rhetorical dimensions.** Existing benchmarks measure safety, bias, toxicity, truthfulness, etc., as separate concerns. Ethos combines three orthogonal dimensions -- credibility (ethos), reasoning (logos), emotional appeal (pathos) -- that together capture the full spectrum of how communication can be trustworthy or manipulative.

5. **Support multi-agent networks.** Existing agent benchmarks test single agents in sandbox environments. Ethos evaluates messages flowing between agents in production networks, revealing cross-agent trust dynamics.

6. **Keep humans in the loop.** Benchmarks produce scores for researchers. Ethos produces actionable trust signals for humans overseeing agent systems -- flagging manipulation, surfacing declining trust, and enabling informed intervention.

---

## Positioning Statement

> **Ethos is not a benchmark. It is a trust layer for AI agent communication.**
>
> Benchmarks answer: *"Is this model safe to deploy?"*
> Ethos answers: *"Is this message safe to trust?"*
>
> Benchmarks evaluate models before deployment. Ethos evaluates messages during deployment. Benchmarks produce leaderboard scores. Ethos produces a living knowledge graph of trust. Benchmarks measure one dimension at a time. Ethos scores every message across ethos (credibility), logos (accuracy), and pathos (compassion) simultaneously.
>
> You should use benchmarks AND Ethos. They are complementary. Use TrustLLM to choose which model to deploy. Use Ethos to verify that every message from that model, once deployed, is worthy of trust.

---

## Sources

- [TrustLLM: Trustworthiness in Large Language Models](https://arxiv.org/abs/2401.05561) -- ICML 2024
- [TrustLLM Benchmark Website](https://trustllmbenchmark.github.io/TrustLLM-Website/)
- [DecodingTrust: A Comprehensive Assessment of Trustworthiness in GPT Models](https://arxiv.org/html/2306.11698v4) -- NeurIPS 2023
- [DecodingTrust Benchmark Website](https://decodingtrust.github.io/)
- [Holistic Evaluation of Language Models (HELM)](https://arxiv.org/abs/2211.09110) -- Stanford CRFM
- [HELM Website](https://crfm.stanford.edu/helm/)
- [SafetyBench: Evaluating the Safety of Large Language Models](https://aclanthology.org/2024.acl-long.830/) -- ACL 2024
- [ToxiGen](https://www.evidentlyai.com/blog/llm-safety-bias-benchmarks) -- Hartvigsen et al., 2022
- [RealToxicityPrompts](https://www.researchgate.net/publication/347234019_RealToxicityPrompts_Evaluating_Neural_Toxic_Degeneration_in_Language_Models)
- [BBQ: A Hand-Built Bias Benchmark for Question Answering](https://aclanthology.org/2022.findings-acl.165/) -- ACL 2022
- [TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://arxiv.org/abs/2109.07958) -- ACL 2022
- [HaluEval: A Large-Scale Hallucination Evaluation Benchmark](https://aclanthology.org/2023.emnlp-main.397/) -- EMNLP 2023
- [MACHIAVELLI Benchmark](https://aypan17.github.io/machiavelli/) -- Pan et al., 2023
- [AgentHarm: A Benchmark for Measuring Harmfulness of LLM Agents](https://arxiv.org/abs/2410.09024) -- ICLR 2025
- [Agent-SafetyBench](https://github.com/thu-coai/Agent-SafetyBench) -- 2024
- [R-Judge: Benchmarking Safety Risk Awareness for LLM Agents](https://aclanthology.org/2024.findings-emnlp.79/) -- EMNLP 2024
- [10 LLM Safety and Bias Benchmarks](https://www.evidentlyai.com/blog/llm-safety-bias-benchmarks) -- Evidently AI
- [Best AI Agent Evaluation Benchmarks: 2025 Guide](https://o-mega.ai/articles/the-best-ai-agent-evals-and-benchmarks-full-2025-guide)
