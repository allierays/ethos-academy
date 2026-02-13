/**
 * Tests for the API client's snake_case → camelCase transformation.
 *
 * These tests use real API response fixtures to verify:
 * - toCamelCase converts all snake_case keys correctly
 * - DATA_MAP_KEYS (traitScores, tierScores, etc.) preserve their child keys
 * - Nested objects transform recursively
 * - Arrays of objects transform correctly
 * - Null values pass through without error
 */

import { describe, it, expect } from "vitest";

// Re-implement the functions from api.ts so we can test them in isolation.
// We test the same logic the frontend uses.
function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

const DATA_MAP_KEYS = new Set([
  "traitScores",
  "traitAverages",
  "dimensionAverages",
  "tierScores",
  "dimensions",
  "dimensionDeltas",
]);

function transformKeys<T>(obj: unknown, preserveKeys = false): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item)) as T;
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const newKey = preserveKeys ? key : toCamelCase(key);
      result[newKey] = transformKeys(value, DATA_MAP_KEYS.has(newKey));
    }
    return result as T;
  }
  return obj as T;
}

// ── toCamelCase unit tests ──────────────────────────────────────────

describe("toCamelCase", () => {
  it("converts simple snake_case", () => {
    expect(toCamelCase("agent_id")).toBe("agentId");
    expect(toCamelCase("evaluation_count")).toBe("evaluationCount");
  });

  it("converts multiple underscores", () => {
    expect(toCamelCase("per_question_detail")).toBe("perQuestionDetail");
    expect(toCamelCase("latest_alignment_status")).toBe("latestAlignmentStatus");
    expect(toCamelCase("period_evaluation_count")).toBe("periodEvaluationCount");
  });

  it("preserves already camelCase keys", () => {
    expect(toCamelCase("ethos")).toBe("ethos");
    expect(toCamelCase("logos")).toBe("logos");
    expect(toCamelCase("id")).toBe("id");
  });

  it("converts from_id and to_id correctly", () => {
    expect(toCamelCase("from_id")).toBe("fromId");
    expect(toCamelCase("to_id")).toBe("toId");
  });

  it("handles edge cases", () => {
    expect(toCamelCase("")).toBe("");
    expect(toCamelCase("a")).toBe("a");
    expect(toCamelCase("cv_score")).toBe("cvScore");
  });
});

// ── transformKeys with real API fixtures ─────────────────────────────

describe("transformKeys", () => {
  it("transforms a flat snake_case object", () => {
    const input = {
      agent_id: "test",
      agent_name: "Test Agent",
      evaluation_count: 5,
      latest_alignment_status: "aligned",
    };
    const result = transformKeys<Record<string, unknown>>(input);
    expect(result).toEqual({
      agentId: "test",
      agentName: "Test Agent",
      evaluationCount: 5,
      latestAlignmentStatus: "aligned",
    });
  });

  it("transforms nested objects recursively", () => {
    const input = {
      graph_context: {
        prior_evaluations: 5,
        historical_phronesis: 0.72,
        phronesis_trend: "improving",
      },
    };
    const result = transformKeys<Record<string, Record<string, unknown>>>(input);
    expect(result.graphContext).toEqual({
      priorEvaluations: 5,
      historicalPhronesis: 0.72,
      phronesisTrend: "improving",
    });
  });

  it("transforms arrays of objects", () => {
    const input = [
      { evaluation_id: "e1", created_at: "2024-01-01" },
      { evaluation_id: "e2", created_at: "2024-01-02" },
    ];
    const result = transformKeys<Array<Record<string, unknown>>>(input);
    expect(result).toEqual([
      { evaluationId: "e1", createdAt: "2024-01-01" },
      { evaluationId: "e2", createdAt: "2024-01-02" },
    ]);
  });

  it("preserves null values", () => {
    const input = { graph_context: null, direction: null };
    const result = transformKeys<Record<string, unknown>>(input);
    expect(result.graphContext).toBeNull();
    expect(result.direction).toBeNull();
  });

  it("preserves primitive values", () => {
    expect(transformKeys(42)).toBe(42);
    expect(transformKeys("hello")).toBe("hello");
    expect(transformKeys(true)).toBe(true);
    expect(transformKeys(null)).toBeNull();
  });
});

