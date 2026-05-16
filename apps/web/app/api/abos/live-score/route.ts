import { getLiveScore } from "../../../../lib/abos-service"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../lib/api"

export const GET = withApiRoute("abos.live-score", async (request) => {
  validateSearchParams(request, emptyQuerySchema)
  return jsonOk(await getLiveScore())
}, { allowedMethods: ["GET"] })
