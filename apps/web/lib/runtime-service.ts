import {
  AutonomousTaskEngine,
  type CreateRuntimeTaskInput,
  type RuntimeExecutionLog,
  type RuntimeMemoryEdge,
  type RuntimeMemoryInput,
  type RuntimeMemoryNode,
  type RuntimePersistence,
  type RuntimeTask,
  type RuntimeTaskState,
  type RuntimeConversationMemory,
} from "@qassem/runtime-core"
import { database } from "./db"

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "string") return {}
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function parseJsonArray(value: unknown): unknown[] {
  if (!value || typeof value !== "string") return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function stringify(value: unknown) {
  return JSON.stringify(value ?? {})
}

function taskFromRow(row: Record<string, unknown>): RuntimeTask {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    goal: String(row.goal),
    priority: row.priority as RuntimeTask["priority"],
    state: row.state as RuntimeTaskState,
    assignedAgent: row.assigned_agent ? String(row.assigned_agent) as RuntimeTask["assignedAgent"] : undefined,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at as string | Date).toISOString() : undefined,
    attempts: Number(row.attempts),
    maxAttempts: Number(row.max_attempts),
    createdAt: new Date(row.created_at as string | Date).toISOString(),
    updatedAt: new Date(row.updated_at as string | Date).toISOString(),
    lockedUntil: row.locked_until ? new Date(row.locked_until as string | Date).toISOString() : null,
    metadata: parseJsonObject(row.metadata),
  }
}

function logFromRow(row: Record<string, unknown>): RuntimeExecutionLog {
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    workspaceId: String(row.workspace_id),
    eventType: row.event_type as RuntimeExecutionLog["eventType"],
    agent: row.agent ? String(row.agent) as RuntimeExecutionLog["agent"] : undefined,
    message: String(row.message),
    payload: parseJsonObject(row.payload),
    createdAt: new Date(row.created_at as string | Date).toISOString(),
  }
}

function memoryFromRow(row: Record<string, unknown>): RuntimeMemoryNode {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    kind: row.kind as RuntimeMemoryNode["kind"],
    entityType: row.entity_type ? String(row.entity_type) : undefined,
    entityId: row.entity_id ? String(row.entity_id) : undefined,
    content: String(row.content),
    embeddingRef: row.embedding_ref ? String(row.embedding_ref) : undefined,
    metadata: parseJsonObject(row.metadata),
    createdAt: new Date(row.created_at as string | Date).toISOString(),
    updatedAt: new Date(row.updated_at as string | Date).toISOString(),
  }
}

