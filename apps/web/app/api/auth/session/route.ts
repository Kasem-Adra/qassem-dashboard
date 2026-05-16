import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { authenticateRequest, jsonOk, validateSearchParams, withApiRoute } from "../../../../lib/api"

export const GET = withApiRoute(
  "auth.session",
  async (request) => {
    validateSearchParams(request, emptyQuerySchema)
    const principal = await authenticateRequest(request)
    if (principal instanceof Response) return principal

    return jsonOk({ ok: true, principal })
  },
  { allowedMethods: ["GET"] }
)
