import { runtimeAgentDefinitionSchema } from "../../../../../lib/api-schemas"
import { jsonOk, parseJson, withApiRoute } from "../../../../../lib/api"
import { adminRateLimit } from "../../../../../lib/api-rate-limit"
import { withRuntimeScope } from "../../../../../lib/runtime-rbac"
import { registerRuntimeAgentDefinition } from "../../../../../lib/runtime-service"

export const POST = withApiRoute(
  "abos.runtime.agents",
  withRuntimeScope("runtime:agents:write", async (request) => {
    const input = await parseJson(request, runtimeAgentDefinitionSchema, 8 * 1024)
    return jsonOk({ agent: await registerRuntimeAgentDefinition(input) })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