export class PostgresRuntimePersistence implements RuntimePersistence {
  async createTask(input: CreateRuntimeTaskInput & { id: string; state: RuntimeTaskState; attempts: number; maxAttempts: number; createdAt: string; updatedAt: string }) {
    const result = await database.query<Record<string, unknown>>(
      `INSERT INTO runtime_tasks (id, workspace_id, title, goal, priority, state, assigned_agent, scheduled_at, attempts, max_attempts, metadata, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        input.id,
        input.workspaceId,
        input.title,
        input.goal,
        input.priority,
        input.state,
        input.assignedAgent ?? null,
        input.scheduledAt ?? null,
        input.attempts,
        input.maxAttempts,
        stringify(input.metadata),
        input.createdAt,
        input.updatedAt,
      ]
    )
    return taskFromRow(result.rows[0] ?? {})
  }

  async updateTask(idValue: string, patch: Partial<Pick<RuntimeTask, "state" | "attempts" | "updatedAt" | "lockedUntil" | "metadata">>) {
    const current = await this.getTask(idValue)
    if (!current) throw new Error(`Task ${idValue} not found`)
    const result = await database.query<Record<string, unknown>>(
      `UPDATE runtime_tasks
       SET state = $2, attempts = $3, metadata = $4, updated_at = $5, locked_until = $6
       WHERE id = $1
       RETURNING *`,
      [
        idValue,
        patch.state ?? current.state,
        patch.attempts ?? current.attempts,
        stringify(patch.metadata ?? current.metadata),
        patch.updatedAt ?? new Date().toISOString(),
        patch.lockedUntil === undefined ? current.lockedUntil ?? null : patch.lockedUntil,
      ]
    )
    return taskFromRow(result.rows[0] ?? {})
  }



  async claimTask(idValue: string, expectedStates: RuntimeTaskState[], leaseUntil: string) {
    const result = await database.query<Record<string, unknown>>(
      `UPDATE runtime_tasks
       SET state = 'running', attempts = attempts + 1, locked_until = $3, updated_at = NOW()
       WHERE id = $1 AND state = ANY($2::text[])
       RETURNING *`,
      [idValue, expectedStates, leaseUntil]
    )
    return result.rows[0] ? taskFromRow(result.rows[0]) : null
  }

  async releaseStaleTasks(nowIso: string, limit: number) {
    const result = await database.query<Record<string, unknown>>(
      `WITH stale AS (
         SELECT id
         FROM runtime_tasks
         WHERE state = 'running' AND locked_until IS NOT NULL AND locked_until < $1
         ORDER BY updated_at ASC
         LIMIT $2
       )
       UPDATE runtime_tasks t
       SET state = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'queued' END,
           locked_until = NULL,
           updated_at = NOW()
       FROM stale
       WHERE t.id = stale.id
       RETURNING t.id`,
      [nowIso, limit]
    )
    return result.rows.length
  }

  async getTask(idValue: string) {
    const result = await database.query<Record<string, unknown>>(`SELECT * FROM runtime_tasks WHERE id = $1`, [idValue])
    return result.rows[0] ? taskFromRow(result.rows[0]) : null
  }

  async listRunnableTasks(nowIso: string, limit: number) {
    const result = await database.query<Record<string, unknown>>(
      `SELECT *
       FROM runtime_tasks
       WHERE state = 'queued' OR (state = 'scheduled' AND (scheduled_at IS NULL OR scheduled_at <= $1))
       ORDER BY CASE priority WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC, created_at ASC
       LIMIT $2`,
      [nowIso, limit]
    )
    return result.rows.map(taskFromRow)
  }

  async listTaskHistory(taskId: string) {
    const result = await database.query<Record<string, unknown>>(
      `SELECT * FROM runtime_execution_logs WHERE task_id = $1 ORDER BY created_at ASC`,
      [taskId]
    )
    return result.rows.map(logFromRow)
  }

  async appendExecutionLog(log: Omit<RuntimeExecutionLog, "id" | "createdAt">) {
    const result = await database.query<Record<string, unknown>>(
      `INSERT INTO runtime_execution_logs (id, task_id, workspace_id, event_type, agent, message, payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [id("log"), log.taskId, log.workspaceId, log.eventType, log.agent ?? null, log.message, stringify(log.payload)]
    )
    return logFromRow(result.rows[0] ?? {})
  }

  async createMemory(input: RuntimeMemoryInput) {
    const result = await database.query<Record<string, unknown>>(
      `INSERT INTO runtime_memory_nodes (id, workspace_id, kind, entity_type, entity_id, content, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [id("mem"), input.workspaceId, input.kind, input.entityType ?? null, input.entityId ?? null, input.content, stringify(input.metadata)]
    )
    return memoryFromRow(result.rows[0] ?? {})
  }

  async linkMemory(input: Omit<RuntimeMemoryEdge, "id" | "createdAt">) {
    const result = await database.query<Record<string, unknown>>(
      `INSERT INTO runtime_memory_edges (id, workspace_id, from_memory_id, to_memory_id, relationship, weight, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [id("edge"), input.workspaceId, input.fromMemoryId, input.toMemoryId, input.relationship, input.weight, stringify(input.metadata)]
    )
    const row = result.rows[0] ?? {}
    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      fromMemoryId: String(row.from_memory_id),
      toMemoryId: String(row.to_memory_id),
      relationship: String(row.relationship),
      weight: Number(row.weight),
      metadata: parseJsonObject(row.metadata),
      createdAt: new Date(row.created_at as string | Date).toISOString(),
    }
  }

  async recallMemory(workspaceId: string, query: string, limit: number) {
    const result = await database.query<Record<string, unknown>>(
      `SELECT *
       FROM runtime_memory_nodes
       WHERE workspace_id = $1 AND ($2 = '' OR content ILIKE '%' || $2 || '%' OR entity_id ILIKE '%' || $2 || '%' OR entity_type ILIKE '%' || $2 || '%')
       ORDER BY created_at DESC
       LIMIT $3`,
      [workspaceId, query, limit]
    )
    return result.rows.map(memoryFromRow)
  }

  async appendConversationMemory(input: Omit<RuntimeConversationMemory, "id" | "createdAt">) {
    const result = await database.query<Record<string, unknown>>(
      `INSERT INTO runtime_conversation_memory (id, workspace_id, conversation_id, role, content, metadata)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [id("conv_mem"), input.workspaceId, input.conversationId, input.role, input.content, stringify(input.metadata)]
    )
    const row = result.rows[0] ?? {}
    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      conversationId: String(row.conversation_id),
      role: String(row.role),
      content: String(row.content),
      metadata: parseJsonObject(row.metadata),
      createdAt: new Date(row.created_at as string | Date).toISOString(),
    }
  }

  async listConversationMemory(workspaceId: string, conversationId: string, limit: number) {
    const result = await database.query<Record<string, unknown>>(
      `SELECT * FROM runtime_conversation_memory WHERE workspace_id = $1 AND conversation_id = $2 ORDER BY created_at DESC LIMIT $3`,
      [workspaceId, conversationId, limit]
    )
    return result.rows.map((row) => ({
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      conversationId: String(row.conversation_id),
      role: String(row.role),
      content: String(row.content),
      metadata: parseJsonObject(row.metadata),
      createdAt: new Date(row.created_at as string | Date).toISOString(),
    }))
  }
}

export function createRuntimeEngine() {
  return new AutonomousTaskEngine(new PostgresRuntimePersistence())
}

export async function listRuntimeTasks(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT * FROM runtime_tasks WHERE workspace_id = $1 ORDER BY updated_at DESC LIMIT 100`,
    [workspaceId]
  )
  return result.rows.map(taskFromRow)
}

export async function getRuntimeMetrics(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT state, COUNT(*)::int AS count FROM runtime_tasks WHERE workspace_id = $1 GROUP BY state`,
    [workspaceId]
  )
  const states = Object.fromEntries(result.rows.map((row) => [String(row.state), Number(row.count)]))
  const failures = Number(states.failed ?? 0)
  const running = Number(states.running ?? 0)
  const queued = Number(states.queued ?? 0) + Number(states.scheduled ?? 0)
  const completed = Number(states.completed ?? 0)
  return { states, failures, running, queued, completed }
}

export async function listRuntimeLogs(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT * FROM runtime_execution_logs WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [workspaceId]
  )
  return result.rows.map(logFromRow)
}

export async function listRuntimeSnapshots(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT * FROM runtime_execution_snapshots WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [workspaceId]
  )
  return result.rows.map((row) => ({ ...row, payload: parseJsonObject(row.payload) }))
}

export async function listRuntimeWorkflows(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT * FROM runtime_workflows WHERE workspace_id = $1 ORDER BY updated_at DESC LIMIT 50`,
    [workspaceId]
  )
  return result.rows.map((row) => ({ ...row, definition: parseJsonObject(row.definition) }))
}

export async function listRuntimeTools(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT * FROM runtime_custom_tools WHERE workspace_id = $1 ORDER BY updated_at DESC LIMIT 50`,
    [workspaceId]
  )
  return result.rows.map((row) => ({ ...row, input_schema: parseJsonObject(row.input_schema) }))
}

export async function listRuntimeAgentDefinitions(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT * FROM runtime_agent_definitions WHERE workspace_id = $1 ORDER BY updated_at DESC LIMIT 50`,
    [workspaceId]
  )
  return result.rows.map((row) => ({ ...row, tools: parseJsonArray(row.tools) }))
}

