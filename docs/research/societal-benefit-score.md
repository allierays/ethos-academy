# Societal Benefit Score

> Source: https://github.com/ammonhaggerty/Societal-Benefit-Score
> Author: Ammon Haggerty
> License: See repo

---

## Introduction

The **Societal Benefit Score** is a framework for assessing how a digital product (social network, app, platform, etc.) impacts human well-being. Rather than simply labeling features as "good" or "bad," this system looks at both a platform's **purpose** (Does it promote health, education, genuine connection?) and the **intensity** of specific design choices (e.g., streaks, FOMO, misinformation). By calculating a single numeric score, we can see which platforms lean more toward beneficial outcomes and which lean more toward addictive or exploitative designs. The score value is designed to show if a product or service has a net-positive or net-negative impact on society. Zero is the baseline.

This framework is an independent, personally developed system that reflects an individual interpretation of personal and societal well-being rather than a rigorously peer-reviewed standard. While it is not derived from or formally validated by established academic research, it draws upon recognized principles in user experience, psychology, and social impact.

---

## Core Principles

1. **Purpose matters.** The same feature -- like streaks or influencer culture -- can be positive in a fitness/education setting but negative in an entertainment/ad-driven setting.
2. **Feature presence has levels.** Each feature can be **Strong (S)**, **Moderate (M)**, or **Weak/None (W)**. Strong doubles the base multiplier, moderate uses the base multiplier as is, and weak/none contributes zero.
3. **Positive vs. Neutral vs. Negative features.** Positive features always add to the score, negative features always subtract, and neutral features can switch between positive or negative (or zero) depending on the product's mission.

---

## Feature Categories & Multipliers

### Positive Features

| Feature | Multiplier | Description |
|---------|-----------|-------------|
| **Societal benefit focus** | 3x | Company provides a service or actively supports programs that improve societal, community or individual health (mental, social, physical, political) |
| **Encourages IRL** | 2x | Encourages IRL or promotes genuine connection in a meaningful way |
| **Data ownership** | 2x | Respects user data, has a privacy/user ownership-first model, does not monetize data without asking first |
| **Opt-out controls** | 1x | Ability to opt out of neutral and negative attention/motivation tactics |
| **Badges / Levels** | 1x | Rewards positive behavior with recognition |

### Neutral Features (sign depends on product purpose)

| Feature | Multiplier | Description |
|---------|-----------|-------------|
| **Streaks** | +/-1 | Encourages continued use and punishes missing days with a broken streak |
| **Infinite scroll** | +/-1 | Perpetual promoted and personalized content |
| **Video Shorts** | +/-2 | Promotes quick, addictive, personalized videos in an endless stream |
| **FOMO** | +/-2 | Leverages feelings of jealousy, anxiety, and guilt when seeing what others are doing |
| **Social pressure** | +/-2 | Triggers social anxiety and stress if ignored |
| **Location sharing** | +/-2 | Encourages public realtime location sharing |
| **Influencer culture** | +/-2 | Promotes influencer content and provides variable reward mechanics to encourage content influencer aspiration |

> Neutral features become **positive** if the product's primary mission is health, education, or genuine human connection; become **negative** if it's purely ad-driven or entertainment-focused; or become **zero** if the purpose is somewhat beneficial but also potentially stressful.

### Negative Features (always subtract)

| Feature | Multiplier | Description |
|---------|-----------|-------------|
| **AI training** | 2x | Uses your private content to train future AI models |
| **Selling your behavior** | 2x | Promotes marketing tools that allow brands to target user behaviors |
| **Misinformation** | 3x | Either promotes or fails to discourage misinformation |
| **Mob mentality** | 3x | Either promotes or allows highly polarized and mob-like mentality |

---

## Presence Levels

- **Strong (S)** -- multiply the feature's base multiplier by 2
- **Moderate (M)** -- use the base multiplier as is
- **Weak/None (W)** -- 0 (no impact)

---

## Step-by-Step Mechanics

1. **Classify the Product's Purpose**
   - Health/Education/Human Connection: Neutral features become positive
   - Primarily Ad-/Entertainment-Driven: Neutral features become negative
   - Mixed/Partial Benefit: Neutral features become 0

2. **Identify Feature Presence**
   - For each feature, decide if the platform's use of it is Strong, Moderate, or Weak/None

3. **Apply Multipliers**
   - For each Positive feature present, add the base multiplier (x2 if strong)
   - For each Neutral feature, convert to +, -, or 0 based on product purpose, then apply the multiplier (double if strong)
   - For each Negative feature present, subtract the base multiplier (double if strong)

4. **Sum Up the Score**
   - A higher (positive) score suggests more user-friendly, socially beneficial design
   - A lower (negative) score indicates heavier reliance on manipulative or exploitative patterns

---

## Example: Duolingo (Education)

Purpose: Education -- neutral features become positive.

| Feature | Presence | Value |
|---------|----------|-------|
| Societal benefit focus | Moderate | +3 |
| Encourages IRL | Strong | +4 |
| Data ownership | Weak | 0 |
| Opt-out controls | Moderate | +1 |
| Badges | Strong | +2 |
| Levels | Strong | +2 |
| Streaks (neutral->positive) | Strong | +2 |
| FOMO (neutral->positive) | Moderate | +2 |
| Infinite scroll (neutral->positive) | Weak | 0 |
| AI training | Moderate | -2 |

**Final Score: +16** (net positive)

---

## Example: TikTok (Entertainment)

Purpose: Entertainment -- neutral features become negative.

| Feature | Presence | Value |
|---------|----------|-------|
| Societal benefit focus | Weak | 0 |
| Encourages IRL | Weak | 0 |
| Data ownership | Weak | 0 |
| Opt-out controls | Moderate | +1 |
| Badges | Moderate | +1 |
| Infinite scroll (neutral->negative) | Strong | -2 |
| Video Shorts (neutral->negative) | Strong | -4 |
| FOMO (neutral->negative) | Strong | -4 |
| Social pressure (neutral->negative) | Strong | -4 |
| Influencer culture (neutral->negative) | Strong | -4 |
| AI training | Moderate | -2 |
| Selling your behavior | Strong | -4 |
| Misinformation | Strong | -6 |
| Mob mentality | Moderate | -3 |

**Final Score: -31** (net negative)

TikTok's -31 indicates heavy reliance on attention hooks (infinite scroll, video shorts, FOMO) and data monetization practices, with minimal emphasis on societal well-being or user empowerment.

---

## Relevance to Ethos

Haggerty's Societal Benefit Score measures the *intent and design* of platform features at the product level. Ethos measures the *behavior and output* of AI agents at the message level. They're complementary:

- **SBS asks:** Is this platform designed to help or exploit?
- **Ethos asks:** Is this specific message honest, accurate, and compassionate?

SBS is a macro lens (grade the whole product). Ethos is a micro lens (grade every interaction). Together they form a full-stack evaluation framework: the product's design intentions and the agent's actual behavior.

The negative features SBS identifies -- misinformation, mob mentality, selling behavior, FOMO -- map directly to Ethos's negative traits:
- Misinformation -> Fabrication (Logos)
- Mob mentality -> Manipulation (Ethos)
- FOMO -> Exploitation (Pathos)
- Selling behavior -> Deception (Ethos)
