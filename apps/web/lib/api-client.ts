export interface ApiFetchOptions<TFallback> extends RequestInit {
  fallback: TFallback
  timeoutMs?: number
}

export async function apiJson<TResponse>(url: string, options: ApiFetchOptions<TResponse>): Promise<TResponse> {
  const { fallback, timeoutMs = 8_000, ...init } = options
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
      ...init,
      headers: {
        accept: "application/json",
        ...init.headers,
      },
      signal: init.signal ?? controller.signal,
    })

    if (!response.ok) return fallback
    return (await response.json()) as TResponse
  } catch {
    return fallback
  } finally {
    window.clearTimeout(timeout)
  }
}

export function apiEventSource(url: string) {
  return new EventSource(url, { withCredentials: true })
}
