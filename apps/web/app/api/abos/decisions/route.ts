import { demoDecisions } from "../../../../lib/abos-demo"
import { emptyQuerySchema } from "../../../../lib/api-schemas"
import { jsonOk, validateSearchParams, withApiRoute } from "../../../../lib/api"

export const GET = withApiRoute("abos.decisions", (request) => {
  validateSearchParams(request, emptyQuerySchema)
  return jsonOk({ decisions: demoDecisions })
}, { allowedMethods: ["GET"] })
