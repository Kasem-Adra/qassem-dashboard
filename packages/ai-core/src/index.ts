export type AIProviderName = 'openai' | 'anthropic' | 'claude' | 'gemini' | 'groq' | 'local'

declare const process:
  | {
      env: Record<string, string | undefined>
    }
  | undefined

export type AIMessageRole = 'system' | 'user' | 'assistant' | 'tool'

export interface AIMessage {
  role: AIMessageRole
  content: string
  name?: string
  toolCallId?: string
}

export interface AIToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface AIToolCall {
  id: string
  name: string
  arguments: unknown
}

export interface AITool<TInput = unknown, TOutput = unknown> extends AIToolDefinition {
  execute?: (input: TInput) => Promise<TOutput> | TOutput
}

export interface AIUsage {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

export type AIStreamEvent =
  | { type: 'meta'; provider: AIProviderName; model: string; workspaceId?: string }
  | { type: 'token'; token: string }
  | { type: 'tool_call'; toolCall: AIToolCall }
  | { type: 'tool_result'; toolCallId: string; name: string; result: unknown }
  | { type: 'done'; ok: true; usage?: AIUsage }
  | { type: 'error'; error: string }

export interface AIResponse {
  provider: AIProviderName
  model: string
  text: string
  toolCalls: AIToolCall[]
  usage?: AIUsage
}

export interface AIStreamRequest {
  prompt: string
  provider?: AIProviderName
  model?: string
  workspaceId?: string
  memory?: string[]
  messages?: AIMessage[]
  tools?: AIToolDefinition[]
  signal?: AbortSignal
}

export interface AIProvider {
  name: AIProviderName
  model: string
  stream(input: AIStreamRequest): ReadableStream<Uint8Array>
  generate?(input: AIStreamRequest): Promise<AIResponse>
  embeddings?(input: string): Promise<number[]>
}

interface ProviderRuntimeConfig {
  anthropicApiKey?: string
  anthropicBaseUrl?: string
  anthropicModel?: string
  openaiApiKey?: string
  openaiBaseUrl?: string
  openaiModel?: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

function emit(controller: ReadableStreamDefaultController<Uint8Array>, event: AIStreamEvent) {
  controller.enqueue(sse(event.type, event))
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function resolveConfig(config: ProviderRuntimeConfig = {}): Required<ProviderRuntimeConfig> {
  const env = typeof process === 'undefined' ? {} : process.env

  return {
    anthropicApiKey: config.anthropicApiKey || env.ANTHROPIC_API_KEY || '',
    anthropicBaseUrl: config.anthropicBaseUrl || env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
    anthropicModel: config.anthropicModel || env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
    openaiApiKey: config.openaiApiKey || env.OPENAI_API_KEY || '',
    openaiBaseUrl: config.openaiBaseUrl || env.OPENAI_BASE_URL || 'https://api.openai.com',
    openaiModel: config.openaiModel || env.OPENAI_MODEL || 'gpt-5',
  }
}

export function buildMemoryContext(memories: string[] = []) {
  return memories.filter(Boolean).slice(0, 12).join('\n---\n')
}

function buildMessages(input: AIStreamRequest): AIMessage[] {
  const memoryContext = buildMemoryContext(input.memory)
  const baseMessages = input.messages?.length
    ? input.messages
    : [{ role: 'user' as const, content: input.prompt?.trim() || 'Start an AI OS session.' }]

  if (!memoryContext) return baseMessages

  return [
    {
      role: 'system',
      content: `Workspace memory:\n${memoryContext}`,
    },
    ...baseMessages,
  ]
}

function toOpenAITools(tools: AIToolDefinition[] = []) {
  return tools.map((tool) => ({
    type: 'function',
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  }))
}

function toAnthropicTools(tools: AIToolDefinition[] = []) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  }))
}

