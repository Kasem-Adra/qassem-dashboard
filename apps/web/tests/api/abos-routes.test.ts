import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { POST as addMemoryPost } from "../../app/api/abos/add-memory/route"
import { GET as agentsGet } from "../../app/api/abos/agents/route"
import { GET as databaseGet } from "../../app/api/abos/database/route"
import { GET as decisionsGet } from "../../app/api/abos/decisions/route"
import { GET as healthGet } from "../../app/api/abos/health/route"
import { GET as liveScoreGet } from "../../app/api/abos/live-score/route"
import { GET as memoryGet } from "../../app/api/abos/memory/route"
import { GET as recommendationsGet } from "../../app/api/abos/recommendations/route"
import { GET as risksGet } from "../../app/api/abos/risks/route"
import { POST as seedPost } from "../../app/api/abos/seed/route"
import { POST as setupPost } from "../../app/api/abos/setup/route"
import { GET as streamGet } from "../../app/api/abos/stream/route"

const baseUrl = "http://localhost:3000"

function request(path: string, init?: RequestInit) {
  return new Request(`${baseUrl}${path}`, init)
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>
}

function expectApiProtectionHeaders(response: Response) {
  expect(response.headers.get("x-request-id")).toBeTruthy()
  expect(response.headers.get("x-content-type-options")).toBe("nosniff")
  expect(response.headers.get("x-frame-options")).toBe("DENY")
  expect(response.headers.get("x-ratelimit-limit")).toBeTruthy()
}

describe("ABOS API routes", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL
  const originalAdminToken = process.env.ABOS_ADMIN_TOKEN

  beforeEach(() => {
    delete process.env.DATABASE_URL
    delete process.env.ABOS_ADMIN_TOKEN
  })

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }

    if (originalAdminToken === undefined) {
      delete process.env.ABOS_ADMIN_TOKEN
    } else {
      process.env.ABOS_ADMIN_TOKEN = originalAdminToken
    }
  })

  it("returns health data", async () => {
    const response = await healthGet(request("/api/abos/health"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expectApiProtectionHeaders(response)
    expect(body).toMatchObject({
      operationalHealth: 87,
      criticalRisks: 3,
      status: "demo",
    })
  })

  it("returns live score fallback data", async () => {
    const response = await liveScoreGet(request("/api/abos/live-score"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expectApiProtectionHeaders(response)
    expect(body).toMatchObject({ operationalScore: 87, riskScore: 32, mode: "demo" })
  })

  it("returns risks fallback data", async () => {
    const response = await risksGet(request("/api/abos/risks"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expectApiProtectionHeaders(response)
    expect(body.mode).toBe("demo")
    expect(body.risks).toEqual(expect.arrayContaining([expect.objectContaining({ title: "Enterprise Client Onboarding" })]))
  })

  it("returns recommendations fallback data", async () => {
    const response = await recommendationsGet(request("/api/abos/recommendations"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expectApiProtectionHeaders(response)
    expect(body.mode).toBe("demo")
    expect(body.recommendations).toEqual(expect.arrayContaining(["Assign emergency owner to onboarding workflow"]))
  })

  it("returns agents fallback data", async () => {
    const response = await agentsGet(request("/api/abos/agents"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expectApiProtectionHeaders(response)
    expect(body.mode).toBe("demo")
    expect(body.agents).toEqual(expect.arrayContaining([expect.objectContaining({ name: "Cortex Sentinel" })]))
  })

  it("returns memory fallback data", async () => {
    const response = await memoryGet(request("/api/abos/memory"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expectApiProtectionHeaders(response)
    expect(body.mode).toBe("demo")
    expect(body.events).toEqual(expect.arrayContaining([expect.objectContaining({ title: "Client escalation detected" })]))
  })

  it("returns decisions data", async () => {
    const response = await decisionsGet(request("/api/abos/decisions"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expectApiProtectionHeaders(response)
    expect(body.decisions).toEqual(expect.arrayContaining([expect.objectContaining({ priority: "critical" })]))
  })

  it("returns database health errors safely when DATABASE_URL is missing", async () => {
    const response = await databaseGet(request("/api/abos/database"))
    const body = await json(response)

    expect(response.status).toBe(503)
    expectApiProtectionHeaders(response)
    expect(body).toMatchObject({ ok: false })
    expect(String(body.error)).toContain("DATABASE_URL is missing")
  })

  it("streams ABOS SSE events safely", async () => {
    const response = await streamGet(request("/api/abos/stream"))
    const reader = response.body?.getReader()

    expect(response.status).toBe(200)
    expectApiProtectionHeaders(response)
    expect(response.headers.get("content-type")).toBe("text/event-stream")
    expect(reader).toBeTruthy()

    const chunk = await reader!.read()
    await reader!.cancel()

    expect(new TextDecoder().decode(chunk.value)).toContain("data:")
  })

  it("protects setup with ABOS_ADMIN_TOKEN", async () => {
    const response = await setupPost(request("/api/abos/setup", { method: "POST" }))
    const body = await json(response)

    expect(response.status).toBe(503)
    expectApiProtectionHeaders(response)
    expect(body).toMatchObject({ ok: false, error: "ABOS_ADMIN_TOKEN is missing. Refusing unsafe write operation." })
  })

  it("protects seed with ABOS_ADMIN_TOKEN", async () => {
    const response = await seedPost(request("/api/abos/seed", { method: "POST" }))
    const body = await json(response)

    expect(response.status).toBe(503)
    expectApiProtectionHeaders(response)
    expect(body).toMatchObject({ ok: false, error: "ABOS_ADMIN_TOKEN is missing. Refusing unsafe write operation." })
  })

  it("protects add-memory with ABOS_ADMIN_TOKEN", async () => {
    const response = await addMemoryPost(request("/api/abos/add-memory", { method: "POST" }))
    const body = await json(response)

    expect(response.status).toBe(503)
    expectApiProtectionHeaders(response)
    expect(body).toMatchObject({ ok: false, error: "ABOS_ADMIN_TOKEN is missing. Refusing unsafe write operation." })
  })

  it("validates add-memory request bodies after admin auth", async () => {
    process.env.ABOS_ADMIN_TOKEN = "test-token"

    const response = await addMemoryPost(
      request("/api/abos/add-memory", {
        method: "POST",
        body: JSON.stringify({ title: "Only a title" }),
        headers: {
          authorization: "Bearer test-token",
          "content-type": "application/json",
        },
      })
    )
    const body = await json(response)

    expect(response.status).toBe(400)
    expectApiProtectionHeaders(response)
    expect(body).toMatchObject({ ok: false, error: "title and description are required" })
  })

  it("rejects unexpected query params", async () => {
    const response = await healthGet(request("/api/abos/health?unexpected=true"))
    const body = await json(response)

    expect(response.status).toBe(400)
    expect(body).toMatchObject({ ok: false, error: "Invalid request payload" })
  })
})
