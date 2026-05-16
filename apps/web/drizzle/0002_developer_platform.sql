CREATE TABLE IF NOT EXISTS "runtime_execution_snapshots" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "task_id" text,
  "snapshot_type" text NOT NULL,
  "state" text NOT NULL,
  "payload" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_workflows" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "definition" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_custom_tools" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "input_schema" text NOT NULL,
  "handler_ref" text,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_agent_definitions" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "role" text NOT NULL,
  "description" text NOT NULL,
  "system_prompt" text NOT NULL,
  "tools" text DEFAULT '[]',
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_hooks" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "event_type" text NOT NULL,
  "target_url" text,
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_roles" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "name" text NOT NULL,
  "scopes" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_snapshots_task_idx" ON "runtime_execution_snapshots" ("task_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_workflows_workspace_idx" ON "runtime_workflows" ("workspace_id", "status");
