CREATE TABLE IF NOT EXISTS "runtime_tasks" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "title" text NOT NULL,
  "goal" text NOT NULL,
  "priority" text NOT NULL,
  "state" text NOT NULL,
  "assigned_agent" text,
  "scheduled_at" timestamp with time zone,
  "attempts" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer DEFAULT 3 NOT NULL,
  "metadata" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "locked_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_execution_logs" (
  "id" text PRIMARY KEY NOT NULL,
  "task_id" text NOT NULL,
  "workspace_id" text NOT NULL,
  "event_type" text NOT NULL,
  "agent" text,
  "message" text NOT NULL,
  "payload" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_memory_nodes" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "kind" text NOT NULL,
  "entity_type" text,
  "entity_id" text,
  "content" text NOT NULL,
  "embedding_ref" text,
  "metadata" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_memory_edges" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "from_memory_id" text NOT NULL,
  "to_memory_id" text NOT NULL,
  "relationship" text NOT NULL,
  "weight" integer DEFAULT 1 NOT NULL,
  "metadata" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_conversation_memory" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "conversation_id" text NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "metadata" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_tasks_state_idx" ON "runtime_tasks" ("state", "priority", "scheduled_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_tasks_lock_idx" ON "runtime_tasks" ("state", "locked_until");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_logs_task_idx" ON "runtime_execution_logs" ("task_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_memory_workspace_idx" ON "runtime_memory_nodes" ("workspace_id", "kind", "entity_type", "entity_id");
