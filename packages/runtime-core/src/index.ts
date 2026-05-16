import {
  MultiAgentRuntime,
  type AgentOutput,
  type AgentRole,
  type AgentTaskType,
} from "@qassem/agents-core"

export type RuntimeTaskPriority = "low" | "medium" | "high" | "critical"
export type RuntimeTaskState = "queued" | "scheduled" | "running" | "paused" | "completed" | "failed" | "cancelled"
export type RuntimeEventType =
  | "task.created"
  | "task.started"
  | "agent.completed"
  | "task.completed"
  | "task.failed"
  | "memory.created"
  | "task.controlled"
export type RuntimeMemoryKind = "entity" | "relationship" | "long_term" | "conversation"

export interface RuntimeTask {
  id: string
  workspaceId: string
  title: string
  goal: string
  priority: RuntimeTaskPriority
  state: RuntimeTaskState
  assignedAgent?: AgentRole
  scheduledAt?: string
  attempts: number
  maxAttempts: number
  createdAt: string
  updatedAt: string
  lockedUntil?: string | null
  metadata?: Record<string, unknown>
}

export interface RuntimeExecutionLog {
  id: string
  taskId: string
  workspaceId: string
  eventType: RuntimeEventType
  agent?: AgentRole
  message: string
  payload?: Record<string, unknown>
  createdAt: string
}

export interface RuntimeMemoryNode {
  id: string
  workspaceId: string
  kind: RuntimeMemoryKind
  entityType?: string
  entityId?: string
  content: string
  embeddingRef?: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
}