export async function listRuntimeHooks(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT * FROM runtime_hooks WHERE workspace_id = $1 ORDER BY updated_at DESC LIMIT 50`,
    [workspaceId]
  )
  return result.rows.map((row) => ({ ...row, metadata: parseJsonObject(row.metadata) }))
}

export async function listRuntimeRoles(workspaceId = "default") {
  const result = await database.query<Record<string, unknown>>(
    `SELECT * FROM runtime_roles WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [workspaceId]
  )
  return result.rows.map((row) => ({ ...row, scopes: parseJsonArray(row.scopes) }))
}

export async function createExecutionSnapshot(taskId: string | null, workspaceId: string, snapshotType: string, state: string, payload: unknown) {
  const result = await database.query<Record<string, unknown>>(
    `INSERT INTO runtime_execution_snapshots (id, workspace_id, task_id, snapshot_type, state, payload)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [id("snap"), workspaceId, taskId, snapshotType, state, stringify(payload)]
  )
  return result.rows[0]
}

export async function controlRuntimeTask(taskId: string, action: "pause" | "resume" | "retry" | "cancel" | "replay") {
  const persistence = new PostgresRuntimePersistence()
  const task = await persistence.getTask(taskId)
  if (!task) throw new Error("Task not found")

  if (action === "pause") {
    const updated = await persistence.updateTask(task.id, { state: "paused", updatedAt: new Date().toISOString() })
    await persistence.appendExecutionLog({ taskId, workspaceId: task.workspaceId, eventType: "task.controlled", message: "Task paused by operator", payload: { control: "pause" } })
    await createExecutionSnapshot(taskId, task.workspaceId, "control", "paused", updated)
    return { task: updated }
  }

  if (action === "resume" || action === "retry") {
    const updated = await persistence.updateTask(task.id, { state: "queued", updatedAt: new Date().toISOString(), attempts: action === "retry" ? 0 : task.attempts })
    await persistence.appendExecutionLog({ taskId, workspaceId: task.workspaceId, eventType: "task.controlled", message: `Task ${action} requested by operator`, payload: { control: action } })
    await createExecutionSnapshot(taskId, task.workspaceId, "control", "queued", updated)
    return { task: updated }
  }

  if (action === "cancel") {
    const updated = await persistence.updateTask(task.id, { state: "cancelled", updatedAt: new Date().toISOString() })
    await persistence.appendExecutionLog({ taskId, workspaceId: task.workspaceId, eventType: "task.controlled", message: "Task cancelled by operator", payload: { control: "cancel" } })
    await createExecutionSnapshot(taskId, task.workspaceId, "control", "cancelled", updated)
    return { task: updated }
  }

  const replay = await createRuntimeEngine().enqueueTask({
    workspaceId: task.workspaceId,
    title: `Replay: ${task.title}`,
    goal: task.goal,
    priority: task.priority,
    assignedAgent: task.assignedAgent,
    maxAttempts: task.maxAttempts,
    metadata: { replayOf: task.id, ...task.metadata },
  })
  await createExecutionSnapshot(task.id, task.workspaceId, "replay", task.state, { sourceTask: task, replayTask: replay })
  return { task: replay }
}

export async function runRuntime(input: { taskId?: string; now?: string }) {
  const engine = createRuntimeEngine()
  if (input.taskId) {
    const result = await engine.runTask(input.taskId)
    await createExecutionSnapshot(input.taskId, result.task.workspaceId, "execution", result.task.state, result)
    return { results: [result] }
  }

  const results = await engine.runDueTasks(input.now)
  await Promise.all(
    results.map((result) => createExecutionSnapshot(result.task.id, result.task.workspaceId, "execution", result.task.state, result))
  )
  return { results }
}

export async function registerRuntimeWorkflow(input: { workspaceId: string; name: string; description?: string; definition: Record<string, unknown> }) {
  const result = await database.query<Record<string, unknown>>(
    `INSERT INTO runtime_workflows (id, workspace_id, name, description, definition)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [id("workflow"), input.workspaceId, input.name, input.description ?? null, stringify(input.definition)]
  )
  return result.rows[0]
}

