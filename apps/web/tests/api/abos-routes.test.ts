import { describe, expect, it } from "vitest"

import { GET as healthGet } from "../../app/api/abos/health/route"
import { GET as siteContentGet } from "../../app/api/site/content/route"

const baseUrl = "http://localhost:3000"

function request(path: string, init?: RequestInit) {
  return new Request(`${baseUrl}${path}`, init)
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>
}

describe("ABOS API routes", () => {
  it("serves health through the API envelope", async () => {
    const response = await healthGet(request("/api/abos/health"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expect(body).toMatchObject({ ok: true })
  })

  it("serves redesigned website content", async () => {
    const response = await siteContentGet(request("/api/site/content"))
    const body = await json(response)

    expect(response.status).toBe(200)
    expect(body.content).toMatchObject({
      settings: expect.objectContaining({ logoText: "Qassem Cloud" }),
      hero: expect.objectContaining({ primaryButton: expect.objectContaining({ href: "#platform" }) }),
    })
  })
})
