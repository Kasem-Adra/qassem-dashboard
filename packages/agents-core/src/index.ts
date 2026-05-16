import {
  type AIProviderName,
  type AIStreamEvent,
  type AIToolDefinition,
  buildMemoryContext,
  createProviderRouter,
} from "@qassem/ai-core"

export type AgentRole = "planner" | "analyst" | "executor" | "memory"
export type AgentTaskType = "plan" | "analyze" | "execute" | "remember"
export type AgentStatus = "completed" | "failed"

export interface AgentTool<TInput = unknown, TOutput = unknown> extends AIToolDefinition {
  execute: (input: TInput, context: AgentContext) => Promise<TOutput> | TOutput
}

export interface AgentToolResult {
  ok: boolean
  toolName: string
  output?: unknown
  error?: string
}

export interface AgentMessage {
  id: string
  conversationId: string
  from: AgentRole | "user" | "system"
  to: AgentRole | "broadcast"
  content: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface AgentTask {
  id: string
  type: AgentTaskType
  goal: string
  input?: Record<string, unknown>
  assignedTo?: AgentRole
}

export interface AgentOutput {
  agent: AgentRole
  status: AgentStatus
  summary: string
  reasoning: string[]
  nextTasks: AgentTask[]
  toolResults: AgentToolResult[]
  messages: AgentMessage[]
  provider: AIProviderName
  attempts: number
}

export interface TaskHistoryEntry {
  id: string
  task: AgentTask
  output: AgentOutput
  createdAt: string
}

export interface AgentConversationState {
  id: string
  messages: AgentMessage[]
  taskHistory: TaskHistoryEntry[]
  updatedAt: string
}

export interface AgentMemoryRecord {
  id: string
  workspaceId: string
  content: string
  source: AgentRole | "user" | "system"
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface AgentMemoryStore {
  append(record: Omit<AgentMemoryRecord, "id" | "createdAt">): Promise<AgentMemoryRecord>
  search(workspaceId: string, query: string, limit?: number): Promise<AgentMemoryRecord[]>
}

export interface AgentContext {
  conversation: AgentConversationState
  memory: AgentMemoryRecord[]
  memoryStore: AgentMemoryStore
  providerPreference: AIProviderName[]
  tools: ToolRegistry
  workspaceId: string
}

export interface AgentDefinition {
  role: AgentRole
  description: string
  handles: AgentTaskType[]
  systemPrompt: string
  tools?: string[]
}

export interface AgentRuntimeOptions {
  maxRetries?: number
  providerPreference?: AIProviderName[]
  workspaceId?: string
}

export interface AgentWorkflowResult {
  conversation: AgentConversationState
  outputs: AgentOutput[]
}

const defaultProviders: AIProviderName[] = ["openai", "anthropic", "local"]

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function now() {
  return new Date().toISOString()
}

export class InMemoryAgentMemoryStore implements AgentMemoryStore {
  private readonly records: AgentMemoryRecord[] = []

  async append(record: Omit<AgentMemoryRecord, "id" | "createdAt">) {
    const saved = {
      ...record,
      id: createId("mem"),
      createdAt: now(),
    }
    this.records.push(saved)
    return saved
  }

  async search(workspaceId: string, query: string, limit = 12) {
    const needle = query.toLowerCase()
    return this.records
      .filter((record) => record.workspaceId === workspaceId)
      .filter((record) => !needle || record.content.toLowerCase().includes(needle) || JSON.stringify(record.metadata ?? {}).toLowerCase().includes(needle))
      .slice(-limit)
  }
}

export class ToolRegistry {
  private readonly tools = new Map<string, AgentTool>()

  register(tool: AgentTool) {
    this.tools.set(tool.name, tool)
    return this
  }

  list() {
    return Array.from(this.tools.values())
  }

  definitions(names?: string[]) {
    const allowed = names ? new Set(names) : null
    return this.list()
      .filter((tool) => !allowed || allowed.has(tool.name))
      .map(({ name, description, inputSchema }) => ({ name, description, inputSchema }))
  }

  async execute(name: string, input: unknown, context: AgentContext): Promise<AgentToolResult> {
    const tool = this.tools.get(name)
    if (!tool) return { ok: false, toolName: name, error: "Tool not found" }

    try {
      return {
        ok: true,
        toolName: name,
        output: await tool.execute(input, context),
      }
    } catch (error) {
      return {
        ok: false,
        toolName: name,
        error: error instanceof Error ? error.message : "Unknown tool error",
      }
    }
  }
}

export class TaskRouter {
  constructor(private readonly agents: AgentDefinition[]) {}

