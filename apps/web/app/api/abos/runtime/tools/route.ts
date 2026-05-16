import { runtimeToolSchema } from "../../../../../lib/api-schemas"
import { jsonOk, parseJson, withApiRoute } from "../../../../../lib/api"
import { adminRateLimit } from "../../../../../lib/api-rate-limit"
import { withRuntimeScope } from "../../../../../lib/runtime-rbac"
import { registerRuntimeTool } from "../../../../../lib/runtime-service"

export const POST = withApiRoute(
  "abos.runtime.tools",
  withRuntimeScope("runtime:tools:write", async (request) => {
    const input = await parseJson(request, runtimeToolSchema, 8 * 1024)
    return jsonOk({ tool: await registerRuntimeTool(input) })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
