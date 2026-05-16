import { runtimeCreateTaskSchema } from "../../../../../lib/api-schemas"
import { jsonOk, parseJson, withApiRoute } from "../../../../../lib/api"
import { adminRateLimit } from "../../../../../lib/api-rate-limit"
import { withRuntimeScope } from "../../../../../lib/runtime-rbac"
import { createRuntimeEngine } from "../../../../../lib/runtime-service"

export const POST = withApiRoute(
  "abos.runtime.tasks.create",
  withRuntimeScope("runtime:tasks:write", async (request) => {
    const input = await parseJson(request, runtimeCreateTaskSchema, 8 * 1024)
    const task = await createRuntimeEngine().enqueueTask(input)
    return jsonOk({ task })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
