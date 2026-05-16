import { addMemoryEvent } from "../../../../lib/abos-service"
import { addMemorySchema, emptyQuerySchema } from "../../../../lib/api-schemas"
import { ApiError, jsonOk, parseJson, validateSearchParams, withAdmin, withApiRoute } from "../../../../lib/api"
import { adminRateLimit } from "../../../../lib/api-rate-limit"
import { ZodError } from "zod"

export const POST = withApiRoute(
  "abos.add-memory",
  withAdmin(async (request) => {
    validateSearchParams(request, emptyQuerySchema)

    const body = await parseJson(request, addMemorySchema, 4 * 1024).catch((error: unknown) => {
      if (error instanceof ZodError) {
        throw new ApiError("title and description are required", 400)
      }
      throw error
    })

    await addMemoryEvent(body)
    return jsonOk({ ok: true })
  }),
  { allowedMethods: ["POST"], rateLimit: adminRateLimit }
)
