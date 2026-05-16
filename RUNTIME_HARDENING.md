# ABOS Runtime Hardening Pass

This pass applies the first set of high-ROI runtime correctness improvements from the architecture review.

## Implemented

- Replaced short `Math.random()` IDs in `runtime-core`, `agents-core`, and the web runtime service with `crypto.randomUUID()`.
- Added task leases through `runtime_tasks.locked_until`.
- Added a migration for existing databases: `apps/web/drizzle/0003_runtime_leases.sql`.
- Added an index for reclaiming stale running tasks.
- Added atomic task claiming through `claimTask(...)` using `UPDATE ... WHERE state = ANY(...) RETURNING *`.
- Added stale running task recovery through `releaseStaleTasks(...)`.
- Ensured completed/failed tasks clear their lease.
- Added basic Neon/PostgreSQL pool limits through environment variables:
  - `DATABASE_POOL_MAX`
  - `DATABASE_IDLE_TIMEOUT_MS`
  - `DATABASE_CONNECTION_TIMEOUT_MS`

## Why this matters

The runtime previously allowed a queued task to be read by multiple workers and executed more than once. It also had no recovery mechanism for tasks stuck in `running` after a worker crash.

The new claim/lease flow is now:

1. List runnable tasks.
2. Reclaim stale `running` tasks whose lease expired.
3. Atomically claim a task by transitioning it to `running` only if it is still `queued` or `scheduled`.
4. Store `locked_until` as a short lease.
5. Clear the lease when the task completes or fails.

This does not make ABOS fully distributed yet, but it removes the most dangerous correctness issue before introducing real worker queues.

## Still pending

- Move task execution off the Next.js request path.
- Add a real background worker / queue.
- Add pgvector semantic memory recall.
- Add structured trace IDs per task execution.
- Add distributed rate limiting.