export interface RuntimeMemoryEdge {
  id: string
  workspaceId: string
  fromMemoryId: string
  toMemoryId: string
  relationship: string
  weight: number
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface RuntimeConversationMemory {
  id: string
  workspaceId: string
  conversationId: string
  role: string
  content: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface CreateRuntimeTaskInput {
  workspaceId: string
  title: string
  goal: string
  priority?: RuntimeTaskPriority
  assignedAgent?: AgentRole
  scheduledAt?: string
  maxAttempts?: number
  metadata?: Record<string, unknown>
}

export interface RuntimeMemoryInput {
  workspaceId: string
  kind: RuntimeMemoryKind
  content: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}

export interface RuntimePersistence {
  createTask(input: CreateRuntimeTaskInput & { id: string; state: RuntimeTaskState; attempts: number; maxAttempts: number; createdAt: string; updatedAt: string }): Promise<RuntimeTask>
  updateTask(id: string, patch: Partial<Pick<RuntimeTask, "state" | "attempts" | "updatedAt" | "lockedUntil" | "metadata">>): Promise<RuntimeTask>
  claimTask(id: string, expectedStates: RuntimeTaskState[], leaseUntil: string): Promise<RuntimeTask | null>
  releaseStaleTasks(nowIso: string, limit: number): Promise<number>
  getTask(id: string): Promise<RuntimeTask | null>
  listRunnableTasks(nowIso: string, limit: number): Promise<RuntimeTask[]>
  listTaskHistory(taskId: string): Promise<RuntimeExecutionLog[]>
  appendExecutionLog(log: Omit<RuntimeExecutionLog, "id" | "createdAt">): Promise<RuntimeExecutionLog>
  createMemory(input: RuntimeMemoryInput): Promise<RuntimeMemoryNode>
  linkMemory(input: Omit<RuntimeMemoryEdge, "id" | "createdAt">): Promise<RuntimeMemoryEdge>
  recallMemory(workspaceId: string, query: string, limit: number): Promise<RuntimeMemoryNode[]>
  appendConversationMemory(input: Omit<RuntimeConversationMemory, "id" | "createdAt">): Promise<RuntimeConversationMemory>
  listConversationMemory(workspaceId: string, conversationId: string, limit: number): Promise<RuntimeConversationMemory[]>
}

export interface TaskEngineOptions {
  agents?: MultiAgentRuntime
  maxRunnableTasks?: number
}

export interface TaskExecutionResult {
  task: RuntimeTask
  outputs: AgentOutput[]
  logs: RuntimeExecutionLog[]
}

interface TimedAgentOutput {
  durationMs: number
  output: AgentOutput
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function now() {
  return new Date().toISOString()
}

function taskTypeForAgent(agent: AgentRole): AgentTaskType {
  if (agent === "planner") return "plan"
  if (agent === "analyst") return "analyze"
  if (agent === "memory") return "remember"
  return "execute"
}

export class InMemoryRuntimePersistence implements RuntimePersistence {
  readonly tasks = new Map<string, RuntimeTask>()
  readonly logs: RuntimeExecutionLog[] = []
  readonly memories: RuntimeMemoryNode[] = []
  readonly edges: RuntimeMemoryEdge[] = []
  readonly conversations: RuntimeConversationMemory[] = []

  async createTask(input: CreateRuntimeTaskInput & { id: string; state: RuntimeTaskState; attempts: number; maxAttempts: number; createdAt: string; updatedAt: string }) {
    const task: RuntimeTask = { ...input, priority: input.priority ?? "medium" }
    this.tasks.set(task.id, task)
    return task
  }

  async updateTask(id: string, patch: Partial<Pick<RuntimeTask, "state" | "attempts" | "updatedAt" | "lockedUntil" | "metadata">>) {
    const task = this.tasks.get(id)
    if (!task) throw new Error(`Task ${id} not found`)
    const updated = { ...task, ...patch }
    this.tasks.set(id, updated)
    return updated
  }

  async claimTask(id: string, expectedStates: RuntimeTaskState[], leaseUntil: string) {
    const task = this.tasks.get(id)
    if (!task || !expectedStates.includes(task.state)) return null
    const updated = { ...task, state: "running" as RuntimeTaskState, attempts: task.attempts + 1, lockedUntil: leaseUntil, updatedAt: now() }
    this.tasks.set(id, updated)
    return updated
  }

  async releaseStaleTasks(nowIso: string, limit: number) {
    let released = 0
    for (const task of this.tasks.values()) {
      if (released >= limit) break
      if (task.state === "running" && task.lockedUntil && task.lockedUntil < nowIso) {
        this.tasks.set(task.id, { ...task, state: task.attempts >= task.maxAttempts ? "failed" : "queued", lockedUntil: null, updatedAt: nowIso })
        released++
      }
    }
    return released
  }

  async getTask(id: string) {
    return this.tasks.get(id) ?? null
  }

  async listRunnableTasks(nowIso: string, limit: number) {
    const priorityWeight: Record<RuntimeTaskPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    return Array.from(this.tasks.values())
      .filter((task) => task.state === "queued" || (task.state === "scheduled" && (!task.scheduledAt || task.scheduledAt <= nowIso)))
      .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.createdAt.localeCompare(b.createdAt))
      .slice(0, limit)
  }

  async listTaskHistory(taskId: string) {
    return this.logs.filter((log) => log.taskId === taskId)
  }

  async appendExecutionLog(log: Omit<RuntimeExecutionLog, "id" | "createdAt">) {
    const saved = { ...log, id: id("log"), createdAt: now() }
    this.logs.push(saved)
    return saved
  }

  async createMemory(input: RuntimeMemoryInput) {
    const saved = { ...input, id: id("mem"), createdAt: now(), updatedAt: now() }
    this.memories.push(saved)
    return saved
  }

  async linkMemory(input: Omit<RuntimeMemoryEdge, "id" | "createdAt">) {
    const saved = { ...input, id: id("edge"), createdAt: now() }
    this.edges.push(saved)
    return saved
  }

  async recallMemory(workspaceId: string, query: string, limit: number) {
    const needle = query.toLowerCase()
    return this.memories
      .filter((memory) => memory.workspaceId === workspaceId)
      .filter((memory) => !needle || memory.content.toLowerCase().includes(needle) || `${memory.entityType ?? ""}:${memory.entityId ?? ""}`.toLowerCase().includes(needle))
      .slice(-limit)
  }

  async appendConversationMemory(input: Omit<RuntimeConversationMemory, "id" | "createdAt">) {
    const saved = { ...input, id: id("conv_mem"), createdAt: now() }
    this.conversations.push(saved)
    return saved
  }

  async listConversationMemory(workspaceId: string, conversationId: string, limit: number) {
    return this.conversations.filter((memory) => memory.workspaceId === workspaceId && memory.conversationId === conversationId).slice(-limit)
  }
}

export class AutonomousTaskEngine {
  private readonly agents: MultiAgentRuntime
  private readonly maxRunnableTasks: number

  constructor(
    private readonly persistence: RuntimePersistence,
    options: TaskEngineOptions = {}
  ) {
    this.agents = options.agents ?? new MultiAgentRuntime({ providerPreference: ["local"] })
    this.maxRunnableTasks = options.maxRunnableTasks ?? 10
  }

  async enqueueTask(input: CreateRuntimeTaskInput) {
    const createdAt = now()
    const state: RuntimeTaskState = input.scheduledAt && input.scheduledAt > createdAt ? "scheduled" : "queued"
    const task = await this.persistence.createTask({
      ...input,
      id: id("task"),
      priority: input.priority ?? "medium",
      state,
      attempts: 0,
      maxAttempts: input.maxAttempts ?? 3,
      createdAt,
      updatedAt: createdAt,
    })

    await this.persistence.appendExecutionLog({
      taskId: task.id,
      workspaceId: task.workspaceId,
      eventType: "task.created",
      message: `Task created: ${task.title}`,
      payload: { priority: task.priority, scheduledAt: task.scheduledAt },
    })

    return task
  }

  async runDueTasks(nowIso = now()) {
    await this.persistence.releaseStaleTasks(nowIso, this.maxRunnableTasks)
    const tasks = await this.persistence.listRunnableTasks(nowIso, this.maxRunnableTasks)
    const results: TaskExecutionResult[] = []

    for (const task of tasks) {
      results.push(await this.runTask(task.id))
    }

    return results
  }

  async runTask(taskId: string): Promise<TaskExecutionResult> {
    const task = await this.persistence.getTask(taskId)
    if (!task) throw new Error(`Task ${taskId} not found`)
    if (task.state === "running") throw new Error(`Task ${taskId} is already running`)

    const logs: RuntimeExecutionLog[] = []
    const outputs: AgentOutput[] = []

    const leaseUntil = new Date(Date.now() + 5 * 60_000).toISOString()
    const running = await this.persistence.claimTask(task.id, ["queued", "scheduled"], leaseUntil)
    if (!running) throw new Error(`Task ${task.id} was already claimed or is not runnable`)
    logs.push(
      await this.persistence.appendExecutionLog({
        taskId: task.id,
        workspaceId: task.workspaceId,
        eventType: "task.started",
        message: `Task started: ${task.title}`,
      })
    )

    try {
      const stages = [
        await this.runTimedAgentStage(running, "planner", "plan"),
        await this.runTimedAgentStage(running, running.assignedAgent ?? "executor", "execute"),
        await this.runTimedAgentStage(running, "analyst", "analyze"),
        await this.runTimedAgentStage(running, "memory", "remember"),
      ]
      outputs.push(...stages.map((stage) => stage.output))

      for (const stage of stages) {
        const output = stage.output
        logs.push(
          await this.persistence.appendExecutionLog({
            taskId: task.id,
            workspaceId: task.workspaceId,
            eventType: "agent.completed",
            agent: output.agent,
            message: output.summary,
            payload: { status: output.status, provider: output.provider, attempts: output.attempts, durationMs: stage.durationMs },
          })
        )
      }

      const memoryNode = await this.persistence.createMemory({
        workspaceId: task.workspaceId,
        kind: "long_term",
        content: [`Task goal: ${task.goal}`, ...outputs.map((output) => `${output.agent}: ${output.summary}`)].join("\n"),
        entityType: "runtime_task",
        entityId: task.id,
        metadata: { taskTitle: task.title },
      })
      logs.push(
        await this.persistence.appendExecutionLog({
          taskId: task.id,
          workspaceId: task.workspaceId,
          eventType: "memory.created",
          agent: "memory",
          message: `Stored memory ${memoryNode.id}`,
          payload: { memoryId: memoryNode.id },
        })
      )

      const completed = await this.persistence.updateTask(task.id, { state: "completed", lockedUntil: null, updatedAt: now() })
      logs.push(
        await this.persistence.appendExecutionLog({
          taskId: task.id,
          workspaceId: task.workspaceId,
          eventType: "task.completed",
          message: `Task completed: ${task.title}`,
        })
      )
      return { task: completed, outputs, logs }
    } catch (error) {
      const failedState: RuntimeTaskState = running.attempts >= running.maxAttempts ? "failed" : "queued"
      const failed = await this.persistence.updateTask(task.id, { state: failedState, lockedUntil: null, updatedAt: now() })
      logs.push(
        await this.persistence.appendExecutionLog({
          taskId: task.id,
          workspaceId: task.workspaceId,
          eventType: "task.failed",
          message: error instanceof Error ? error.message : "Task failed",
          payload: { retryable: failedState === "queued" },
        })
      )
      return { task: failed, outputs, logs }
    }
  }

  async recallMemory(workspaceId: string, query: string, limit = 10) {
    return this.persistence.recallMemory(workspaceId, query, limit)
  }

  async taskHistory(taskId: string) {
    return this.persistence.listTaskHistory(taskId)
  }

  private async runAgentStage(task: RuntimeTask, agent: AgentRole, type: AgentTaskType) {
    return this.agents.runTask(
      {
        id: `${task.id}_${agent}`,
        type,
        goal: task.goal,
        input: { title: task.title, metadata: task.metadata },
        assignedTo: agent,
      },
      undefined,
      task.workspaceId
    )
  }

  private async runTimedAgentStage(task: RuntimeTask, agent: AgentRole, type: AgentTaskType): Promise<TimedAgentOutput> {
    const startedAt = Date.now()
    const output = await this.runAgentStage(task, agent, type)
    return { output, durationMs: Date.now() - startedAt }
  }
}
