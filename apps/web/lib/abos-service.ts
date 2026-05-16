import { createDemoMemoryEvents, demoAgents, demoLiveScore, demoRecommendations, demoRisks } from "./abos-demo"
import type {
  AgentsResponse,
  DatabaseHealthResponse,
  LiveScoreResponse,
  MemoryResponse,
  RecommendationsResponse,
  RisksResponse,
} from "./api-contracts"
import type { AddMemoryInput } from "./api-schemas"
import { toPublicError } from "./api"
import { database } from "./db"

export async function checkDatabase(): Promise<DatabaseHealthResponse["time"]> {
  const result = await database.query("SELECT NOW()")
  return result.rows[0]
}

export async function getRisks(): Promise<RisksResponse> {
  return database.withFallback(
    async () => {
      const result = await database.query<{ title: string; severity: string; probability: number }>(`
        SELECT title, severity, probability
        FROM operational_risks
        ORDER BY probability DESC
        LIMIT 10
      `)

      return { risks: result.rows }
    },
    () => ({ risks: demoRisks, mode: "demo" })
  )
}

export async function getAgents(): Promise<AgentsResponse> {
  return database.withFallback(
    async () => {
      const result = await database.query<{ name: string; status: string; mission: string }>(`
        SELECT name, status, mission
        FROM agents
        ORDER BY created_at DESC
        LIMIT 10
      `)

      return { agents: result.rows }
    },
    () => ({ agents: demoAgents, mode: "demo" })
  )
}

export async function getRecommendations(): Promise<RecommendationsResponse> {
  return database.withFallback(
    async () => {
      const result = await database.query<{ message: string }>(`
        SELECT message
        FROM recommendations
        ORDER BY created_at DESC
        LIMIT 10
      `)

      return { recommendations: result.rows.map((row) => row.message) }
    },
    () => ({ recommendations: demoRecommendations, mode: "demo" })
  )
}

export async function getLiveScore(): Promise<LiveScoreResponse> {
  return database.withFallback(
    async () => {
      const result = await database.query<{ operational_score: number; risk_score: number }>(`
        SELECT operational_score, risk_score
        FROM live_metrics
        ORDER BY created_at DESC
        LIMIT 1
      `)

      const metric = result.rows[0]

      return {
        operationalScore: metric?.operational_score ?? demoLiveScore.operationalScore,
        riskScore: metric?.risk_score ?? demoLiveScore.riskScore,
      }
    },
    () => ({ ...demoLiveScore, mode: "demo" })
  )
}

export async function getMemoryEvents(): Promise<MemoryResponse> {
  return database.withFallback(
    async () => {
      const result = await database.query<{ title: string; description: string; created_at: string | Date }>(`
        SELECT title, description, created_at
        FROM memory_events
        ORDER BY created_at DESC
        LIMIT 10
      `)

      return {
        events: result.rows.map((row) => ({
          title: row.title,
          description: row.description,
          time: new Date(row.created_at).toISOString(),
        })),
      }
    },
    (error) => ({
      events: createDemoMemoryEvents("Live sync pending"),
      mode: "demo",
      warning: toPublicError(error),
    })
  )
}

export async function getMigrationStatus() {
  await checkDatabase()

  return {
    ok: true,
    message: "Database is reachable. Apply schema changes with `pnpm --filter @qassem/web db:migrate`.",
  }
}

export async function addMemoryEvent(input: AddMemoryInput) {
  await database.query(
    `INSERT INTO memory_events (type, title, description) VALUES ($1, $2, $3)`,
    [input.type, input.title, input.description]
  )
}

export async function seedAbosDatabase() {
  await database.transaction(async (client) => {
    for (const agent of demoAgents) {
      await client.query(
        `INSERT INTO agents (name, status, mission)
         SELECT $1, $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM agents WHERE name = $1)`,
        [agent.name, agent.status, agent.mission]
      )
    }

    for (const risk of demoRisks) {
      await client.query(
        `INSERT INTO operational_risks (title, severity, probability)
         SELECT $1, $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM operational_risks WHERE title = $1)`,
        [risk.title, risk.severity, risk.probability]
      )
    }

    for (const message of demoRecommendations) {
      await client.query(
        `INSERT INTO recommendations (message)
         SELECT $1
         WHERE NOT EXISTS (SELECT 1 FROM recommendations WHERE message = $1)`,
        [message]
      )
    }

    await client.query(
      `INSERT INTO memory_events (type, title, description)
       SELECT 'incident', 'Client escalation detected', 'ABOS detected high-priority onboarding escalation'
       WHERE NOT EXISTS (SELECT 1 FROM memory_events WHERE title = 'Client escalation detected')`
    )

    await client.query(`INSERT INTO live_metrics (operational_score, risk_score) VALUES (87, 32)`)
  })
}