export async function registerRuntimeTool(input: { workspaceId: string; name: string; description: string; inputSchema: Record<string, unknown>; handlerRef?: string }) {
  const result = await database.query<Record<string, unknown>>(
    `INSERT INTO runtime_custom_tools (id, workspace_id, name, description, input_schema, handler_ref)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [id("tool"), input.workspaceId, input.name, input.description, stringify(input.inputSchema), input.handlerRef ?? null]
  )
  return result.rows[0]
}

export async function registerRuntimeAgentDefinition(input: { workspaceId: string; role: string; description: string; systemPrompt: string; tools: string[] }) {
  const result = await database.query<Record<string, unknown>>(
    `INSERT INTO runtime_agent_definitions (id, workspace_id, role, description, system_prompt, tools)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [id("agent_def"), input.workspaceId, input.role, input.description, input.systemPrompt, stringify(input.tools)]
  )
  return result.rows[0]
}

export async function registerRuntimeHook(input: { workspaceId: string; eventType: string; targetUrl?: string; metadata?: Record<string, unknown> }) {
  const result = await database.query<Record<string, unknown>>(
    `INSERT INTO runtime_hooks (id, workspace_id, event_type, target_url, metadata)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [id("hook"), input.workspaceId, input.eventType, input.targetUrl ?? null, stringify(input.metadata)]
  )
  return result.rows[0]
}

export async function registerRuntimeRole(input: { workspaceId: string; name: string; scopes: string[] }) {
  const result = await database.query<Record<string, unknown>>(
    `INSERT INTO runtime_roles (id, workspace_id, name, scopes)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [id("role"), input.workspaceId, input.name, stringify(input.scopes)]
  )
  return result.rows[0]
}

