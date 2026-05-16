import { seedAbosDatabase } from "../../../../lib/abos-service"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, parseJson, validateSearchParams, withAdmin, withApiRoute } from "../../../../lib/api"
import { adminRateLimit } from "../../../../lib/api-rate-limit"

export const POST = withApiRoute(
  "abos.seed",
  withAdmin(async (request) => {
    validateSearchParams(request, emptyQuerySchema)
    await parseJson(request, emptyQuerySchema, 1024)

    await seedAbosDatabase()
    return jsonOk({ ok: true, message: "ABOS seed data inserted" })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
