import { getMigrationStatus } from "../../../../lib/abos-service"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, parseJson, validateSearchParams, withAdmin, withApiRoute } from "../../../../lib/api"
import { adminRateLimit } from "../../../../lib/api-rate-limit"

export const POST = withApiRoute(
  "abos.setup",
  withAdmin(async (request) => {
    validateSearchParams(request, emptyQuerySchema)
    await parseJson(request, emptyQuerySchema, 1024)

    return jsonOk(await getMigrationStatus())
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
