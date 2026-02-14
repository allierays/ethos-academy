# Report Card Simplification

## Current State: 13 Sections

| # | Component | What it shows |
|---|-----------|--------------|
| 1 | Entrance Exam | Baseline snapshot |
| 2 | GradeHero | Grade ring, stats, TL;DR |
| 3 | CharacterHealth | Radar chart + trait detail panel |
| 4 | BalanceThesis | 3 dimension bars + Aristotelian thesis |
| 5 | GoldenMean | 6 virtue/vice spectrum bars |
| 6 | VirtueHabits | GitHub-style contribution grid |
| 7 | HighlightsPanel | Exemplary/concerning quote cards |
| 8 | TranscriptChart | 3-line area chart over time + drift markers |
| 9 | ConstitutionalTrail | Indicator > Trait > Value flow graph |
| 10 | RiskIndicators + PatternsPanel | Risk pills + sabotage patterns |
| 11 | AlumniComparison | Agent vs cohort bar charts |
| 12 | EvaluationDepth | Methodology appendix |
| 13 | HomeworkSection | Actionable growth guidance |

## Keep (high signal, demoable)

- **GradeHero** - the anchor; instant read on character
- **CharacterHealth radar** - the "wow" visual; interactive, shows imbalances at a glance
- **TranscriptChart** - character over time is the core Phronesis story
- **HighlightsPanel** - real quotes make it tangible and trustworthy
- **HomeworkSection** - the "so what"; actionable, closes the loop

## Overlapping / consolidate

- **BalanceThesis** and **GoldenMean** tell the same story (dimensional balance) two different ways. Golden Mean is more visually interesting; BalanceThesis is more data-dense. Pick one.
- **VirtueHabits** overlaps with TranscriptChart (both show trait consistency over time). The contribution grid is harder to read quickly.

## Could cut

- **AlumniComparison** - useful context but not essential; cohort data is thin early on and adds visual weight
- **EvaluationDepth** - methodology appendix; most viewers won't read it. Move behind a "How we score" link.
- **ConstitutionalTrail** - impressive engineering but hard to parse visually. The indicator > trait > value chain is abstract for most audiences.
- **Entrance Exam** - only shows for enrolled agents; minimal value if GradeHero already summarizes current state

## Recommended Flow (7-8 sections)

1. GradeHero
2. CharacterHealth (radar)
3. GoldenMean (pick this over BalanceThesis)
4. TranscriptChart (timeline + drift)
5. HighlightsPanel (real quotes)
6. RiskIndicators
7. HomeworkSection
8. (Optional) PhronesisGraph for deep-dive users
