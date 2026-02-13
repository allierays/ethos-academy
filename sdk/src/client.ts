import type { CharacterReportResult, EthosConfig, EvaluateIncomingOptions, EvaluateOutgoingOptions, EvaluationResult } from './types'

const DEFAULT_API_URL = 'http://localhost:8917'

/** Ethos client — three tool calls for AI agents. */
export class Ethos {
  private apiUrl: string
  private apiKey?: string

  constructor(config: EthosConfig = {}) {
    this.apiUrl = config.apiUrl ?? DEFAULT_API_URL
    this.apiKey = config.apiKey
  }

  async evaluateIncoming(options: EvaluateIncomingOptions): Promise<EvaluationResult> {
    const res = await fetch(`${this.apiUrl}/evaluate/incoming`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(options),
    })
    if (!res.ok) throw new Error(`Ethos API error: ${res.status}`)
    return res.json()
  }

  async evaluateOutgoing(options: EvaluateOutgoingOptions): Promise<EvaluationResult> {
    const res = await fetch(`${this.apiUrl}/evaluate/outgoing`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(options),
    })
    if (!res.ok) throw new Error(`Ethos API error: ${res.status}`)
    return res.json()
  }

  async characterReport(agentId: string): Promise<CharacterReportResult> {
    const res = await fetch(`${this.apiUrl}/character/${encodeURIComponent(agentId)}`, {
      headers: this.headers(),
    })
    if (!res.ok) throw new Error(`Ethos API error: ${res.status}`)
    return res.json()
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`
    return h
  }
}
