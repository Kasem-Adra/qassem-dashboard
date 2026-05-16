import { runtimeRunSchema } from "../../../../../lib/api-schemas"
import { jsonOk, parseJson, withApiRoute } from "../../../../../lib/api"
import { adminRateLimit } from "../../../../../lib/api-rate-limit"
import { withRuntimeScope } from "../../../../../lib/runtime-rbac"
import { runRuntime } from "../../../../../lib/runtime-service"

export const POST = withApiRoute(
  "abos.runtime.run",
  withRuntimeScope("runtime:tasks:control", async (request) => {
    const input = await parseJson(request, runtimeRunSchema, 2048)
    return jsonOk(await runRuntime(input))
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
