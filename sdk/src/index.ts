/**
 * ethos-ai — Score AI agent messages for honesty, accuracy, and intent.
 *
 * SDK + CLI. All intelligence lives server-side.
 * This package is a thin HTTP client that calls the Ethos API.
 */

export { Ethos } from './client'
export type {
  CharacterReportResult,
  EvaluateIncomingOptions,
  EvaluateOutgoingOptions,
  EvaluationResult,
  Insight,
  TraitScore,
} from './types'
