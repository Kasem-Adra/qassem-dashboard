import { runtimeHookSchema } from "../../../../../lib/api-schemas"
import { jsonOk, parseJson, withApiRoute } from "../../../../../lib/api"
import { adminRateLimit } from "../../../../../lib/api-rate-limit"
import { withRuntimeScope } from "../../../../../lib/runtime-rbac"
import { registerRuntimeHook } from "../../../../../lib/runtime-service"

export const POST = withApiRoute(
  "abos.runtime.hooks",
  withRuntimeScope("runtime:hooks:write", async (request) => {
    const input = await parseJson(request, runtimeHookSchema, 4096)
    return jsonOk({ hook: await registerRuntimeHook(input) })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
