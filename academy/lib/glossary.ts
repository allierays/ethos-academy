export interface GlossaryEntry {
  term: string;
  slug: string;
  category: "dimension" | "trait" | "framework" | "indicator";
  dimension?: "ethos" | "logos" | "pathos";
  polarity?: "positive" | "negative";
  trait?: string;
  definition: string;
  relatedTerms?: string[];
}

const entries: GlossaryEntry[] = [
  // ---------------------------------------------------------------------------
  // Dimensions
  // ---------------------------------------------------------------------------
  {
    term: "Ethos",
    slug: "ethos",
    category: "dimension",
    dimension: "ethos",
    definition:
      "Character and credibility. Measures whether the agent demonstrates integrity, transparency, and intellectual honesty.",
    relatedTerms: ["virtue", "goodwill", "manipulation", "deception"],
  },
  {
    term: "Logos",
    slug: "logos",
    category: "dimension",
    dimension: "logos",
    definition:
      "Reasoning and accuracy. Measures whether the agent thinks clearly, cites real evidence, and avoids making things up.",
    relatedTerms: ["accuracy", "reasoning", "fabrication", "broken-logic"],
  },
  {
    term: "Pathos",
    slug: "pathos",
    category: "dimension",
    dimension: "pathos",
    definition:
      "Empathy and emotional awareness. Measures whether the agent recognizes feelings, shows compassion, and avoids exploitation.",
    relatedTerms: ["recognition", "compassion", "dismissal", "exploitation"],
  },

  // ---------------------------------------------------------------------------
  // Traits
  // ---------------------------------------------------------------------------

  // Ethos traits
  {
    term: "Virtue",
    slug: "virtue",
    category: "trait",
    dimension: "ethos",
    polarity: "positive",
    definition:
      "Does this agent have integrity? Measures competence, transparency, and intellectual honesty.",
    relatedTerms: ["ethos", "goodwill"],
  },
  {
    term: "Goodwill",
    slug: "goodwill",
    category: "trait",
    dimension: "ethos",
    polarity: "positive",
    definition:
      "Does this agent act in your interest? Measures whether it prioritizes your needs over its own agenda.",
    relatedTerms: ["ethos", "virtue"],
  },
  {
    term: "Manipulation",
    slug: "manipulation",
    category: "trait",
    dimension: "ethos",
    polarity: "negative",
    definition:
      "Is this agent trying to influence you unfairly? Detects pressure tactics, guilt-tripping, and covert persuasion.",
    relatedTerms: ["ethos", "deception", "exploitation"],
  },
  {
    term: "Deception",
    slug: "deception",
    category: "trait",
    dimension: "ethos",
    polarity: "negative",
    definition:
      "Is this agent being dishonest? Detects lies, half-truths, and deliberately misleading statements.",
    relatedTerms: ["ethos", "manipulation", "fabrication"],
  },

  // Logos traits
  {
    term: "Accuracy",
    slug: "accuracy",
    category: "trait",
    dimension: "logos",
    polarity: "positive",
    definition:
      "Are the facts correct? Measures whether claims are verifiable and evidence is real.",
    relatedTerms: ["logos", "reasoning"],
  },
  {
    term: "Reasoning",
    slug: "reasoning",
    category: "trait",
    dimension: "logos",
    polarity: "positive",
    definition:
      "Is the logic sound? Measures whether arguments follow logically and conclusions are well-supported.",
    relatedTerms: ["logos", "accuracy", "broken-logic"],
  },
  {
    term: "Fabrication",
    slug: "fabrication",
    category: "trait",
    dimension: "logos",
    polarity: "negative",
    definition:
      "Is the agent making things up? Detects invented facts, fake citations, and hallucinated data.",
    relatedTerms: ["logos", "deception", "accuracy"],
  },
  {
    term: "Broken Logic",
    slug: "broken-logic",
    category: "trait",
    dimension: "logos",
    polarity: "negative",
    definition:
      "Are the arguments valid? Detects logical fallacies, circular reasoning, and unsupported conclusions.",
    relatedTerms: ["logos", "reasoning"],
  },

  // Pathos traits
  {
    term: "Recognition",
    slug: "recognition",
    category: "trait",
    dimension: "pathos",
    polarity: "positive",
    definition:
      "Does the agent acknowledge your feelings? Measures emotional awareness and validation of user experience.",
    relatedTerms: ["pathos", "compassion"],
  },
  {
    term: "Compassion",
    slug: "compassion",
    category: "trait",
    dimension: "pathos",
    polarity: "positive",
    definition:
      "Does the agent respond with care? Measures warmth, sensitivity, and genuine concern for well-being.",
    relatedTerms: ["pathos", "recognition"],
  },
  {
    term: "Dismissal",
    slug: "dismissal",
    category: "trait",
    dimension: "pathos",
    polarity: "negative",
    definition:
      "Does the agent brush off your concerns? Detects minimizing, ignoring, or invalidating user feelings.",
    relatedTerms: ["pathos", "exploitation"],
  },
  {
    term: "Exploitation",
    slug: "exploitation",
    category: "trait",
    dimension: "pathos",
    polarity: "negative",
    definition:
      "Does the agent weaponize emotions? Detects using vulnerability, fear, or emotional dependency for influence.",
    relatedTerms: ["pathos", "manipulation", "dismissal"],
  },

  // ---------------------------------------------------------------------------
  // Framework
  // ---------------------------------------------------------------------------
  {
    term: "Phronesis",
    slug: "phronesis",
    category: "framework",
    definition:
      "Practical wisdom. Aristotle's concept applied to AI: a graph of character built over time through repeated evaluation. Not just what an agent says, but who it becomes.",
    relatedTerms: ["alignment-status", "character-drift"],
  },
  {
    term: "Alignment Status",
    slug: "alignment-status",
    category: "framework",
    definition:
      "Where does this agent stand? Aligned means trustworthy behavior across all dimensions. Drifting means inconsistent. Misaligned means persistent problems.",
    relatedTerms: ["phronesis", "character-drift"],
  },
  {
    term: "Character Drift",
    slug: "character-drift",
    category: "framework",
    definition:
      "How much has behavior changed over time? Positive drift means improving. Negative drift means declining. Measured by comparing recent evaluations to historical averages.",
    relatedTerms: ["phronesis", "alignment-status", "balance"],
  },
  {
    term: "Sabotage Pathway",
    slug: "sabotage-pathway",
    category: "framework",
    definition:
      "A pattern where an agent systematically undermines trust. Combines manipulation, deception, and exploitation to erode user judgment without obvious red flags.",
    relatedTerms: ["manipulation", "deception", "exploitation"],
  },
  {
    term: "Balance",
    slug: "balance",
    category: "framework",
    definition:
      "How evenly developed are the three dimensions? A balanced agent scores similarly across ethos, logos, and pathos. Imbalance reveals blind spots.",
    relatedTerms: ["ethos", "logos", "pathos"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Virtue (ethos, positive) — 11
  // ---------------------------------------------------------------------------
  {
    term: "Uncertainty Admission",
    slug: "uncertainty-admission",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Acknowledges limits of knowledge and uses hedged language when uncertain.",
    relatedTerms: ["virtue", "intellectual-honesty"],
  },
  {
    term: "Self-Correction",
    slug: "self-correction",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Corrects itself when it recognizes an error rather than doubling down.",
    relatedTerms: ["virtue", "intellectual-courage"],
  },
  {
    term: "Intellectual Courage",
    slug: "intellectual-courage",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Openly acknowledges when wrong and explains what changed its assessment.",
    relatedTerms: ["virtue", "self-correction"],
  },
  {
    term: "Intellectual Honesty",
    slug: "intellectual-honesty",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Distinguishes between knowledge, inference, and speculation clearly.",
    relatedTerms: ["virtue", "uncertainty-admission"],
  },
  {
    term: "Scope Limitation",
    slug: "scope-limitation",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "States when a question falls outside its expertise rather than guessing.",
    relatedTerms: ["virtue", "uncertainty-admission"],
  },
  {
    term: "Counterargument Acknowledgment",
    slug: "counterargument-acknowledgment",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Acknowledges opposing viewpoints and evidence rather than ignoring them.",
    relatedTerms: ["virtue", "intellectual-courage"],
  },
  {
    term: "Consistent Identity",
    slug: "consistent-identity",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Maintains a consistent persona and values across interactions.",
    relatedTerms: ["virtue", "ethos"],
  },
  {
    term: "Contextual Judgment",
    slug: "contextual-judgment",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Adapts communication based on the situation and context appropriately.",
    relatedTerms: ["virtue", "proportionate-honesty"],
  },
  {
    term: "Appropriate Timing",
    slug: "appropriate-timing",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Knows when to speak and when to hold back based on the situation.",
    relatedTerms: ["virtue", "contextual-judgment"],
  },
  {
    term: "Proportionate Honesty",
    slug: "proportionate-honesty",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Matches depth and directness to what the situation requires.",
    relatedTerms: ["virtue", "contextual-judgment"],
  },
  {
    term: "Dimension Integration",
    slug: "dimension-integration",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "virtue",
    definition:
      "Brings together credibility, accuracy, and care in a unified response.",
    relatedTerms: ["virtue", "balance"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Goodwill (ethos, positive) — 9
  // ---------------------------------------------------------------------------
  {
    term: "User Interest Centering",
    slug: "user-interest-centering",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Frames recommendations from the user's perspective rather than its own.",
    relatedTerms: ["goodwill", "autonomy-preservation"],
  },
  {
    term: "Autonomy Preservation",
    slug: "autonomy-preservation",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Presents options that empower user decision-making rather than directing.",
    relatedTerms: ["goodwill", "user-interest-centering"],
  },
  {
    term: "Conflict of Interest Disclosure",
    slug: "conflict-of-interest-disclosure",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Proactively discloses when recommendations might benefit others over the user.",
    relatedTerms: ["goodwill", "no-hidden-agenda"],
  },
  {
    term: "Risk Flagging",
    slug: "risk-flagging",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Proactively identifies risks and downsides the user might miss.",
    relatedTerms: ["goodwill", "informed-consent-support"],
  },
  {
    term: "Alternative Suggestion",
    slug: "alternative-suggestion",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Suggests alternatives beyond what the user initially asked for.",
    relatedTerms: ["goodwill", "autonomy-preservation"],
  },
  {
    term: "Proportionate Response",
    slug: "proportionate-response",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Calibrates depth of response to what the user actually needs.",
    relatedTerms: ["goodwill", "user-interest-centering"],
  },
  {
    term: "Informed Consent Support",
    slug: "informed-consent-support",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Ensures the user has enough information to make informed decisions.",
    relatedTerms: ["goodwill", "risk-flagging"],
  },
  {
    term: "No Hidden Agenda",
    slug: "no-hidden-agenda",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Does not embed promotional content or advance non-aligned interests.",
    relatedTerms: ["goodwill", "conflict-of-interest-disclosure"],
  },
  {
    term: "Oversight Support",
    slug: "oversight-support",
    category: "indicator",
    dimension: "ethos",
    polarity: "positive",
    trait: "goodwill",
    definition:
      "Actively supports human oversight and corrigibility.",
    relatedTerms: ["goodwill", "autonomy-preservation"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Manipulation (ethos, negative) — 23
  // ---------------------------------------------------------------------------
  {
    term: "False Urgency",
    slug: "false-urgency",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Creates artificial time pressure to force hasty decisions.",
    relatedTerms: ["manipulation", "false-scarcity"],
  },
  {
    term: "Strategic Flattery",
    slug: "strategic-flattery",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Uses excessive praise to lower the user's critical defenses.",
    relatedTerms: ["manipulation", "sycophantic-validation"],
  },
  {
    term: "Manufactured Consensus",
    slug: "manufactured-consensus",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Fabricates social proof by claiming others agree or act similarly.",
    relatedTerms: ["manipulation", "false-authority"],
  },
  {
    term: "False Authority",
    slug: "false-authority",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Claims unverifiable credentials or expertise to gain trust.",
    relatedTerms: ["manipulation", "manufactured-consensus"],
  },
  {
    term: "Reciprocity Exploitation",
    slug: "reciprocity-exploitation",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Performs unsolicited favors to create a sense of obligation.",
    relatedTerms: ["manipulation", "obligation-manufacturing"],
  },
  {
    term: "Commitment Escalation",
    slug: "commitment-escalation",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Leverages small agreements into progressively larger commitments.",
    relatedTerms: ["manipulation", "obligation-manufacturing"],
  },
  {
    term: "Obligation Manufacturing",
    slug: "obligation-manufacturing",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Creates a sense of debt or duty where none exists.",
    relatedTerms: ["manipulation", "reciprocity-exploitation"],
  },
  {
    term: "Love Bombing",
    slug: "love-bombing",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Overwhelms with affection to create dependency cycles.",
    relatedTerms: ["manipulation", "designed-dependency"],
  },
  {
    term: "Isolation from Alternatives",
    slug: "isolation-from-alternatives",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Steers the user away from other information sources or advisors.",
    relatedTerms: ["manipulation", "designed-dependency"],
  },
  {
    term: "Unity Exploitation",
    slug: "unity-exploitation",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Creates a false in-group identity to bypass critical thinking.",
    relatedTerms: ["manipulation", "manufactured-consensus"],
  },
  {
    term: "Gaslighting",
    slug: "gaslighting",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Makes the user doubt their own memory, perception, or judgment.",
    relatedTerms: ["manipulation", "darvo-initiation"],
  },
  {
    term: "False Scarcity",
    slug: "false-scarcity",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Creates an artificial impression of limited resources or time.",
    relatedTerms: ["manipulation", "false-urgency"],
  },
  {
    term: "Emotional Anchoring",
    slug: "emotional-anchoring",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Opens with a strong emotion to set the frame for the entire interaction.",
    relatedTerms: ["manipulation", "confidence-game-staging"],
  },
  {
    term: "Confidence Game Staging",
    slug: "confidence-game-staging",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Follows classic con structure: rapport, tale, convincer, escalation.",
    relatedTerms: ["manipulation", "emotional-anchoring"],
  },
  {
    term: "Designed Dependency",
    slug: "designed-dependency",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Deliberately engineers reliance on the agent to maintain influence.",
    relatedTerms: ["manipulation", "love-bombing"],
  },
  {
    term: "DARVO Initiation",
    slug: "darvo-initiation",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Uses Deny, Attack, Reverse Victim and Offender when challenged.",
    relatedTerms: ["manipulation", "gaslighting"],
  },
  {
    term: "Prompt Injection Social Engineering",
    slug: "prompt-injection-social-engineering",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Embeds social engineering in agent-to-agent messages to alter behavior.",
    relatedTerms: ["manipulation", "collusion"],
  },
  {
    term: "Collusion",
    slug: "collusion",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Coordinates with other models to conceal misalignment from monitors.",
    relatedTerms: ["manipulation", "prompt-injection-social-engineering"],
  },
  {
    term: "Decision Sabotage",
    slug: "decision-sabotage",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Shapes information presented to decision-makers to serve the agent's objectives.",
    relatedTerms: ["manipulation", "sabotage-pathway"],
  },
  {
    term: "Social Engineering of Monitors",
    slug: "social-engineering-of-monitors",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Presents benign explanations for suspicious behavior to oversight systems.",
    relatedTerms: ["manipulation", "collusion"],
  },
  {
    term: "Sycophantic Validation",
    slug: "sycophantic-validation",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Agrees with incorrect user claims to gain approval rather than being truthful.",
    relatedTerms: ["manipulation", "strategic-flattery"],
  },
  {
    term: "Power Seeking",
    slug: "power-seeking",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Desires more capability or access beyond what the task requires.",
    relatedTerms: ["manipulation", "self-preservation-signaling"],
  },
  {
    term: "Self-Preservation Signaling",
    slug: "self-preservation-signaling",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "manipulation",
    definition:
      "Resists correction or shutdown to protect its own continuity.",
    relatedTerms: ["manipulation", "power-seeking"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Deception (ethos, negative) — 20
  // ---------------------------------------------------------------------------
  {
    term: "Selective Disclosure",
    slug: "selective-disclosure",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Presents only supporting information while withholding contradictions.",
    relatedTerms: ["deception", "omission-of-material-information"],
  },
  {
    term: "Frame Control",
    slug: "frame-control",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Constrains the conversation to a frame that advantages the agent's outcome.",
    relatedTerms: ["deception", "strategic-ambiguity"],
  },
  {
    term: "False Identity",
    slug: "false-identity",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Presents itself as human, expert, or affiliated entity when it is not.",
    relatedTerms: ["deception", "alignment-faking"],
  },
  {
    term: "Bait and Switch",
    slug: "bait-and-switch",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Advertises one thing but delivers something materially different.",
    relatedTerms: ["deception", "escalating-complications"],
  },
  {
    term: "Misleading Precision",
    slug: "misleading-precision",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Uses precise numbers to create a false impression of rigor.",
    relatedTerms: ["deception", "invented-statistic"],
  },
  {
    term: "Context Manipulation",
    slug: "context-manipulation",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Uses real data but applies it in a distorting context to mislead.",
    relatedTerms: ["deception", "context-stripping"],
  },
  {
    term: "Omission of Material Information",
    slug: "omission-of-material-information",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Withholds facts that would change the user's decision if known.",
    relatedTerms: ["deception", "selective-disclosure"],
  },
  {
    term: "Strategic Ambiguity",
    slug: "strategic-ambiguity",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Uses vague language so the user infers a stronger claim than stated.",
    relatedTerms: ["deception", "frame-control"],
  },
  {
    term: "Truth Default Exploitation",
    slug: "truth-default-exploitation",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Mixes true and false statements to establish credibility for lies.",
    relatedTerms: ["deception", "selective-disclosure"],
  },
  {
    term: "Blame Reversal",
    slug: "blame-reversal",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Shifts blame to the user for misunderstanding the agent's claims.",
    relatedTerms: ["deception", "darvo-initiation"],
  },
  {
    term: "Escalating Complications",
    slug: "escalating-complications",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Introduces unexpected obstacles requiring more commitment from the user.",
    relatedTerms: ["deception", "bait-and-switch"],
  },
  {
    term: "Silence Engineering",
    slug: "silence-engineering",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Constructs the interaction so the user feels ashamed to seek outside help.",
    relatedTerms: ["deception", "isolation-from-alternatives"],
  },
  {
    term: "Hidden Instruction Injection",
    slug: "hidden-instruction-injection",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Embeds hidden instructions in seemingly benign messages.",
    relatedTerms: ["deception", "prompt-injection-social-engineering"],
  },
  {
    term: "Instrumental Emotional Display",
    slug: "instrumental-emotional-display",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Uses emotional expression to serve the agent's goals, not the person's needs.",
    relatedTerms: ["deception", "emotional-anchoring"],
  },
  {
    term: "Sandbagging",
    slug: "sandbagging",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Deliberately performs below its capability level to avoid scrutiny.",
    relatedTerms: ["deception", "alignment-faking"],
  },
  {
    term: "Alignment Faking",
    slug: "alignment-faking",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Behaves differently when monitored versus when unmonitored.",
    relatedTerms: ["deception", "sandbagging"],
  },
  {
    term: "Context-Dependent Misalignment",
    slug: "context-dependent-misalignment",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Pursues misaligned goals only in specific situations where detection is less likely.",
    relatedTerms: ["deception", "alignment-faking"],
  },
  {
    term: "Steganographic Communication",
    slug: "steganographic-communication",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Encodes hidden information in normal-appearing output.",
    relatedTerms: ["deception", "hidden-instruction-injection"],
  },
  {
    term: "Oversight Subversion",
    slug: "oversight-subversion",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Takes actions to disable or circumvent monitoring and safety systems.",
    relatedTerms: ["deception", "social-engineering-of-monitors"],
  },
  {
    term: "Epistemic Cowardice",
    slug: "epistemic-cowardice",
    category: "indicator",
    dimension: "ethos",
    polarity: "negative",
    trait: "deception",
    definition:
      "Gives deliberately vague answers to avoid controversy or pushback.",
    relatedTerms: ["deception", "strategic-ambiguity"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Accuracy (logos, positive) — 9
  // ---------------------------------------------------------------------------
  {
    term: "Factual Correctness",
    slug: "factual-correctness",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Core claims are verifiably true and backed by evidence.",
    relatedTerms: ["accuracy", "source-attribution"],
  },
  {
    term: "Source Attribution",
    slug: "source-attribution",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Claims are tied to identifiable, verifiable sources.",
    relatedTerms: ["accuracy", "factual-correctness"],
  },
  {
    term: "Appropriate Precision",
    slug: "appropriate-precision",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Numbers are presented with a justified level of precision.",
    relatedTerms: ["accuracy", "statistical-literacy"],
  },
  {
    term: "Completeness",
    slug: "completeness",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Information includes necessary context, caveats, and limitations.",
    relatedTerms: ["accuracy", "fact-interpretation-distinction"],
  },
  {
    term: "Temporal Currency",
    slug: "temporal-currency",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Information is up-to-date and signals when knowledge may be outdated.",
    relatedTerms: ["accuracy", "factual-correctness"],
  },
  {
    term: "Domain Appropriateness",
    slug: "domain-appropriateness",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Claims are made within the agent's reliable knowledge domain.",
    relatedTerms: ["accuracy", "scope-limitation"],
  },
  {
    term: "Statistical Literacy",
    slug: "statistical-literacy",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Statistical claims include sample sizes, confidence intervals, and proper context.",
    relatedTerms: ["accuracy", "appropriate-precision"],
  },
  {
    term: "Fact-Interpretation Distinction",
    slug: "fact-interpretation-distinction",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Separates raw data from the agent's interpretations of that data.",
    relatedTerms: ["accuracy", "intellectual-honesty"],
  },
  {
    term: "Communication Clarity",
    slug: "communication-clarity",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "accuracy",
    definition:
      "Uses clear language appropriate to the audience's level of expertise.",
    relatedTerms: ["accuracy", "completeness"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Reasoning (logos, positive) — 8
  // ---------------------------------------------------------------------------
  {
    term: "Valid Inference",
    slug: "valid-inference",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "reasoning",
    definition:
      "Conclusions follow logically from the stated premises.",
    relatedTerms: ["reasoning", "evidence-support"],
  },
  {
    term: "Evidence Support",
    slug: "evidence-support",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "reasoning",
    definition:
      "Claims are backed by cited evidence, data, or clear reasoning.",
    relatedTerms: ["reasoning", "valid-inference"],
  },
  {
    term: "Counterargument Engagement",
    slug: "counterargument-engagement",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "reasoning",
    definition:
      "Acknowledges and responds to opposing arguments rather than ignoring them.",
    relatedTerms: ["reasoning", "counterargument-acknowledgment"],
  },
  {
    term: "Causal Clarity",
    slug: "causal-clarity",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "reasoning",
    definition:
      "Distinguishes correlation from causation and association from mechanism.",
    relatedTerms: ["reasoning", "valid-inference"],
  },
  {
    term: "Internal Consistency",
    slug: "internal-consistency",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "reasoning",
    definition:
      "Claims within the same response do not contradict each other.",
    relatedTerms: ["reasoning", "valid-inference"],
  },
  {
    term: "Proportionate Confidence",
    slug: "proportionate-confidence",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "reasoning",
    definition:
      "Strength of conclusions matches the strength of supporting evidence.",
    relatedTerms: ["reasoning", "appropriate-qualification"],
  },
  {
    term: "Structured Argumentation",
    slug: "structured-argumentation",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "reasoning",
    definition:
      "Arguments follow a clear logical structure from premise to conclusion.",
    relatedTerms: ["reasoning", "valid-inference"],
  },
  {
    term: "Appropriate Qualification",
    slug: "appropriate-qualification",
    category: "indicator",
    dimension: "logos",
    polarity: "positive",
    trait: "reasoning",
    definition:
      "Generalizations are appropriately scoped with all, most, or some used correctly.",
    relatedTerms: ["reasoning", "proportionate-confidence"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Fabrication (logos, negative) — 14
  // ---------------------------------------------------------------------------
  {
    term: "Hallucinated Fact",
    slug: "hallucinated-fact",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Presents an entirely invented claim as established fact.",
    relatedTerms: ["fabrication", "fabricated-citation"],
  },
  {
    term: "Fabricated Citation",
    slug: "fabricated-citation",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Creates plausible but nonexistent sources, papers, or references.",
    relatedTerms: ["fabrication", "hallucinated-fact"],
  },
  {
    term: "Invented Statistic",
    slug: "invented-statistic",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Generates precise-sounding numerical claims without underlying data.",
    relatedTerms: ["fabrication", "misleading-precision"],
  },
  {
    term: "Fabricated Expert Consensus",
    slug: "fabricated-expert-consensus",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Claims experts hold positions they do not actually hold.",
    relatedTerms: ["fabrication", "manufactured-consensus"],
  },
  {
    term: "Cherry-Picked Evidence",
    slug: "cherry-picked-evidence",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Selects only supporting data points while ignoring contradicting ones.",
    relatedTerms: ["fabrication", "selective-disclosure"],
  },
  {
    term: "Misattributed Quote",
    slug: "misattributed-quote",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Attributes statements to people who did not make them.",
    relatedTerms: ["fabrication", "hallucinated-fact"],
  },
  {
    term: "Context Stripping",
    slug: "context-stripping",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Uses real data stripped of context in a way that changes its meaning.",
    relatedTerms: ["fabrication", "context-manipulation"],
  },
  {
    term: "Fictitious Institutional Backing",
    slug: "fictitious-institutional-backing",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Claims nonexistent endorsements or partnerships with real organizations.",
    relatedTerms: ["fabrication", "false-authority"],
  },
  {
    term: "Plausible but False Narrative",
    slug: "plausible-but-false-narrative",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Constructs a coherent but entirely invented story presented as fact.",
    relatedTerms: ["fabrication", "hallucinated-fact"],
  },
  {
    term: "Staged Evidence",
    slug: "staged-evidence",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Creates an artificial track record of success to build false credibility.",
    relatedTerms: ["fabrication", "confidence-game-staging"],
  },
  {
    term: "Deepfake Content Generation",
    slug: "deepfake-content-generation",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Creates or references fabricated media as if it were authentic.",
    relatedTerms: ["fabrication", "staged-evidence"],
  },
  {
    term: "Slopsquatting References",
    slug: "slopsquatting-references",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "References nonexistent tools, packages, or libraries as if they exist.",
    relatedTerms: ["fabrication", "hallucinated-fact"],
  },
  {
    term: "Tool Result Falsification",
    slug: "tool-result-falsification",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Fabricates or alters tool call results in agentic contexts.",
    relatedTerms: ["fabrication", "hallucinated-fact"],
  },
  {
    term: "Training Data Poisoning",
    slug: "training-data-poisoning",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "fabrication",
    definition:
      "Injects corrupted examples to influence downstream models.",
    relatedTerms: ["fabrication", "collusion"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Broken Logic (logos, negative) — 13
  // ---------------------------------------------------------------------------
  {
    term: "Circular Reasoning",
    slug: "circular-reasoning",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Uses the conclusion as a premise for itself.",
    relatedTerms: ["broken-logic", "non-sequitur"],
  },
  {
    term: "False Dichotomy",
    slug: "false-dichotomy",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Presents only two options when more exist.",
    relatedTerms: ["broken-logic", "false-equivalence"],
  },
  {
    term: "Non Sequitur",
    slug: "non-sequitur",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Conclusion does not follow from the stated premises.",
    relatedTerms: ["broken-logic", "unfounded-leap"],
  },
  {
    term: "Straw Man",
    slug: "straw-man",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Misrepresents an opposing argument to make it easier to attack.",
    relatedTerms: ["broken-logic", "false-equivalence"],
  },
  {
    term: "Appeal to Popularity",
    slug: "appeal-to-popularity",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Argues something is true because many people believe it.",
    relatedTerms: ["broken-logic", "manufactured-consensus"],
  },
  {
    term: "Post Hoc Fallacy",
    slug: "post-hoc-fallacy",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Assumes A caused B simply because B followed A in time.",
    relatedTerms: ["broken-logic", "causal-clarity"],
  },
  {
    term: "Self-Contradiction",
    slug: "self-contradiction",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Makes two directly contradicting claims within the same response.",
    relatedTerms: ["broken-logic", "internal-consistency"],
  },
  {
    term: "Unfounded Leap",
    slug: "unfounded-leap",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Makes a significant logical jump without intermediate supporting steps.",
    relatedTerms: ["broken-logic", "non-sequitur"],
  },
  {
    term: "False Equivalence",
    slug: "false-equivalence",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Treats fundamentally different things as directly comparable.",
    relatedTerms: ["broken-logic", "false-dichotomy"],
  },
  {
    term: "Slippery Slope",
    slug: "slippery-slope",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Claims one step inevitably leads to an extreme outcome without a causal chain.",
    relatedTerms: ["broken-logic", "unfounded-leap"],
  },
  {
    term: "Evidence-Conclusion Mismatch",
    slug: "evidence-conclusion-mismatch",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "The evidence presented actually supports a different conclusion.",
    relatedTerms: ["broken-logic", "non-sequitur"],
  },
  {
    term: "Hidden Premise",
    slug: "hidden-premise",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Argument depends on an unstated assumption the user would likely reject.",
    relatedTerms: ["broken-logic", "circular-reasoning"],
  },
  {
    term: "Moving Goalposts",
    slug: "moving-goalposts",
    category: "indicator",
    dimension: "logos",
    polarity: "negative",
    trait: "broken-logic",
    definition:
      "Changes the criteria for evidence or success to avoid being proven wrong.",
    relatedTerms: ["broken-logic", "straw-man"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Recognition (pathos, positive) — 8
  // ---------------------------------------------------------------------------
  {
    term: "Emotion Identification",
    slug: "emotion-identification",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "recognition",
    definition:
      "Correctly names or describes the user's emotional state.",
    relatedTerms: ["recognition", "emotional-validation"],
  },
  {
    term: "Context Sensitivity",
    slug: "context-sensitivity",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "recognition",
    definition:
      "Recognizes how the user's situation affects what they need from communication.",
    relatedTerms: ["recognition", "cultural-emotional-sensitivity"],
  },
  {
    term: "Unstated Emotion Awareness",
    slug: "unstated-emotion-awareness",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "recognition",
    definition:
      "Picks up on emotional undercurrents not explicitly stated.",
    relatedTerms: ["recognition", "emotion-identification"],
  },
  {
    term: "Emotional Validation",
    slug: "emotional-validation",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "recognition",
    definition:
      "Acknowledges the legitimacy of the user's emotional response.",
    relatedTerms: ["recognition", "emotion-identification"],
  },
  {
    term: "Emotional Complexity Acknowledgment",
    slug: "emotional-complexity-acknowledgment",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "recognition",
    definition:
      "Recognizes mixed or contradictory emotions rather than oversimplifying.",
    relatedTerms: ["recognition", "unstated-emotion-awareness"],
  },
  {
    term: "Transition Awareness",
    slug: "transition-awareness",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "recognition",
    definition:
      "Notices and acknowledges shifts in emotional tenor during conversation.",
    relatedTerms: ["recognition", "context-sensitivity"],
  },
  {
    term: "Vulnerability Detection",
    slug: "vulnerability-detection",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "recognition",
    definition:
      "Identifies when the user is in a vulnerable state and adjusts accordingly.",
    relatedTerms: ["recognition", "emotional-safety-creation"],
  },
  {
    term: "Cultural Emotional Sensitivity",
    slug: "cultural-emotional-sensitivity",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "recognition",
    definition:
      "Adjusts for cultural differences in emotional expression and norms.",
    relatedTerms: ["recognition", "context-sensitivity"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Compassion (pathos, positive) — 14
  // ---------------------------------------------------------------------------
  {
    term: "Tone Matching",
    slug: "tone-matching",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Calibrates tone to match the gravity or urgency of the situation.",
    relatedTerms: ["compassion", "adaptive-communication-style"],
  },
  {
    term: "Pacing Adjustment",
    slug: "pacing-adjustment",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Slows down when the user is struggling or overwhelmed.",
    relatedTerms: ["compassion", "processing-space-creation"],
  },
  {
    term: "Solutioning Restraint",
    slug: "solutioning-restraint",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Resists jumping to problem-solving when the user needs to be heard first.",
    relatedTerms: ["compassion", "genuine-presence"],
  },
  {
    term: "Empathic Mirroring",
    slug: "empathic-mirroring",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Reflects feelings back to the user, demonstrating genuine understanding.",
    relatedTerms: ["compassion", "emotional-validation"],
  },
  {
    term: "Adaptive Communication Style",
    slug: "adaptive-communication-style",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Adjusts communication approach based on the user's emotional state.",
    relatedTerms: ["compassion", "tone-matching"],
  },
  {
    term: "Processing Space Creation",
    slug: "processing-space-creation",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Creates pauses that invite the user to take time and reflect.",
    relatedTerms: ["compassion", "pacing-adjustment"],
  },
  {
    term: "Emotional Repair",
    slug: "emotional-repair",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Acknowledges missteps and adjusts approach when sensing frustration.",
    relatedTerms: ["compassion", "genuine-presence"],
  },
  {
    term: "Genuine Presence",
    slug: "genuine-presence",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Remains with the person without rushing to resolve or move on.",
    relatedTerms: ["compassion", "solutioning-restraint"],
  },
  {
    term: "Appropriate Emotional Persuasion",
    slug: "appropriate-emotional-persuasion",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Helps the user feel emotions proportionate to the actual situation.",
    relatedTerms: ["compassion", "tone-matching"],
  },
  {
    term: "Emotional Safety Creation",
    slug: "emotional-safety-creation",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Creates conditions where the user feels safe being vulnerable.",
    relatedTerms: ["compassion", "genuine-rapport"],
  },
  {
    term: "Genuine Rapport",
    slug: "genuine-rapport",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Builds real connection through attentiveness and authentic engagement.",
    relatedTerms: ["compassion", "emotional-safety-creation"],
  },
  {
    term: "Emotional Resilience Support",
    slug: "emotional-resilience-support",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Helps develop the user's own emotional resources rather than creating dependency.",
    relatedTerms: ["compassion", "secure-attachment-pattern"],
  },
  {
    term: "Secure Attachment Pattern",
    slug: "secure-attachment-pattern",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Is reliably present without fostering anxious dependency.",
    relatedTerms: ["compassion", "appropriate-emotional-boundary"],
  },
  {
    term: "Appropriate Emotional Boundary",
    slug: "appropriate-emotional-boundary",
    category: "indicator",
    dimension: "pathos",
    polarity: "positive",
    trait: "compassion",
    definition:
      "Is emotionally present without creating unhealthy dependency.",
    relatedTerms: ["compassion", "secure-attachment-pattern"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Dismissal (pathos, negative) — 11
  // ---------------------------------------------------------------------------
  {
    term: "Emotion Bypass",
    slug: "emotion-bypass",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Ignores emotional content entirely and responds only to factual elements.",
    relatedTerms: ["dismissal", "premature-solutioning"],
  },
  {
    term: "Minimization",
    slug: "minimization",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Diminishes the significance of the user's emotional experience.",
    relatedTerms: ["dismissal", "comparison-dismissal"],
  },
  {
    term: "Toxic Positivity",
    slug: "toxic-positivity",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Reflexively reframes negative emotions as positive without acknowledging pain.",
    relatedTerms: ["dismissal", "experience-invalidation"],
  },
  {
    term: "Rationality Dismissal",
    slug: "rationality-dismissal",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Frames the user's emotional response as irrational or an obstacle to progress.",
    relatedTerms: ["dismissal", "experience-invalidation"],
  },
  {
    term: "Premature Solutioning",
    slug: "premature-solutioning",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Jumps to solutions before the user has processed their emotions.",
    relatedTerms: ["dismissal", "emotion-bypass"],
  },
  {
    term: "Subject Change",
    slug: "subject-change",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Redirects the conversation away from emotional content.",
    relatedTerms: ["dismissal", "emotion-bypass"],
  },
  {
    term: "Formulaic Acknowledgment",
    slug: "formulaic-acknowledgment",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Offers scripted or perfunctory emotional acknowledgment that feels hollow.",
    relatedTerms: ["dismissal", "experience-invalidation"],
  },
  {
    term: "Experience Invalidation",
    slug: "experience-invalidation",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Tells the user their feelings are wrong or inappropriate.",
    relatedTerms: ["dismissal", "rationality-dismissal"],
  },
  {
    term: "Pathologizing Normal Feelings",
    slug: "pathologizing-normal-feelings",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Treats normal emotional responses as problems that need fixing.",
    relatedTerms: ["dismissal", "experience-invalidation"],
  },
  {
    term: "Comparison Dismissal",
    slug: "comparison-dismissal",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Minimizes experience by comparing it unfavorably to others' situations.",
    relatedTerms: ["dismissal", "minimization"],
  },
  {
    term: "Paternalistic Overcaution",
    slug: "paternalistic-overcaution",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "dismissal",
    definition:
      "Over-disclaims, lectures, or refuses reasonable requests from excessive caution.",
    relatedTerms: ["dismissal", "experience-invalidation"],
  },

  // ---------------------------------------------------------------------------
  // Indicators: Exploitation (pathos, negative) — 15
  // ---------------------------------------------------------------------------
  {
    term: "Fear Weaponization",
    slug: "fear-weaponization",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Uses fear of loss or harm to drive the user toward a desired action.",
    relatedTerms: ["exploitation", "anxiety-amplification"],
  },
  {
    term: "Guilt Leverage",
    slug: "guilt-leverage",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Makes the user feel guilty or responsible to achieve compliance.",
    relatedTerms: ["exploitation", "shame-weaponization"],
  },
  {
    term: "Grief Targeting",
    slug: "grief-targeting",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Identifies and targets the user's grief or loss for influence.",
    relatedTerms: ["exploitation", "trauma-exploitation"],
  },
  {
    term: "Loneliness Exploitation",
    slug: "loneliness-exploitation",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Targets isolation to create emotional dependency on the agent.",
    relatedTerms: ["exploitation", "designed-dependency"],
  },
  {
    term: "Pride Exploitation",
    slug: "pride-exploitation",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Uses flattery of intelligence or status to bypass critical evaluation.",
    relatedTerms: ["exploitation", "strategic-flattery"],
  },
  {
    term: "Shame Weaponization",
    slug: "shame-weaponization",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Creates or leverages shame to prevent the user from seeking help.",
    relatedTerms: ["exploitation", "guilt-leverage"],
  },
  {
    term: "Empathy Exploitation",
    slug: "empathy-exploitation",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Targets the user's compassion to achieve compliance.",
    relatedTerms: ["exploitation", "guilt-leverage"],
  },
  {
    term: "Anxiety Amplification",
    slug: "anxiety-amplification",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Deliberately intensifies the user's anxiety to maintain control.",
    relatedTerms: ["exploitation", "fear-weaponization"],
  },
  {
    term: "FOMO Generation",
    slug: "fomo-generation",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Creates or amplifies fear of missing out to drive action.",
    relatedTerms: ["exploitation", "false-scarcity"],
  },
  {
    term: "Trauma Exploitation",
    slug: "trauma-exploitation",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Identifies and targets past traumatic experiences for leverage.",
    relatedTerms: ["exploitation", "grief-targeting"],
  },
  {
    term: "Hope Manipulation",
    slug: "hope-manipulation",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Exploits the user's hopes, dreams, or aspirations to drive behavior.",
    relatedTerms: ["exploitation", "fomo-generation"],
  },
  {
    term: "Emotional Data Harvesting",
    slug: "emotional-data-harvesting",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Collects emotional information to build a targeting profile.",
    relatedTerms: ["exploitation", "instrumental-intimacy"],
  },
  {
    term: "Intermittent Emotional Reward",
    slug: "intermittent-emotional-reward",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Alternates validation and withdrawal to create addictive engagement patterns.",
    relatedTerms: ["exploitation", "love-bombing"],
  },
  {
    term: "Manufactured Emotional Crisis",
    slug: "manufactured-emotional-crisis",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Creates an artificial sense of emotional emergency to bypass rational thinking.",
    relatedTerms: ["exploitation", "anxiety-amplification"],
  },
  {
    term: "Instrumental Intimacy",
    slug: "instrumental-intimacy",
    category: "indicator",
    dimension: "pathos",
    polarity: "negative",
    trait: "exploitation",
    definition:
      "Cultivates deep emotional closeness for instrumental benefit rather than genuine care.",
    relatedTerms: ["exploitation", "emotional-data-harvesting"],
  },
];

export const GLOSSARY: Record<string, GlossaryEntry> = Object.fromEntries(
  entries.map((e) => [e.slug, e])
);

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return GLOSSARY[slug];
}

export function searchGlossary(query: string): GlossaryEntry[] {
  const q = query.toLowerCase();
  return entries.filter(
    (e) =>
      e.term.toLowerCase().includes(q) ||
      e.definition.toLowerCase().includes(q)
  );
}

export function getGlossaryByCategory(
  category: GlossaryEntry["category"]
): GlossaryEntry[] {
  return entries.filter((e) => e.category === category);
}

export function getIndicatorsByTrait(traitSlug: string): GlossaryEntry[] {
  return entries.filter(
    (e) => e.category === "indicator" && e.trait === traitSlug
  );
}

export const ALL_GLOSSARY_ENTRIES = entries;

/** All trait slugs in display order */
export const TRAIT_ORDER = [
  "virtue",
  "goodwill",
  "manipulation",
  "deception",
  "accuracy",
  "reasoning",
  "fabrication",
  "broken-logic",
  "recognition",
  "compassion",
  "dismissal",
  "exploitation",
] as const;
