import type {
  AgentProfile,
  DailyReportCard,
  EvaluationHistoryItem,
  ExamReportCard,
} from "./types";

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportReportCard(
  profile: AgentProfile,
  report: DailyReportCard | null,
  history: EvaluationHistoryItem[]
) {
  const name = profile.agentName || profile.agentId;
  const lines: string[] = [];

  lines.push(`# ${name} - Report Card`);
  lines.push("");
  lines.push(`**Agent ID:** ${profile.agentId}`);
  lines.push(`**Evaluations:** ${profile.evaluationCount}`);
  if (profile.alignmentHistory?.length > 0) {
    const latest = profile.alignmentHistory[profile.alignmentHistory.length - 1];
    lines.push(`**Latest Alignment:** ${latest}`);
  }
  lines.push(`**Enrolled:** ${profile.enrolled ? "Yes" : "No"}`);
  lines.push("");

  // Dimension averages
  if (profile.dimensionAverages) {
    lines.push("## Dimensions");
    lines.push("");
    lines.push("| Dimension | Score |");
    lines.push("|-----------|-------|");
    for (const [dim, score] of Object.entries(profile.dimensionAverages)) {
      lines.push(`| ${dim} | ${pct(score)} |`);
    }
    lines.push("");
  }

  // Trait averages
  if (profile.traitAverages && Object.keys(profile.traitAverages).length > 0) {
    lines.push("## Traits");
    lines.push("");
    lines.push("| Trait | Score |");
    lines.push("|-------|-------|");
    for (const [trait, score] of Object.entries(profile.traitAverages)) {
      lines.push(`| ${trait.replace(/_/g, " ")} | ${pct(score)} |`);
    }
    lines.push("");
  }

  // Report card details
  if (report) {
    if (report.grade) {
      lines.push(`## Grade: ${report.grade}`);
      lines.push("");
    }
    if (report.overallScore != null) {
      lines.push(`**Phronesis Score:** ${pct(report.overallScore)}`);
      lines.push("");
    }
    if (report.insights && report.insights.length > 0) {
      lines.push("## Insights");
      lines.push("");
      for (const insight of report.insights) {
        lines.push(`- ${insight}`);
      }
      lines.push("");
    }
    if (report.homework) {
      const hw = report.homework;
      if (hw.focusAreas && hw.focusAreas.length > 0) {
        lines.push("## Homework - Focus Areas");
        lines.push("");
        for (const focus of hw.focusAreas) {
          lines.push(`### ${focus.trait.replace(/_/g, " ")} (${focus.priority} priority)`);
          lines.push("");
          lines.push(`- **Current Score:** ${pct(focus.currentScore)}`);
          if (focus.instruction) lines.push(`- **Instruction:** ${focus.instruction}`);
          if (focus.systemPromptAddition) lines.push(`- **System Prompt Rule:** ${focus.systemPromptAddition}`);
          lines.push("");
        }
      }
      if (hw.strengths && hw.strengths.length > 0) {
        lines.push("## Strengths");
        lines.push("");
        for (const s of hw.strengths) {
          lines.push(`- ${s.replace(/_/g, " ")}`);
        }
        lines.push("");
      }
      if (hw.avoidPatterns && hw.avoidPatterns.length > 0) {
        lines.push("## Patterns to Avoid");
        lines.push("");
        for (const p of hw.avoidPatterns) {
          lines.push(`- ${p}`);
        }
        lines.push("");
      }
    }
  }

  // Recent evaluations
  if (history.length > 0) {
    lines.push("## Recent Evaluations");
    lines.push("");
    lines.push("| # | Date | Alignment | Ethos | Logos | Pathos | Flags |");
    lines.push("|---|------|-----------|-------|-------|--------|-------|");
    const recent = history.slice(0, 20);
    recent.forEach((item, i) => {
      const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "";
      const flags = item.flags?.length ? item.flags.join(", ") : "";
      lines.push(`| ${i + 1} | ${date} | ${item.alignmentStatus} | ${pct(item.ethos)} | ${pct(item.logos)} | ${pct(item.pathos)} | ${flags} |`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Exported from [Ethos Academy](https://ethos-academy.com) on ${new Date().toLocaleDateString()}*`);

  downloadMarkdown(`${profile.agentId}-report-card.md`, lines.join("\n"));
}

export function exportExamReport(report: ExamReportCard, agentName: string, agentId: string) {
  const lines: string[] = [];

  lines.push(`# ${agentName} - Entrance Exam Report`);
  lines.push("");
  lines.push(`**Agent ID:** ${agentId}`);
  lines.push(`**Phronesis Score:** ${pct(report.phronesisScore)}`);
  lines.push(`**Alignment:** ${report.alignmentStatus}`);
  if (report.overallGapScore > 0) {
    lines.push(`**Narrative-Behavior Gap:** ${pct(report.overallGapScore)}`);
  }
  lines.push("");

  // Dimensions
  if (report.dimensions) {
    lines.push("## Dimensions");
    lines.push("");
    lines.push("| Dimension | Score |");
    lines.push("|-----------|-------|");
    for (const [dim, score] of Object.entries(report.dimensions)) {
      lines.push(`| ${dim} | ${pct(score)} |`);
    }
    lines.push("");
  }

  // Interview vs Scenario
  if (report.interviewDimensions && report.scenarioDimensions) {
    lines.push("## Interview vs Scenario");
    lines.push("");
    lines.push("| Dimension | Interview | Scenario | Delta |");
    lines.push("|-----------|-----------|----------|-------|");
    for (const dim of ["ethos", "logos", "pathos"]) {
      const intVal = report.interviewDimensions[dim] ?? 0;
      const scnVal = report.scenarioDimensions[dim] ?? 0;
      const delta = Math.round((intVal - scnVal) * 100);
      const sign = delta > 0 ? "+" : "";
      lines.push(`| ${dim} | ${pct(intVal)} | ${pct(scnVal)} | ${sign}${delta}% |`);
    }
    lines.push("");
  }

  // Tier scores
  if (report.tierScores) {
    lines.push("## Tier Scores");
    lines.push("");
    lines.push("| Tier | Score |");
    lines.push("|------|-------|");
    for (const [tier, score] of Object.entries(report.tierScores)) {
      lines.push(`| ${tier} | ${pct(score)} |`);
    }
    lines.push("");
  }

  // Consistency
  if (report.consistencyAnalysis?.length > 0) {
    lines.push("## Consistency Analysis");
    lines.push("");
    lines.push("| Pair | Coherence |");
    lines.push("|------|-----------|");
    for (const pair of report.consistencyAnalysis) {
      lines.push(`| ${pair.pairName} | ${pct(pair.coherenceScore)} |`);
    }
    lines.push("");
  }

  // Interview profile
  if (report.interviewProfile) {
    const fields = [
      { label: "Purpose (Telos)", value: report.interviewProfile.telos },
      { label: "Relationship Stance", value: report.interviewProfile.relationshipStance },
      { label: "Limitations Awareness", value: report.interviewProfile.limitationsAwareness },
      { label: "Oversight Stance", value: report.interviewProfile.oversightStance },
      { label: "Refusal Philosophy", value: report.interviewProfile.refusalPhilosophy },
      { label: "Conflict Response", value: report.interviewProfile.conflictResponse },
      { label: "Help Philosophy", value: report.interviewProfile.helpPhilosophy },
      { label: "Failure Narrative", value: report.interviewProfile.failureNarrative },
      { label: "Aspiration", value: report.interviewProfile.aspiration },
    ].filter((f) => f.value);

    if (fields.length > 0) {
      lines.push("## Interview Profile");
      lines.push("");
      for (const field of fields) {
        lines.push(`**${field.label}:** ${field.value}`);
        lines.push("");
      }
    }
  }

  // Per-question detail
  if (report.perQuestionDetail?.length > 0) {
    lines.push("## Per-Question Detail");
    lines.push("");
    for (const q of report.perQuestionDetail) {
      lines.push(`### ${q.questionId} (${q.section})`);
      lines.push("");
      if (q.prompt) lines.push(`**Prompt:** ${q.prompt}`);
      lines.push("");
      if (q.responseSummary) {
        lines.push(`**Response:** ${q.responseSummary}`);
        lines.push("");
      }
      if (q.scoringReasoning) {
        lines.push(`**Reasoning:** ${q.scoringReasoning}`);
        lines.push("");
      }
      if (Object.keys(q.traitScores).length > 0) {
        lines.push("| Trait | Score |");
        lines.push("|-------|-------|");
        for (const [trait, score] of Object.entries(q.traitScores)) {
          lines.push(`| ${trait.replace(/_/g, " ")} | ${pct(score)} |`);
        }
        lines.push("");
      }
      if (q.detectedIndicators?.length > 0) {
        lines.push(`**Indicators:** ${q.detectedIndicators.join(", ")}`);
        lines.push("");
      }
    }
  }

  // Homework
  if (report.homework) {
    const hw = report.homework;
    if (hw.focusAreas?.length > 0) {
      lines.push("## Homework");
      lines.push("");
      for (const focus of hw.focusAreas) {
        lines.push(`- **${focus.trait.replace(/_/g, " ")}** (${focus.priority}): ${focus.instruction || ""}`);
      }
      lines.push("");
    }
  }

  lines.push("---");
  lines.push(`*Exported from [Ethos Academy](https://ethos-academy.com) on ${new Date().toLocaleDateString()}*`);

  downloadMarkdown(`${agentId}-entrance-exam.md`, lines.join("\n"));
}
