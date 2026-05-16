import { authLoginSchema, emptyQuerySchema } from "../../../../lib/api-schemas"
import { createAdminSessionCookie, jsonOk, parseJson, validateSearchParams, verifyAdminToken, withApiRoute } from "../../../../lib/api"
import { adminRateLimit } from "../../../../lib/api-rate-limit"

export const POST = withApiRoute(
  "auth.login",
  async (request) => {
    validateSearchParams(request, emptyQuerySchema)
    const input = await parseJson(request, authLoginSchema, 2048)
    const unauthorized = verifyAdminToken(input.token)
    if (unauthorized) return unauthorized

    const response = jsonOk({ ok: true, role: input.role })
    response.headers.set("set-cookie", await createAdminSessionCookie(input.role))
    return response
  },
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
