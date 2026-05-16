import { demoHealth } from "../../../../lib/abos-demo"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../lib/api"

export const GET = withApiRoute("abos.health", (request) => {
  validateSearchParams(request, emptyQuerySchema)
  return jsonOk(demoHealth)
}, { allowedMethods: ["GET"] })
