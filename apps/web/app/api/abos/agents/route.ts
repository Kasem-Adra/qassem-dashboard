import { getAgents } from "../../../../lib/abos-service"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../lib/api"

export const GET = withApiRoute("abos.agents", async (request) => {
  validateSearchParams(request, emptyQuerySchema)
  return jsonOk(await getAgents())
}, { allowedMethods: ["GET"] })
