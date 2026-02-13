/** Score for a single trait (0.0–1.0). */
export interface TraitScore {
  name: string
  score: number
  dimension: 'ethos' | 'logos' | 'pathos'
  polarity: 'positive' | 'negative'
}

/** Full evaluation result from the Ethos API. */
export interface EvaluationResult {
  traits: Record<string, TraitScore>
  dimensions: { ethos: number; logos: number; pathos: number }
  trust: 'trusted' | 'cautious' | 'suspicious' | 'untrusted'
  flags: string[]
  alignment_status: string
  direction: 'inbound' | 'outbound'
}

/** Options for evaluateIncoming(). */
export interface EvaluateIncomingOptions {
  text: string
  source: string
  source_name?: string
  agent_specialty?: string
  message_timestamp?: string
}

/** Options for evaluateOutgoing(). */
export interface EvaluateOutgoingOptions {
  text: string
  source: string
  source_name?: string
  agent_specialty?: string
  message_timestamp?: string
}

/** Insight from a character report. */
export interface Insight {
  trait: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  evidence: Record<string, unknown>
}

/** Character report result. */
export interface CharacterReportResult {
  agent_id: string
  period: string
  generated_at: string
  summary: string
  insights: Insight[]
  stats: Record<string, unknown>
}

/** Client configuration. */
export interface EthosConfig {
  apiUrl?: string
  apiKey?: string
}