async function proxySseStream(
  response: Response,
  controller: ReadableStreamDefaultController<Uint8Array>,
  handlers: {
    onEvent(data: unknown, eventName?: string): void
    onDone?(): void
  }
) {
  if (!response.ok || !response.body) {
    throw new Error(`Provider request failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      const eventName = block
        .split('\n')
        .find((line) => line.startsWith('event: '))
        ?.slice(7)
        .trim()
      const dataLine = block
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.slice(6))
        .join('\n')

      if (!dataLine || dataLine === '[DONE]') continue
      handlers.onEvent(safeJson(dataLine), eventName)
    }
  }

  handlers.onDone?.()
}

function createLocalProvider(): AIProvider {
  return {
    name: 'local',
    model: 'edge-simulated-runtime',
    stream(input) {
      const messages = buildMessages(input)
      const prompt = messages[messages.length - 1]?.content || 'Start an AI OS session.'
      const chunks = [
        'Booting AI OS runtime...',
        `Provider abstraction ready for workspace ${input.workspaceId || 'default'}.`,
        input.memory?.length ? `Loaded ${input.memory.length} memory item(s).` : 'No memory context attached.',
        input.tools?.length ? `Registered ${input.tools.length} tool definition(s).` : 'No tools registered for this request.',
        `Received prompt: ${prompt}`,
        'Connect OPENAI_API_KEY or ANTHROPIC_API_KEY to switch from simulated local streaming to a live provider.',
      ]

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          emit(controller, { type: 'meta', provider: 'local', model: 'edge-simulated-runtime', workspaceId: input.workspaceId })
          for (const chunk of chunks) {
            emit(controller, { type: 'token', token: chunk })
            await new Promise((resolve) => setTimeout(resolve, 90))
          }
          emit(controller, { type: 'done', ok: true })
          controller.close()
        },
      })
    },
  }
}

function createOpenAIProvider(config: Required<ProviderRuntimeConfig>): AIProvider {
  return {
    name: 'openai',
    model: config.openaiModel,
    stream(input) {
      if (!config.openaiApiKey) return createLocalProvider().stream(input)

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          emit(controller, { type: 'meta', provider: 'openai', model: input.model || config.openaiModel, workspaceId: input.workspaceId })

          const toolArguments = new Map<string, string>()
          const response = await fetch(`${config.openaiBaseUrl}/v1/responses`, {
            method: 'POST',
            signal: input.signal,
            headers: {
              Authorization: `Bearer ${config.openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: input.model || config.openaiModel,
              input: buildMessages(input).map((message) => ({
                role: message.role === 'tool' ? 'user' : message.role,
                content: message.content,
              })),
              stream: true,
              tools: toOpenAITools(input.tools),
            }),
          })

          await proxySseStream(response, controller, {
            onEvent(data) {
              if (!data || typeof data !== 'object') return
              const event = data as Record<string, unknown>

              if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') {
                emit(controller, { type: 'token', token: event.delta })
              }

              if (event.type === 'response.function_call_arguments.delta') {
                const itemId = String(event.item_id || event.output_index || 'tool')
                toolArguments.set(itemId, `${toolArguments.get(itemId) || ''}${String(event.delta || '')}`)
              }

              if (event.type === 'response.output_item.done') {
                const item = event.item as Record<string, unknown> | undefined
                if (item?.type === 'function_call') {
                  const id = String(item.call_id || item.id || 'tool')
                  const args = typeof item.arguments === 'string' ? item.arguments : toolArguments.get(String(item.id)) || '{}'
                  emit(controller, {
                    type: 'tool_call',
                    toolCall: {
                      id,
                      name: String(item.name || 'tool'),
                      arguments: safeJson(args),
                    },
                  })
                }
              }

              if (event.type === 'response.completed') {
                emit(controller, { type: 'done', ok: true })
              }
            },
          })

          controller.close()
        },
        cancel() {
          input.signal?.throwIfAborted()
        },
      })
    },
  }
}

function createAnthropicProvider(config: Required<ProviderRuntimeConfig>): AIProvider {
  return {
    name: 'anthropic',
    model: config.anthropicModel,
    stream(input) {
      if (!config.anthropicApiKey) return createLocalProvider().stream(input)

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          const messages = buildMessages(input)
          const system = messages
            .filter((message) => message.role === 'system')
            .map((message) => message.content)
            .join('\n\n')
          const toolBlocks = new Map<number, { id: string; name: string; json: string }>()

          emit(controller, { type: 'meta', provider: 'anthropic', model: input.model || config.anthropicModel, workspaceId: input.workspaceId })

          const response = await fetch(`${config.anthropicBaseUrl}/v1/messages`, {
            method: 'POST',
            signal: input.signal,
            headers: {
              'anthropic-version': '2023-06-01',
              'x-api-key': config.anthropicApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: input.model || config.anthropicModel,
              max_tokens: 1024,
              stream: true,
              system: system || undefined,
              messages: messages
                .filter((message) => message.role !== 'system')
                .map((message) => ({
                  role: message.role === 'assistant' ? 'assistant' : 'user',
                  content: message.content,
                })),
              tools: toAnthropicTools(input.tools),
            }),
          })

          await proxySseStream(response, controller, {
            onEvent(data) {
              if (!data || typeof data !== 'object') return
              const event = data as Record<string, unknown>

              if (event.type === 'content_block_delta') {
                const delta = event.delta as Record<string, unknown> | undefined
                if (delta?.type === 'text_delta' && typeof delta.text === 'string') {
                  emit(controller, { type: 'token', token: delta.text })
                }
                if (delta?.type === 'input_json_delta') {
                  const index = Number(event.index || 0)
                  const current = toolBlocks.get(index)
                  if (current) current.json += String(delta.partial_json || '')
                }
              }

              if (event.type === 'content_block_start') {
                const index = Number(event.index || 0)
                const block = event.content_block as Record<string, unknown> | undefined
                if (block?.type === 'tool_use') {
                  toolBlocks.set(index, {
                    id: String(block.id || `tool-${index}`),
                    name: String(block.name || 'tool'),
                    json: JSON.stringify(block.input || {}),
                  })
                }
              }

              if (event.type === 'content_block_stop') {
                const index = Number(event.index || 0)
                const block = toolBlocks.get(index)
                if (block) {
                  emit(controller, {
                    type: 'tool_call',
                    toolCall: {
                      id: block.id,
                      name: block.name,
                      arguments: safeJson(block.json || '{}'),
                    },
                  })
                }
              }

              if (event.type === 'message_stop') {
                emit(controller, { type: 'done', ok: true })
              }
            },
          })

          controller.close()
        },
        cancel() {
          input.signal?.throwIfAborted()
        },
      })
    },
  }
}

export function createProviderRouter(config?: ProviderRuntimeConfig) {
  const runtimeConfig = resolveConfig(config)
  const local = createLocalProvider()
  const openai = createOpenAIProvider(runtimeConfig)
  const anthropic = createAnthropicProvider(runtimeConfig)

  return {
    resolve(provider?: AIProviderName): AIProvider {
      if (provider === 'openai') return openai
      if (provider === 'anthropic' || provider === 'claude') return anthropic
      return local
    },
  }
}

export function createAIStreamResponse(input: AIStreamRequest) {
  const provider = createProviderRouter().resolve(input.provider)
  return new Response(provider.stream(input), {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
