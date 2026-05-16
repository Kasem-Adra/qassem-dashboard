import { runtimeTaskIdQuerySchema } from "../../../../../lib/api-schemas"
import { validateSearchParams, withApiRoute } from "../../../../../lib/api"
import { streamRateLimit } from "../../../../../lib/api-rate-limit"
import { createTaskEventStream } from "../../../../../lib/runtime-service"

export const GET = withApiRoute(
  "abos.runtime.stream",
  (request) => {
    const { taskId } = validateSearchParams(request, runtimeTaskIdQuerySchema)
    return new Response(createTaskEventStream(taskId), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  },
  { allowedMethods: ["GET"], rateLimit: streamRateLimit }
)
