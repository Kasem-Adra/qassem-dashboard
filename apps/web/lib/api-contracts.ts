import type {
  demoAgents,
  demoDecisions,
  demoHealth,
  demoLiveScore,
  demoRecommendations,
  demoRisks,
} from "./abos-demo"

export type ApiMode = "demo"

export interface ApiErrorResponse {
  ok: false
  error: string
}

export interface DatabaseHealthResponse {
  ok: true
  time: unknown
}

export type HealthResponse = typeof demoHealth

export interface RisksResponse {
  risks: typeof demoRisks
  mode?: ApiMode
}

export interface AgentsResponse {
  agents: typeof demoAgents
  mode?: ApiMode
}

export interface RecommendationsResponse {
  recommendations: typeof demoRecommendations
  mode?: ApiMode
}

export interface MemoryEventContract {
  title: string
  description: string
  time: string
}

export interface MemoryResponse {
  events: MemoryEventContract[]
  mode?: ApiMode
  warning?: string
}

export type LiveScoreResponse =
  | typeof demoLiveScore
  | (typeof demoLiveScore & {
      mode: ApiMode
    })

export interface DecisionsResponse {
  decisions: typeof demoDecisions
}

export interface AdminOkResponse {
  ok: true
  message?: string
}
