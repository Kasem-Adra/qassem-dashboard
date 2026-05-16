import { runtimeControlSchema } from "../../../../../lib/api-schemas"
import { jsonOk, parseJson, withApiRoute } from "../../../../../lib/api"
import { adminRateLimit } from "../../../../../lib/api-rate-limit"
import { withRuntimeScope } from "../../../../../lib/runtime-rbac"
import { controlRuntimeTask } from "../../../../../lib/runtime-service"

export const POST = withApiRoute(
  "abos.runtime.control",
  withRuntimeScope("runtime:tasks:control", async (request) => {
    const { taskId, action } = await parseJson(request, runtimeControlSchema, 2048)
    return jsonOk(await controlRuntimeTask(taskId, action))
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
