# Qassem Dashboard — AI Operating System

This repository contains two generations of the Qassem AI OS project:

1. **Primary runtime:** `apps/web` — Next.js dashboard + PostgreSQL APIs.
2. **Legacy runtime:** root `_worker.js`, `index.html`, `dashboard.html`, and `schema.sql` — Cloudflare Worker/D1 implementation kept for reference.

The cleanup work now treats the **Next.js app as the main path forward**. Do not mix the Cloudflare D1 Worker runtime with the PostgreSQL Next.js runtime unless you intentionally migrate one into the other.

## Repository structure

```text
apps/web/                 Primary Next.js app and API routes
apps/workers/             Worker package placeholder
packages/abos-core/       Risk and operating-system domain logic
packages/ai-core/         AI provider router and local streaming provider
packages/realtime/        Realtime package placeholder
packages/security/        Security package placeholder
packages/theme-engine/    Theme tokens and helpers
packages/ui/              Shared UI package placeholder
_worker.js                Legacy Cloudflare Worker API layer
index.html                Legacy public site
dashboard.html            Legacy admin dashboard
schema.sql                Legacy D1 schema
ARCHITECTURE.md           Cleanup notes and architectural direction
```

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm db:migrate
pnpm web
```

Set these in `apps/web/.env.local`:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
ABOS_ADMIN_TOKEN=replace-with-a-long-random-token
```

## Database setup

The Next.js runtime uses Neon PostgreSQL with Drizzle migrations. Apply migrations before starting shared or production environments:

```bash
pnpm db:migrate
```

Generate new versioned migrations after editing `apps/web/db/schema.ts`:

```bash
pnpm db:generate
```

The setup and seed endpoints are protected runtime operations. Setup verifies database reachability and seed inserts demo data into an already-migrated database:

```bash
curl -X POST http://localhost:3000/api/abos/setup \
  -H "Authorization: Bearer $ABOS_ADMIN_TOKEN"

curl -X POST http://localhost:3000/api/abos/seed \
  -H "Authorization: Bearer $ABOS_ADMIN_TOKEN"
```

Read APIs return demo data when the database is not configured, which keeps the dashboard usable during local setup.

## Main Next.js API endpoints

```text
GET  /api/abos/health
GET  /api/abos/live-score
GET  /api/abos/risks
GET  /api/abos/recommendations
GET  /api/abos/agents
GET  /api/abos/memory
POST /api/abos/add-memory       Requires ABOS_ADMIN_TOKEN
POST /api/abos/setup            Requires ABOS_ADMIN_TOKEN
POST /api/abos/seed             Requires ABOS_ADMIN_TOKEN
POST /api/ai/stream             Local simulated stream by default
```

## Security notes

- Never commit `.env`, passwords, API keys, or database URLs.
- Replace the temporary `ABOS_ADMIN_TOKEN` guard with full user authentication before production use.
- Keep setup and seed endpoints disabled or protected in production.
- Keep database changes in versioned Drizzle migrations.

## Current status

This is a cleaned MVP, not production-ready software. The UI and AI streaming demo are useful, but production readiness still requires real auth, tests, provider integrations, and a single final deployment target.
