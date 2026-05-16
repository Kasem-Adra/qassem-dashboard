ALTER TABLE "runtime_tasks" ADD COLUMN IF NOT EXISTS "locked_until" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_tasks_lock_idx" ON "runtime_tasks" ("state", "locked_until");
