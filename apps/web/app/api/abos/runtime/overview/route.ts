import { runtimeWorkspaceQuerySchema } from "../../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../../lib/api"
import { getRuntimeOverview } from "../../../../../lib/runtime-service"

export const GET = withApiRoute(
  "abos.runtime.overview",
  async (request) => {
    const { workspaceId } = validateSearchParams(request, runtimeWorkspaceQuerySchema)
    return jsonOk(await getRuntimeOverview(workspaceId))
  },
  { allowedMethods: ["GET"] }
)
