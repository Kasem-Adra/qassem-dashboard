import { runtimeMemoryQuerySchema } from "../../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../../lib/api"
import { createRuntimeEngine } from "../../../../../lib/runtime-service"

export const GET = withApiRoute(
  "abos.runtime.memory",
  async (request) => {
    const { workspaceId, query, limit } = validateSearchParams(request, runtimeMemoryQuerySchema)
    const memories = await createRuntimeEngine().recallMemory(workspaceId, query, limit)
    return jsonOk({ memories })
  },
  { allowedMethods: ["GET"] }
)
