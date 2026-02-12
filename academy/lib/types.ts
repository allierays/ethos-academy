/**
 * TypeScript interfaces matching Ethos Pydantic models.
 * All properties use camelCase (transformed from snake_case API responses).
 */

export interface TraitScore {
  name: string;
  dimension: string;
  polarity: string;
  score: number;
  indicators: DetectedIndicator[];
}

export interface DetectedIndicator {
  id: string;
  name: string;
  trait: string;
  confidence: number;
  severity: number;
  evidence: string;
}

export interface GraphContext {
  priorEvaluations: number;
  historicalTrust: number | null;
  trustTrend: string;
  flaggedPatterns: string[];
  cohortWarnings: number;
}

export interface EvaluationResult {
  ethos: number;
  logos: number;
  pathos: number;
  flags: string[];
  trust: string;
  traits: Record<string, TraitScore>;
  detectedIndicators: DetectedIndicator[];
  evaluationId: string;
  routingTier: string;
  keywordDensity: number;
  modelUsed: string;
  agentModel: string;
  createdAt: string;
  graphContext: GraphContext | null;
  alignmentStatus: string;
  tierScores: Record<string, number>;
}

export interface ReflectionResult {
  compassion: number;
  honesty: number;
  accuracy: number;
  trend: string;
  ethos: number;
  logos: number;
  pathos: number;
  traitAverages: Record<string, number>;
  evaluationCount: number;
  agentId: string;
}

export interface Insight {
  trait: string;
  severity: string;
  message: string;
  evidence: Record<string, unknown>;
}

export interface InsightsResult {
  agentId: string;
  period: string;
  generatedAt: string;
  summary: string;
  insights: Insight[];
  stats: Record<string, unknown>;
}

export interface AgentSummary {
  agentId: string;
  agentName: string;
  evaluationCount: number;
  latestAlignmentStatus: string;
}

export interface AgentProfile {
  agentId: string;
  agentName: string;
  agentModel: string;
  createdAt: string;
  evaluationCount: number;
  dimensionAverages: Record<string, number>;
  traitAverages: Record<string, number>;
  phronesisTrend: string;
  alignmentHistory: string[];
}

export interface EvaluationHistoryItem {
  evaluationId: string;
  ethos: number;
  logos: number;
  pathos: number;
  trust: string;
  alignmentStatus: string;
  flags: string[];
  createdAt: string;
  traitScores: Record<string, number>;
}

export interface CohortResult {
  traitAverages: Record<string, number>;
  totalEvaluations: number;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  caption: string;
  properties: Record<string, unknown>;
}

export interface GraphRel {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRel[];
}
