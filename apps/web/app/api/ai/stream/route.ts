import { createAIStreamResponse, type AIProviderName } from '@qassem/ai-core'
import { aiStreamSchema, emptyQuerySchema } from '../../../../lib/api-schemas'
import { parseJson, validateSearchParams, withApiRoute } from '../../../../lib/api'
import { streamRateLimit } from '../../../../lib/api-rate-limit'

export const runtime = 'edge'

export const POST = withApiRoute('ai.stream', async (request) => {
  validateSearchParams(request, emptyQuerySchema)
  const body = await parseJson(request, aiStreamSchema, 16 * 1024)

  return createAIStreamResponse({
    prompt: body.prompt,
    provider: body.provider as AIProviderName,
    model: body.model,
    workspaceId: body.workspaceId || 'default',
    memory: body.memory,
    messages: body.messages,
    tools: body.tools,
    signal: request.signal
  })
}, { allowedMethods: ['POST'], rateLimit: streamRateLimit })