export async function getRuntimeOverview(workspaceId = "default") {
  const [tasks, logs, metrics, memories, snapshots, workflows, tools, agentDefinitions, hooks, roles] = await Promise.all([
    listRuntimeTasks(workspaceId).catch(() => []),
    listRuntimeLogs(workspaceId).catch(() => []),
    getRuntimeMetrics(workspaceId).catch(() => ({ states: {}, failures: 0, running: 0, queued: 0, completed: 0 })),
    new PostgresRuntimePersistence().recallMemory(workspaceId, "", 50).catch(() => []),
    listRuntimeSnapshots(workspaceId).catch(() => []),
    listRuntimeWorkflows(workspaceId).catch(() => []),
    listRuntimeTools(workspaceId).catch(() => []),
    listRuntimeAgentDefinitions(workspaceId).catch(() => []),
    listRuntimeHooks(workspaceId).catch(() => []),
    listRuntimeRoles(workspaceId).catch(() => []),
  ])

  const agentTiming = logs
    .filter((log) => log.eventType === "agent.completed")
    .map((log) => ({
      agent: log.agent,
      taskId: log.taskId,
      durationMs: Number(log.payload?.durationMs ?? 0),
      createdAt: log.createdAt,
    }))
    .filter((item) => Number.isFinite(item.durationMs) && item.durationMs > 0)

  return { tasks, logs, metrics: { ...metrics, agentTiming }, memories, snapshots, workflows, tools, agentDefinitions, hooks, roles }
}

export function createTaskEventStream(taskId: string) {
  const encoder = new TextEncoder()
  let closed = false
  let interval: ReturnType<typeof setInterval> | undefined
  let timeout: ReturnType<typeof setTimeout> | undefined

  function cleanup() {
    closed = true
    if (interval) clearInterval(interval)
    if (timeout) clearTimeout(timeout)
  }

  function enqueue(controller: ReadableStreamDefaultController<Uint8Array>, event: string, data: unknown) {
    if (closed) return
    try {
      controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
    } catch {
      cleanup()
    }
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const persistence = new PostgresRuntimePersistence()
      let lastSeen = 0

      async function tick() {
        if (closed) return
        try {
          const history = await persistence.listTaskHistory(taskId)
          const next = history.slice(lastSeen)
          lastSeen = history.length
          for (const event of next) {
            enqueue(controller, event.eventType, event)
          }
        } catch (error) {
          enqueue(controller, "error", { error: error instanceof Error ? error.message : "Unknown error" })
        }
      }

      await tick()
      interval = setInterval(tick, 2000)
      timeout = setTimeout(() => {
        cleanup()
        try {
          controller.close()
        } catch {
          // The browser may have already closed the SSE connection.
        }
      }, 5 * 60_000)
    },
    cancel() {
      cleanup()
    },
  })
}
