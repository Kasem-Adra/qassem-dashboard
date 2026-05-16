import { runtimeTaskIdQuerySchema } from "../../../../../lib/api-schemas"
import { jsonError, jsonOk, validateSearchParams, withApiRoute } from "../../../../../lib/api"
import { PostgresRuntimePersistence } from "../../../../../lib/runtime-service"

export const GET = withApiRoute(
  "abos.runtime.status",
  async (request) => {
    const { taskId } = validateSearchParams(request, runtimeTaskIdQuerySchema)
    const task = await new PostgresRuntimePersistence().getTask(taskId)
    if (!task) return jsonError("Task not found", 404)
    return jsonOk({ task })
  },
  { allowedMethods: ["GET"] }
)
