import { Pool, type QueryResult, type QueryResultRow } from "pg"

let pool: Pool | null = null
const defaultRetries = 2

export class DatabaseConfigurationError extends Error {
  constructor() {
    super("DATABASE_URL is missing. Set it for the Next.js/PostgreSQL runtime, or use the legacy Cloudflare Worker runtime instead.")
  }
}

export function getDb() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new DatabaseConfigurationError()
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS ?? 10_000),
      connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS ?? 5_000),
      ssl: connectionString.includes("sslmode=require") || process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    })
  }

  return pool
}

function isRetryableDatabaseError(error: unknown) {
  if (error instanceof DatabaseConfigurationError) return false
  if (!(error instanceof Error)) return false

  const code = "code" in error ? String(error.code) : ""
  return ["40001", "40P01", "53300", "57P01", "57P02", "57P03", "ECONNRESET", "ETIMEDOUT"].includes(code)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  let lastError: unknown

  for (let attempt = 0; attempt <= defaultRetries; attempt++) {
    try {
      return await getDb().query<T>(text, params)
    } catch (error) {
      lastError = error

      if (!isRetryableDatabaseError(error) || attempt === defaultRetries) {
        throw error
      }

      await delay(50 * (attempt + 1))
    }
  }

  throw lastError
}

export async function withDatabaseFallback<T>(operation: () => Promise<T>, fallback: (error: unknown) => T): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    return fallback(error)
  }
}

export async function transaction<T>(operation: (client: { query: Pool["query"] }) => Promise<T>) {
  const client = await getDb().connect()

  try {
    await client.query("BEGIN")
    const result = await operation(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export const database = {
  get pool() {
    return getDb()
  },
  query,
  transaction,
  withFallback: withDatabaseFallback,
}

export type DatabaseQueryResult<T extends QueryResultRow = QueryResultRow> = QueryResult<T>
