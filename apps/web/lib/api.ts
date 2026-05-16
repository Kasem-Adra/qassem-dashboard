import { z, ZodError } from "zod"
import type { ApiErrorResponse } from "./api-contracts"
import { enforceRateLimit, publicRateLimit, RateLimitExceededError } from "./api-rate-limit"

export type ApiHandler = (request: Request) => Promise<Response> | Response
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface ApiRouteOptions {
  allowedMethods?: ApiMethod[]
  rateLimit?: Parameters<typeof enforceRateLimit>[2]
}

interface ApiLogContext {
  durationMs?: number
  error?: string
  method: string
  path: string
  requestId: string
  route: string
  status: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 500
  ) {
    super(message)
  }
}

const defaultBodyLimitBytes = 32 * 1024

function createRequestId() {
  return crypto.randomUUID()
}

function logApi(level: "info" | "error", context: ApiLogContext) {
  const payload = {
    at: new Date().toISOString(),
    level,
    ...context,
  }

  const message = JSON.stringify(payload)
  if (level === "error") {
    console.error(message)
  } else {
    console.info(message)
  }
}

export function jsonOk<T extends object>(data: T, init?: ResponseInit) {
  return Response.json(data, init)
}

export function jsonError(message: string, status = 500) {
  return Response.json({ ok: false, error: message } satisfies ApiErrorResponse, { status })
}

function secureCompare(a: string, b: string) {
  const encoder = new TextEncoder()
  const left = encoder.encode(a)
  const right = encoder.encode(b)
  let diff = left.length ^ right.length
  const length = Math.max(left.length, right.length)

  for (let index = 0; index < length; index++) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }

  return diff === 0
}

export function requireAdmin(request: Request) {
  const expected = process.env.ABOS_ADMIN_TOKEN

  if (!expected) {
    return jsonError("ABOS_ADMIN_TOKEN is missing. Refusing unsafe write operation.", 503)
  }

  const auth = request.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : request.headers.get("x-abos-admin-token")

  if (!token || !secureCompare(token, expected)) {
    return jsonError("Unauthorized", 401)
  }

  return null
}

export function withAdmin(handler: ApiHandler): ApiHandler {
  return (request) => {
    const unauthorized = requireAdmin(request)
    if (unauthorized) return unauthorized
    return handler(request)
  }
}

export function toPublicError(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof RateLimitExceededError) return error.message
  if (error instanceof ZodError) return "Invalid request payload"
  return error instanceof Error ? error.message : "Unknown error"
}

export function statusFromError(error: unknown) {
  if (error instanceof ApiError) return error.status
  if (error instanceof RateLimitExceededError) return 429
  if (error instanceof ZodError) return 400
  return 500
}

export function errorDetail(error: unknown) {
  if (error instanceof ZodError) return error.flatten()
  if (error instanceof Error) return { name: error.name, message: error.message }
  return { message: "Unknown error" }
}

async function readLimitedBody(request: Request, limitBytes: number) {
  const contentLength = request.headers.get("content-length")
  if (contentLength && Number(contentLength) > limitBytes) {
    throw new ApiError("Request body too large", 413)
  }

  if (!request.body) return "{}"

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let total = 0
  let text = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    total += value.byteLength
    if (total > limitBytes) {
      throw new ApiError("Request body too large", 413)
    }

    text += decoder.decode(value, { stream: true })
  }

  text += decoder.decode()
  return text.trim() || "{}"
}

export async function parseJson<TSchema extends z.ZodType>(request: Request, schema: TSchema, limitBytes = defaultBodyLimitBytes): Promise<z.infer<TSchema>> {
  const contentType = request.headers.get("content-type")
  if (contentType && !contentType.toLowerCase().includes("application/json")) {
    throw new ApiError("Unsupported media type", 415)
  }

  const raw = await readLimitedBody(request, limitBytes)
  let body: unknown

  try {
    body = JSON.parse(raw)
  } catch {
    throw new ApiError("Invalid JSON body", 400)
  }

  return schema.parse(body)
}

export function validateSearchParams<TSchema extends z.ZodType>(request: Request, schema: TSchema): z.infer<TSchema> {
  const url = new URL(request.url)
  return schema.parse(Object.fromEntries(url.searchParams))
}

interface RateLimitMetadata {
  limit: number
  remaining: number
  resetAt: number
}

function applySecurityHeaders(response: Response, requestId: string, rateLimit?: RateLimitMetadata) {
  response.headers.set("x-request-id", requestId)
  response.headers.set("x-content-type-options", "nosniff")
  response.headers.set("x-frame-options", "DENY")
  response.headers.set("referrer-policy", "no-referrer")
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("cross-origin-resource-policy", "same-origin")

  if (!response.headers.has("cache-control")) {
    response.headers.set("cache-control", "no-store")
  }

  if (rateLimit) {
    response.headers.set("x-ratelimit-limit", String(rateLimit.limit))
    response.headers.set("x-ratelimit-remaining", String(rateLimit.remaining))
    response.headers.set("x-ratelimit-reset", String(Math.ceil(rateLimit.resetAt / 1000)))
  }

  return response
}

function assertAllowedMethod(request: Request, allowedMethods?: ApiMethod[]) {
  if (!allowedMethods?.length || allowedMethods.includes(request.method as ApiMethod)) return
  throw new ApiError("Method not allowed", 405)
}

export function withApiRoute(name: string, handler: ApiHandler, options: ApiRouteOptions = {}): ApiHandler {
  return async (request) => {
    const startedAt = Date.now()
    const requestId = request.headers.get("x-request-id") || createRequestId()
    const path = new URL(request.url).pathname
    let status = 500
    let rateLimit: RateLimitMetadata | undefined

    try {
      assertAllowedMethod(request, options.allowedMethods)
      rateLimit = enforceRateLimit(request, name, options.rateLimit ?? publicRateLimit)

      const response = await handler(request)
      status = response.status
      return applySecurityHeaders(response, requestId, rateLimit)
    } catch (error) {
      status = statusFromError(error)
      logApi("error", {
        error: JSON.stringify(errorDetail(error)),
        method: request.method,
        path,
        requestId,
        route: name,
        status,
      })
      const response = jsonError(toPublicError(error), status)
      return applySecurityHeaders(response, requestId, rateLimit)
    } finally {
      logApi("info", {
        durationMs: Date.now() - startedAt,
        method: request.method,
        path,
        requestId,
        route: name,
        status,
      })
    }
  }
}
