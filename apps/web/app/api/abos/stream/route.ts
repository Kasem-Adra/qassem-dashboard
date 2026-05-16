import { createDemoStreamEvent } from "../../../../lib/abos-demo"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { validateSearchParams, withApiRoute } from "../../../../lib/api"
import { streamRateLimit } from "../../../../lib/api-rate-limit"

function createRouteStreamEvent() {
  return createDemoStreamEvent(
    Math.floor(82 + Math.random() * 12),
    Math.floor(45 + Math.random() * 55),
    new Date().toISOString()
  )
}

export const GET = withApiRoute("abos.stream", (request) => {
  validateSearchParams(request, emptyQuerySchema)

  const encoder = new TextEncoder()
  let interval: ReturnType<typeof setInterval> | undefined
  let timeout: ReturnType<typeof setTimeout> | undefined
  let closed = false

  function close(controller: ReadableStreamDefaultController<Uint8Array>) {
    if (closed) return
    closed = true
    if (interval) clearInterval(interval)
    if (timeout) clearTimeout(timeout)
    try {
      controller.close()
    } catch {
      // Already closed by the client.
    }
  }

  function send(controller: ReadableStreamDefaultController<Uint8Array>, payload: unknown) {
    if (closed) return
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
    } catch {
      close(controller)
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let count = 0
      const abort = () => close(controller)
      request.signal.addEventListener("abort", abort, { once: true })

      interval = setInterval(() => {
        if (closed) return

        count++
        send(controller, createRouteStreamEvent())

        if (count >= 100) {
          request.signal.removeEventListener("abort", abort)
          close(controller)
        }
      }, 3000)

      timeout = setTimeout(() => {
        request.signal.removeEventListener("abort", abort)
        close(controller)
      }, 5 * 60_000)

      send(controller, createRouteStreamEvent())
    },
    cancel() {
      closed = true
      if (interval) clearInterval(interval)
      if (timeout) clearTimeout(timeout)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}, { allowedMethods: ["GET"], rateLimit: streamRateLimit })
