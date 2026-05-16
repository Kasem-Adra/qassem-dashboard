import { getMemoryEvents } from "../../../../lib/abos-service"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../lib/api"

export const GET = withApiRoute("abos.memory", async (request) => {
  validateSearchParams(request, emptyQuerySchema)
  return jsonOk(await getMemoryEvents())
}, { allowedMethods: ["GET"] })
