/**
 * Typed API client for the Ethos backend.
 * Transforms snake_case responses to camelCase TypeScript interfaces.
 */

import type {
  AgentProfile,
  AgentSummary,
  CohortResult,
  EvaluationHistoryItem,
  EvaluationResult,
  InsightsResult,
  ReflectionResult,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8917";

/**
 * Recursively transform snake_case keys to camelCase.
 */
function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformKeys<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item)) as T;
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toCamelCase(key)] = transformKeys(value);
    }
    return result as T;
  }
  return obj as T;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return transformKeys<T>(data);
}

/**
 * Score a message for honesty, accuracy, and intent.
 */
export async function evaluate(
  text: string,
  source?: string
): Promise<EvaluationResult> {
  return fetchApi<EvaluationResult>("/evaluate", {
    method: "POST",
    body: JSON.stringify({ text, source: source ?? null }),
  });
}

/**
 * Score your own agent's outgoing message and return its profile.
 */
export async function reflect(
  agentId: string,
  text?: string
): Promise<ReflectionResult> {
  return fetchApi<ReflectionResult>("/reflect", {
    method: "POST",
    body: JSON.stringify({ agent_id: agentId, text: text ?? null }),
  });
}

/**
 * List all agents with evaluation summaries.
 */
export async function getAgents(): Promise<AgentSummary[]> {
  return fetchApi<AgentSummary[]>("/agents");
}

/**
 * Get a single agent's profile.
 */
export async function getAgent(agentId: string): Promise<AgentProfile> {
  return fetchApi<AgentProfile>(`/agent/${encodeURIComponent(agentId)}`);
}

/**
 * Get evaluation history for an agent.
 */
export async function getHistory(
  agentId: string
): Promise<EvaluationHistoryItem[]> {
  return fetchApi<EvaluationHistoryItem[]>(
    `/agent/${encodeURIComponent(agentId)}/history`
  );
}

/**
 * Get cohort-wide trait averages.
 */
export async function getCohort(): Promise<CohortResult> {
  return fetchApi<CohortResult>("/cohort");
}

/**
 * Get Opus-powered behavioral insights for an agent.
 */
export async function getInsights(agentId: string): Promise<InsightsResult> {
  return fetchApi<InsightsResult>(
    `/insights/${encodeURIComponent(agentId)}`
  );
}