  route(task: AgentTask): AgentRole {
    if (task.assignedTo) return task.assignedTo
    const agent = this.agents.find((candidate) => candidate.handles.includes(task.type))
    if (!agent) throw new Error(`No agent can handle task type ${task.type}`)
    return agent.role
  }
}

export const defaultAgentDefinitions: AgentDefinition[] = [
  {
    role: "planner",
    description: "Breaks ABOS goals into ordered work and delegates to specialist agents.",
    handles: ["plan"],
    systemPrompt: "You are the ABOS planner agent. Produce concise plans, dependencies, and next tasks.",
  },
  {
    role: "analyst",
    description: "Evaluates operational signals, risks, bottlenecks, and evidence.",
    handles: ["analyze"],
    systemPrompt: "You are the ABOS analyst agent. Identify risks, evidence, confidence, and recommendations.",
  },
  {
    role: "executor",
    description: "Turns approved plans into concrete actions and tool calls.",
    handles: ["execute"],
    systemPrompt: "You are the ABOS executor agent. Execute only bounded operational actions and report results.",
  },
  {
    role: "memory",
    description: "Writes durable operating memory and retrieves relevant context.",
    handles: ["remember"],
    systemPrompt: "You are the ABOS memory agent. Persist durable decisions, incidents, and outcomes.",
    tools: ["save_memory"],
  },
]

async function collectProviderText(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let text = ""
  const events: AIStreamEvent[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split("\n\n")
    buffer = blocks.pop() ?? ""

    for (const block of blocks) {
      const eventName = block
        .split("\n")
        .find((line) => line.startsWith("event: "))
        ?.slice(7)
      const data = block
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6))
        .join("\n")

      if (!data) continue
      const parsed = JSON.parse(data) as AIStreamEvent
      events.push(parsed)
      if (eventName === "token" && parsed.type === "token") text += `${parsed.token}\n`
    }
  }

  return { text: text.trim(), events }
}

function createMessage(conversationId: string, from: AgentMessage["from"], to: AgentMessage["to"], content: string, metadata?: Record<string, unknown>): AgentMessage {
  return {
    id: createId("msg"),
    conversationId,
    from,
    to,
    content,
    createdAt: now(),
    metadata,
  }
}

function createOutputFromText(agent: AgentRole, provider: AIProviderName, attempts: number, text: string, messages: AgentMessage[], toolResults: AgentToolResult[]): AgentOutput {
  return {
    agent,
    status: "completed",
    summary: text.split("\n").find(Boolean) || `${agent} completed the task.`,
    reasoning: text.split("\n").filter(Boolean).slice(0, 6),
    nextTasks: [],
    toolResults,
    messages,
    provider,
    attempts,
  }
}

export class MultiAgentRuntime {
  private readonly agents: AgentDefinition[]
  private readonly memoryStore: AgentMemoryStore
  private readonly router: TaskRouter
  private readonly maxRetries: number
  private readonly providerPreference: AIProviderName[]
  readonly tools: ToolRegistry

  constructor(options: AgentRuntimeOptions & { agents?: AgentDefinition[]; memoryStore?: AgentMemoryStore; tools?: ToolRegistry } = {}) {
    this.agents = options.agents ?? defaultAgentDefinitions
    this.memoryStore = options.memoryStore ?? new InMemoryAgentMemoryStore()
    this.router = new TaskRouter(this.agents)
    this.maxRetries = options.maxRetries ?? 2
    this.providerPreference = options.providerPreference ?? defaultProviders
    this.tools = options.tools ?? createDefaultToolRegistry()
  }

  createConversation(id = createId("conv")): AgentConversationState {
    return {
      id,
      messages: [],
      taskHistory: [],
      updatedAt: now(),
    }
  }

  async runTask(task: AgentTask, conversation = this.createConversation(), workspaceId = "default"): Promise<AgentOutput> {
    const role = this.router.route(task)
    const definition = this.agents.find((agent) => agent.role === role)
    if (!definition) throw new Error(`Agent ${role} is not registered`)

    const memory = await this.memoryStore.search(workspaceId, task.goal)
    const context: AgentContext = {
      conversation,
      memory,
      memoryStore: this.memoryStore,
      providerPreference: this.providerPreference,
      tools: this.tools,
      workspaceId,
    }

    const userMessage = createMessage(conversation.id, "user", role, task.goal, { taskId: task.id, input: task.input })
    conversation.messages.push(userMessage)

    const output = await this.invokeWithFailover(definition, task, context)
    conversation.messages.push(...output.messages)
    conversation.taskHistory.push({ id: createId("hist"), task, output, createdAt: now() })
    conversation.updatedAt = now()
    return output
  }

