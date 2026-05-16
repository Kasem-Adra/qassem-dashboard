import { runtimeRoleSchema } from "../../../../../lib/api-schemas"
import { jsonOk, parseJson, withApiRoute } from "../../../../../lib/api"
import { adminRateLimit } from "../../../../../lib/api-rate-limit"
import { runtimeRoleCatalog, withRuntimeScope } from "../../../../../lib/runtime-rbac"
import { registerRuntimeRole } from "../../../../../lib/runtime-service"

export const GET = withApiRoute(
  "abos.runtime.roles.catalog",
  async () => jsonOk({ roles: runtimeRoleCatalog() }),
  { allowedMethods: ["GET"] }
)

export const POST = withApiRoute(
  "abos.runtime.roles",
  withRuntimeScope("runtime:roles:write", async (request) => {
    const input = await parseJson(request, runtimeRoleSchema, 4096)
    return jsonOk({ role: await registerRuntimeRole(input) })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
