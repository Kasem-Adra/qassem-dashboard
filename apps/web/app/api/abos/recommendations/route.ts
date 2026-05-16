import { getRecommendations } from "../../../../lib/abos-service"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../lib/api"

export const GET = withApiRoute("abos.recommendations", async (request) => {
  validateSearchParams(request, emptyQuerySchema)
  return jsonOk(await getRecommendations())
}, { allowedMethods: ["GET"] })