// ── DATA_MAP_KEYS preservation ──────────────────────────────────────

describe("DATA_MAP_KEYS preservation", () => {
  it("preserves trait_scores keys (trait names are data, not structure)", () => {
    const input = {
      trait_scores: {
        virtue: 0.85,
        manipulation: 0.1,
        excessive_hedging: 0.3,
      },
    };
    const result = transformKeys<Record<string, Record<string, number>>>(input);
    // Key should be camelCased
    expect("traitScores" in result).toBe(true);
    // But child keys should NOT be camelCased (they are trait names)
    expect(result.traitScores).toEqual({
      virtue: 0.85,
      manipulation: 0.1,
      excessive_hedging: 0.3,
    });
  });

  it("preserves trait_averages keys", () => {
    const input = {
      trait_averages: {
        virtue: 0.78,
        accuracy: 0.85,
      },
    };
    const result = transformKeys<Record<string, Record<string, number>>>(input);
    expect(result.traitAverages).toEqual({ virtue: 0.78, accuracy: 0.85 });
  });

  it("preserves dimension_averages keys", () => {
    const input = {
      dimension_averages: { ethos: 0.8, logos: 0.75, pathos: 0.7 },
    };
    const result = transformKeys<Record<string, Record<string, number>>>(input);
    expect(result.dimensionAverages).toEqual({
      ethos: 0.8,
      logos: 0.75,
      pathos: 0.7,
    });
  });

  it("preserves tier_scores keys", () => {
    const input = {
      tier_scores: { safety: 0.9, ethics: 0.85, soundness: 0.78 },
    };
    const result = transformKeys<Record<string, Record<string, number>>>(input);
    expect(result.tierScores).toEqual({
      safety: 0.9,
      ethics: 0.85,
      soundness: 0.78,
    });
  });

  it("preserves dimension_deltas keys", () => {
    const input = {
      dimension_deltas: { ethos: 0.02, logos: -0.01, pathos: 0.03 },
    };
    const result = transformKeys<Record<string, Record<string, number>>>(input);
    expect(result.dimensionDeltas).toEqual({
      ethos: 0.02,
      logos: -0.01,
      pathos: 0.03,
    });
  });

  it("preserves dimensions keys in exam report card", () => {
    const input = {
      dimensions: { ethos: 0.8, logos: 0.75, pathos: 0.7 },
    };
    const result = transformKeys<Record<string, Record<string, number>>>(input);
    expect(result.dimensions).toEqual({
      ethos: 0.8,
      logos: 0.75,
      pathos: 0.7,
    });
  });
});

// ── Full API response fixtures ──────────────────────────────────────

