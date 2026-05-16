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

export type AuthenticatedRole = "admin" | "operator"

export interface AuthenticatedPrincipal {
  role: AuthenticatedRole
  source: "bearer" | "header" | "session"
  subject: string
}

interface SessionPayload {
  exp: number
  iat: number
  role: AuthenticatedRole
  sub: string
}

const defaultBodyLimitBytes = 32 * 1024
const sessionCookieName = "abos_session"
const sessionTtlSeconds = 8 * 60 * 60

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

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlEncodeBytes(value: Uint8Array) {
  let binary = ""
  for (const byte of value) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
  return atob(padded)
}

async function signSessionPayload(payload: string, secret: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return base64UrlEncodeBytes(new Uint8Array(signature))
}

function getCookie(request: Request, name: string) {
  const header = request.headers.get("cookie")
  if (!header) return null

  for (const segment of header.split(";")) {
    const [rawName, ...rawValue] = segment.trim().split("=")
    if (rawName === name) return rawValue.join("=") || null
  }

  return null
}

async function readSession(request: Request, expected: string): Promise<AuthenticatedPrincipal | null> {
  const cookie = getCookie(request, sessionCookieName)
  if (!cookie) return null

  const [encodedPayload, signature] = cookie.split(".")
  if (!encodedPayload || !signature) return null

  const expectedSignature = await signSessionPayload(encodedPayload, expected)
  if (!secureCompare(signature, expectedSignature)) return null

  let payload: SessionPayload
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload
  } catch {
    return null
  }

  if (!payload.sub || !payload.exp || !["admin", "operator"].includes(payload.role)) return null
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null

  return { role: payload.role, source: "session", subject: payload.sub }
}

function readTokenPrincipal(request: Request, expected: string): AuthenticatedPrincipal | null {
  const auth = request.headers.get("authorization") || ""
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null
  const headerToken = request.headers.get("x-abos-admin-token")
  const token = bearer || headerToken

  if (!token || !secureCompare(token, expected)) return null

  return {
    role: request.headers.get("x-abos-role") === "operator" ? "operator" : "admin",
    source: bearer ? "bearer" : "header",
    subject: "admin-token",
  }
}

export async function createAdminSessionCookie(role: AuthenticatedRole = "admin") {
  const expected = process.env.ABOS_ADMIN_TOKEN
  if (!expected) {
    throw new ApiError("ABOS_ADMIN_TOKEN is missing. Refusing unsafe write operation.", 503)
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = base64UrlEncode(JSON.stringify({ exp: now + sessionTtlSeconds, iat: now, role, sub: "abos-admin" } satisfies SessionPayload))
  const signature = await signSessionPayload(payload, expected)
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""

  return `${sessionCookieName}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionTtlSeconds}${secure}`
}

export function clearAdminSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

export async function authenticateRequest(request: Request): Promise<AuthenticatedPrincipal | Response> {
  const expected = process.env.ABOS_ADMIN_TOKEN

  if (!expected) {
    return jsonError("ABOS_ADMIN_TOKEN is missing. Refusing unsafe write operation.", 503)
  }

  const tokenPrincipal = readTokenPrincipal(request, expected)
  if (tokenPrincipal) return tokenPrincipal

  const sessionPrincipal = await readSession(request, expected)
  if (!sessionPrincipal) return jsonError("Unauthorized", 401)

  return sessionPrincipal
}

export function verifyAdminToken(token: string) {
  const expected = process.env.ABOS_ADMIN_TOKEN

  if (!expected) {
    return jsonError("ABOS_ADMIN_TOKEN is missing. Refusing unsafe write operation.", 503)
  }

  if (!secureCompare(token, expected)) {
    return jsonError("Unauthorized", 401)
  }

  return null
}

export async function requireAdmin(request: Request) {
  const result = await authenticateRequest(request)
  return result instanceof Response ? result : null
}

export function withAdmin(handler: ApiHandler): ApiHandler {
  return async (request) => {
    const unauthorized = await requireAdmin(request)
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
      rateLimit = enforceRateLimit(request, name, options.rateLimit ?? publicRateLimit)
      assertAllowedMethod(request, options.allowedMethods)

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
