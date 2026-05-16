import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonError, jsonOk, toPublicError, validateSearchParams, withApiRoute } from "../../../../lib/api"
import { checkDatabase } from "../../../../lib/abos-service"

export const GET = withApiRoute("abos.database", async (request) => {
  validateSearchParams(request, emptyQuerySchema)

  try {
    return jsonOk({ ok: true, time: await checkDatabase() })
  } catch (error) {
    return jsonError(toPublicError(error), 503)
  }
}, { allowedMethods: ["GET"] })
