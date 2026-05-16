import { runtimeWorkflowSchema } from "../../../../../lib/api-schemas"
import { jsonOk, parseJson, withApiRoute } from "../../../../../lib/api"
import { adminRateLimit } from "../../../../../lib/api-rate-limit"
import { withRuntimeScope } from "../../../../../lib/runtime-rbac"
import { registerRuntimeWorkflow } from "../../../../../lib/runtime-service"

export const POST = withApiRoute(
  "abos.runtime.workflows",
  withRuntimeScope("runtime:workflows:write", async (request) => {
    const input = await parseJson(request, runtimeWorkflowSchema, 16 * 1024)
    return jsonOk({ workflow: await registerRuntimeWorkflow(input) })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
