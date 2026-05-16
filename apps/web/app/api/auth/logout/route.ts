import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { clearAdminSessionCookie, jsonOk, parseJson, validateSearchParams, withApiRoute } from "../../../../lib/api"
import { adminRateLimit } from "../../../../lib/api-rate-limit"

export const POST = withApiRoute(
  "auth.logout",
  async (request) => {
    validateSearchParams(request, emptyQuerySchema)
    await parseJson(request, emptyQuerySchema, 1024)

    const response = jsonOk({ ok: true })
    response.headers.set("set-cookie", clearAdminSessionCookie())
    return response
  },
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
