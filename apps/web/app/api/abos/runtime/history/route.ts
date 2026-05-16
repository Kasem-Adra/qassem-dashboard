import { runtimeTaskIdQuerySchema } from "../../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../../lib/api"
import { createRuntimeEngine } from "../../../../../lib/runtime-service"

export const GET = withApiRoute(
  "abos.runtime.history",
  async (request) => {
    const { taskId } = validateSearchParams(request, runtimeTaskIdQuerySchema)
    const history = await createRuntimeEngine().taskHistory(taskId)
    return jsonOk({ history })
  },
  { allowedMethods: ["GET"] }
)