  async runWorkflow(tasks: AgentTask[], options: { conversation?: AgentConversationState; workspaceId?: string } = {}): Promise<AgentWorkflowResult> {
    const conversation = options.conversation ?? this.createConversation()
    const outputs: AgentOutput[] = []
    const queue = [...tasks]

    while (queue.length) {
      const task = queue.shift()
      if (!task) continue
      const output = await this.runTask(task, conversation, options.workspaceId ?? "default")
      outputs.push(output)
      queue.push(...output.nextTasks)
    }

    return { conversation, outputs }
  }

  sendMessage(conversation: AgentConversationState, from: AgentMessage["from"], to: AgentMessage["to"], content: string, metadata?: Record<string, unknown>) {
    const message = createMessage(conversation.id, from, to, content, metadata)
    conversation.messages.push(message)
    conversation.updatedAt = now()
    return message
  }

  private async invokeWithFailover(definition: AgentDefinition, task: AgentTask, context: AgentContext): Promise<AgentOutput> {
    let attempts = 0
    let lastError: unknown

    for (const provider of this.providerPreference) {
      for (let retry = 0; retry <= this.maxRetries; retry++) {
        attempts++
        try {
          return await this.invokeAgent(definition, task, context, provider, attempts)
        } catch (error) {
          lastError = error
        }
      }
    }

    return {
      agent: definition.role,
      status: "failed",
      summary: lastError instanceof Error ? lastError.message : "Agent failed",
      reasoning: [],
      nextTasks: [],
      toolResults: [],
      messages: [createMessage(context.conversation.id, definition.role, "broadcast", "Agent failed", { error: String(lastError) })],
      provider: "local",
      attempts,
    }
  }

  private async invokeAgent(definition: AgentDefinition, task: AgentTask, context: AgentContext, provider: AIProviderName, attempts: number): Promise<AgentOutput> {
    const router = createProviderRouter()
    const selectedProvider = router.resolve(provider)
    const toolDefinitions = context.tools.definitions(definition.tools)
    const memoryContext = buildMemoryContext(context.memory.map((record) => record.content))
    const prompt = [
      definition.systemPrompt,
      memoryContext ? `Relevant memory:\n${memoryContext}` : "No relevant memory.",
      `Task type: ${task.type}`,
      `Task goal: ${task.goal}`,
      task.input ? `Task input: ${JSON.stringify(task.input)}` : "",
      "Return concise operational output with summary, reasoning, and any next task suggestions.",
    ]
      .filter(Boolean)
      .join("\n\n")

    const result = await collectProviderText(
      selectedProvider.stream({
        prompt,
        provider,
        workspaceId: context.workspaceId,
        memory: context.memory.map((record) => record.content),
        tools: toolDefinitions,
      })
    )

    const toolResults: AgentToolResult[] = []
    for (const event of result.events) {
      if (event.type === "tool_call") {
        toolResults.push(await context.tools.execute(event.toolCall.name, event.toolCall.arguments, context))
      }
    }

    if (definition.role === "memory" || task.type === "remember") {
      const saved = await context.memoryStore.append({
        workspaceId: context.workspaceId,
        content: result.text || task.goal,
        source: "memory",
        metadata: { taskId: task.id },
      })
      toolResults.push({ ok: true, toolName: "memory_store", output: saved })
    }

    const messages = [
      createMessage(context.conversation.id, definition.role, "broadcast", result.text || `${definition.role} completed ${task.id}`, {
        taskId: task.id,
        provider,
      }),
    ]

    return createOutputFromText(definition.role, provider, attempts, result.text, messages, toolResults)
  }
}

export function createDefaultToolRegistry() {
  return new ToolRegistry().register({
    name: "save_memory",
    description: "Persist durable ABOS memory for future agent runs.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string" },
      },
      required: ["content"],
    },
    async execute(input, context) {
      const content = typeof input === "object" && input && "content" in input ? String((input as { content: unknown }).content) : JSON.stringify(input)
      return context.memoryStore.append({
        workspaceId: context.workspaceId,
        content,
        source: "memory",
        metadata: { tool: "save_memory" },
      })
    },
  })
}

export function createAbosWorkflow(goal: string): AgentTask[] {
  return [
    { id: createId("task"), type: "plan", goal, assignedTo: "planner" },
    { id: createId("task"), type: "analyze", goal: `Analyze risks and evidence for: ${goal}`, assignedTo: "analyst" },
    { id: createId("task"), type: "execute", goal: `Execute the safest next action for: ${goal}`, assignedTo: "executor" },
    { id: createId("task"), type: "remember", goal: `Persist lessons and decisions for: ${goal}`, assignedTo: "memory" },
  ]
}
