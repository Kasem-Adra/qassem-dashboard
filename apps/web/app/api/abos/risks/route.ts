import { getRisks } from "../../../../lib/abos-service"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../lib/api"

export const GET = withApiRoute("abos.risks", async (request) => {
  validateSearchParams(request, emptyQuerySchema)
  return jsonOk(await getRisks())
}, { allowedMethods: ["GET"] })
