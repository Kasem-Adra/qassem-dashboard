interface RateLimitOptions {
  limit: number
  windowMs: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

export const publicRateLimit: RateLimitOptions = {
  limit: 120,
  windowMs: 60_000,
}

export const adminRateLimit: RateLimitOptions = {
  limit: 20,
  windowMs: 60_000,
}

export const streamRateLimit: RateLimitOptions = {
  limit: 12,
  windowMs: 60_000,
}

export class RateLimitExceededError extends Error {
  constructor() {
    super("Too many requests")
  }
}

const buckets = new Map<string, RateLimitEntry>()

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  )
}

export function enforceRateLimit(request: Request, route: string, options: RateLimitOptions) {
  const now = Date.now()
  const key = `${route}:${getClientIp(request)}`
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return {
      limit: options.limit,
      remaining: options.limit - 1,
      resetAt: now + options.windowMs,
    }
  }

  current.count += 1

  if (current.count > options.limit) {
    throw new RateLimitExceededError()
  }

  return {
    limit: options.limit,
    remaining: Math.max(0, options.limit - current.count),
    resetAt: current.resetAt,
  }
}
