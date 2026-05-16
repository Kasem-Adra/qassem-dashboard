import { emptyQuerySchema, websiteContentSchema } from "../../../../lib/api-schemas"
import { jsonOk, parseJson, validateSearchParams, withAdmin, withApiRoute } from "../../../../lib/api"
import { adminRateLimit } from "../../../../lib/api-rate-limit"
import { getWebsiteContent, updateWebsiteContent } from "../../../../lib/website-content"

export const GET = withApiRoute(
  "site.content.get",
  async (request) => {
    validateSearchParams(request, emptyQuerySchema)
    return jsonOk({ content: getWebsiteContent() })
  },
  { allowedMethods: ["GET"] }
)

export const POST = withApiRoute(
  "site.content.update",
  withAdmin(async (request) => {
    validateSearchParams(request, emptyQuerySchema)
    const content = await parseJson(request, websiteContentSchema, 64 * 1024)
    return jsonOk({ ok: true, content: updateWebsiteContent(content) })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
