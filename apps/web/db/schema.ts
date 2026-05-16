import { check, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const memoryEvents = pgTable("memory_events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const operationalRisks = pgTable(
  "operational_risks",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    severity: text("severity").notNull(),
    probability: integer("probability").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [check("operational_risks_probability_check", sql`${table.probability} >= 0 AND ${table.probability} <= 100`)]
)

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  mission: text("mission").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const liveMetrics = pgTable(
  "live_metrics",
  {
    id: serial("id").primaryKey(),
    operationalScore: integer("operational_score").notNull(),
    riskScore: integer("risk_score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check("live_metrics_operational_score_check", sql`${table.operationalScore} >= 0 AND ${table.operationalScore} <= 100`),
    check("live_metrics_risk_score_check", sql`${table.riskScore} >= 0 AND ${table.riskScore} <= 100`),
  ]
)

export const runtimeTasks = pgTable("runtime_tasks", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  title: text("title").notNull(),
  goal: text("goal").notNull(),
  priority: text("priority").notNull(),
  state: text("state").notNull(),
  assignedAgent: text("assigned_agent"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
})

export const runtimeExecutionLogs = pgTable("runtime_execution_logs", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  eventType: text("event_type").notNull(),
  agent: text("agent"),
  message: text("message").notNull(),
  payload: text("payload").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const runtimeMemoryNodes = pgTable("runtime_memory_nodes", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  kind: text("kind").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  content: text("content").notNull(),
  embeddingRef: text("embedding_ref"),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const runtimeMemoryEdges = pgTable("runtime_memory_edges", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  fromMemoryId: text("from_memory_id").notNull(),
  toMemoryId: text("to_memory_id").notNull(),
  relationship: text("relationship").notNull(),
  weight: integer("weight").notNull().default(1),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const runtimeConversationMemory = pgTable("runtime_conversation_memory", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const runtimeExecutionSnapshots = pgTable("runtime_execution_snapshots", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  taskId: text("task_id"),
  snapshotType: text("snapshot_type").notNull(),
  state: text("state").notNull(),
  payload: text("payload").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const runtimeWorkflows = pgTable("runtime_workflows", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  definition: text("definition").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const runtimeCustomTools = pgTable("runtime_custom_tools", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  inputSchema: text("input_schema").notNull(),
  handlerRef: text("handler_ref"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const runtimeAgentDefinitions = pgTable("runtime_agent_definitions", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  role: text("role").notNull(),
  description: text("description").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  tools: text("tools").default("[]"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const runtimeHooks = pgTable("runtime_hooks", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  eventType: text("event_type").notNull(),
  targetUrl: text("target_url"),
  status: text("status").notNull().default("active"),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const runtimeRoles = pgTable("runtime_roles", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  scopes: text("scopes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})