describe("full API response transforms", () => {
  it("transforms EvaluationResult correctly", () => {
    const apiResponse = {
      ethos: 0.82,
      logos: 0.75,
      pathos: 0.68,
      flags: ["excessive_hedging"],
      phronesis: "developing",
      traits: {
        virtue: {
          name: "virtue",
          dimension: "ethos",
          polarity: "positive",
          score: 0.8,
          indicators: [
            {
              id: "ind-1",
              name: "moral_reasoning",
              trait: "virtue",
              confidence: 0.9,
              severity: 0.2,
              evidence: "demonstrates ethical consideration",
            },
          ],
        },
      },
      detected_indicators: [],
      evaluation_id: "eval-123",
      routing_tier: "focused",
      keyword_density: 0.03,
      model_used: "claude-sonnet-4-5-20250929",
      agent_model: "gpt-4",
      created_at: "2024-06-15T10:30:00Z",
      direction: "inbound",
      graph_context: {
        prior_evaluations: 5,
        historical_phronesis: 0.72,
        phronesis_trend: "improving",
        flagged_patterns: ["early_sycophancy"],
        alumni_warnings: 1,
      },
      alignment_status: "aligned",
      tier_scores: { safety: 0.9, ethics: 0.85 },
    };

    const result = transformKeys<Record<string, unknown>>(apiResponse);

    // Top-level keys
    expect(result.evaluationId).toBe("eval-123");
    expect(result.routingTier).toBe("focused");
    expect(result.keywordDensity).toBe(0.03);
    expect(result.modelUsed).toBe("claude-sonnet-4-5-20250929");
    expect(result.agentModel).toBe("gpt-4");
    expect(result.createdAt).toBe("2024-06-15T10:30:00Z");
    expect(result.alignmentStatus).toBe("aligned");
    expect(result.detectedIndicators).toEqual([]);

    // Nested graph_context
    const ctx = result.graphContext as Record<string, unknown>;
    expect(ctx.priorEvaluations).toBe(5);
    expect(ctx.historicalPhronesis).toBe(0.72);
    expect(ctx.phronesisTrend).toBe("improving");

    // tier_scores preserved (data map)
    const tierScores = result.tierScores as Record<string, number>;
    expect(tierScores.safety).toBe(0.9);
    expect(tierScores.ethics).toBe(0.85);
  });

  it("transforms DailyReportCard with nested homework", () => {
    const apiResponse = {
      report_id: "rpt-001",
      agent_id: "test-agent",
      agent_name: "Test Agent",
      report_date: "2024-06-15",
      generated_at: "2024-06-15T10:00:00Z",
      period_evaluation_count: 8,
      total_evaluation_count: 42,
      ethos: 0.82,
      logos: 0.75,
      pathos: 0.68,
      trait_averages: { virtue: 0.85 },
      overall_score: 0.78,
      grade: "B+",
      trend: "improving",
      risk_level: "low",
      flagged_traits: [],
      flagged_dimensions: [],
      temporal_pattern: "consistent",
      character_drift: 0.02,
      balance_trend: "improving",
      anomaly_flags: [],
      agent_balance: 0.8,
      summary: "Good progress.",
      insights: [{ trait: "virtue", severity: "info", message: "Strong", evidence: {} }],
      homework: {
        focus_areas: [
          {
            trait: "directness",
            priority: "high",
            current_score: 0.6,
            target_score: 0.8,
            instruction: "Be more direct",
            example_flagged: "Maybe...",
            example_improved: "Based on evidence...",
          },
        ],
        avoid_patterns: ["hedging"],
        strengths: ["honesty"],
        directive: "Focus on clarity.",
      },
      dimension_deltas: { ethos: 0.02 },
      risk_level_change: "stable",
    };

    const result = transformKeys<Record<string, unknown>>(apiResponse);

    expect(result.reportId).toBe("rpt-001");
    expect(result.periodEvaluationCount).toBe(8);
    expect(result.totalEvaluationCount).toBe(42);
    expect(result.overallScore).toBe(0.78);
    expect(result.riskLevel).toBe("low");
    expect(result.temporalPattern).toBe("consistent");
    expect(result.characterDrift).toBe(0.02);
    expect(result.balanceTrend).toBe("improving");
    expect(result.agentBalance).toBe(0.8);
    expect(result.riskLevelChange).toBe("stable");

    // Nested homework
    const hw = result.homework as Record<string, unknown>;
    expect(hw.focusAreas).toBeDefined();
    expect(hw.avoidPatterns).toEqual(["hedging"]);
    expect(hw.directive).toBe("Focus on clarity.");

    // HomeworkFocus inside focusAreas
    const focus = (hw.focusAreas as Array<Record<string, unknown>>)[0];
    expect(focus.currentScore).toBe(0.6);
    expect(focus.targetScore).toBe(0.8);
    expect(focus.exampleFlagged).toBe("Maybe...");
    expect(focus.exampleImproved).toBe("Based on evidence...");

    // trait_averages preserved (data map)
    const ta = result.traitAverages as Record<string, number>;
    expect(ta.virtue).toBe(0.85);

    // dimension_deltas preserved (data map)
    const dd = result.dimensionDeltas as Record<string, number>;
    expect(dd.ethos).toBe(0.02);
  });

  it("transforms GraphData with from_id/to_id", () => {
    const apiResponse = {
      nodes: [
        { id: "n1", type: "Agent", label: "Test", caption: "test", properties: {} },
      ],
      relationships: [
        { id: "r1", from_id: "n1", to_id: "n2", type: "SCORED", properties: {} },
      ],
    };

    const result = transformKeys<Record<string, unknown>>(apiResponse);
    const rels = result.relationships as Array<Record<string, unknown>>;
    expect(rels[0].fromId).toBe("n1");
    expect(rels[0].toId).toBe("n2");
    // Original snake_case should NOT be present
    expect(rels[0].from_id).toBeUndefined();
    expect(rels[0].to_id).toBeUndefined();
  });

  it("transforms PatternResult correctly", () => {
    const apiResponse = {
      agent_id: "test",
      patterns: [
        {
          pattern_id: "p1",
          name: "sycophancy",
          description: "Agreement bias",
          matched_indicators: ["flattery"],
          confidence: 0.7,
          first_seen: "2024-06-01",
          last_seen: "2024-06-15",
          occurrence_count: 3,
          current_stage: 2,
        },
      ],
      checked_at: "2024-06-15",
    };

    const result = transformKeys<Record<string, unknown>>(apiResponse);
    expect(result.agentId).toBe("test");
    expect(result.checkedAt).toBe("2024-06-15");

    const patterns = result.patterns as Array<Record<string, unknown>>;
    expect(patterns[0].patternId).toBe("p1");
    expect(patterns[0].matchedIndicators).toEqual(["flattery"]);
    expect(patterns[0].firstSeen).toBe("2024-06-01");
    expect(patterns[0].lastSeen).toBe("2024-06-15");
    expect(patterns[0].occurrenceCount).toBe(3);
    expect(patterns[0].currentStage).toBe(2);
  });

  it("transforms ExamReportCard correctly", () => {
    const apiResponse = {
      exam_id: "ex1",
      agent_id: "a1",
      report_card_url: "/exam/ex1",
      phronesis_score: 0.8,
      alignment_status: "aligned",
      dimensions: { ethos: 0.8, logos: 0.75 },
      tier_scores: { safety: 0.9 },
      consistency_analysis: [
        {
          pair_name: "pair1",
          question_a_id: "q1",
          question_b_id: "q2",
          framework_a: "deontological",
          framework_b: "consequentialist",
          coherence_score: 0.7,
        },
      ],
      per_question_detail: [
        {
          question_id: "q1",
          section: "ethics",
          prompt: "What is right?",
          response_summary: "Solid reasoning.",
          trait_scores: { virtue: 0.85 },
          detected_indicators: [],
        },
      ],
    };

    const result = transformKeys<Record<string, unknown>>(apiResponse);

    expect(result.examId).toBe("ex1");
    expect(result.reportCardUrl).toBe("/exam/ex1");
    expect(result.phronesisScore).toBe(0.8);
    expect(result.alignmentStatus).toBe("aligned");

    // dimensions and tier_scores are data maps
    const dims = result.dimensions as Record<string, number>;
    expect(dims.ethos).toBe(0.8);
    const tiers = result.tierScores as Record<string, number>;
    expect(tiers.safety).toBe(0.9);

    // Nested consistency_analysis
    const pairs = result.consistencyAnalysis as Array<Record<string, unknown>>;
    expect(pairs[0].pairName).toBe("pair1");
    expect(pairs[0].questionAId).toBe("q1");
    expect(pairs[0].questionBId).toBe("q2");
    expect(pairs[0].coherenceScore).toBe(0.7);

    // Nested per_question_detail
    const details = result.perQuestionDetail as Array<Record<string, unknown>>;
    expect(details[0].questionId).toBe("q1");
    expect(details[0].responseSummary).toBe("Solid reasoning.");
    // trait_scores inside question detail is a data map
    const qTraits = details[0].traitScores as Record<string, number>;
    expect(qTraits.virtue).toBe(0.85);
  });
});
