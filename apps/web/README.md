# Qassem AI OS Web Runtime

This is the primary runtime for the current ABOS dashboard.

## Stack

- Next.js App Router
- PostgreSQL via `pg`
- Drizzle migrations
- Local simulated AI streaming via `@qassem/ai-core`

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
ABOS_ADMIN_TOKEN=replace-with-a-long-random-token
```

## Database setup

Schema changes are managed with Drizzle migrations. The migration config loads `apps/web/.env.local` for local development, or reads `DATABASE_URL` from the shell in CI/production.

From the repo root:

```bash
pnpm db:migrate
```

Or from this package:

```bash
pnpm --filter @qassem/web db:migrate
```

To generate a new migration after editing `apps/web/db/schema.ts`:

```bash
pnpm db:generate
```

To inspect the local database with Drizzle Studio:

```bash
pnpm db:studio
```

The setup and seed endpoints are admin-only runtime operations. Setup no longer creates tables; it verifies that the database is reachable and points operators to the migration command. Seed inserts demo records into an already-migrated database.

```bash
curl -X POST http://localhost:3000/api/abos/setup \
  -H "Authorization: Bearer $ABOS_ADMIN_TOKEN"

curl -X POST http://localhost:3000/api/abos/seed \
  -H "Authorization: Bearer $ABOS_ADMIN_TOKEN"
```

Read endpoints fall back to demo data when the database is unavailable, so the dashboard remains usable during local setup.

## Local development flow

1. Copy `apps/web/.env.example` to `apps/web/.env.local`.
2. Set `DATABASE_URL` to your Neon PostgreSQL connection string.
3. Set `ABOS_ADMIN_TOKEN` to a long random token.
4. Run `pnpm install` from the repo root.
5. Run `pnpm db:migrate`.
6. Optional: call `/api/abos/seed` with the admin token.
7. Run `pnpm web` or `pnpm --filter @qassem/web dev`.
