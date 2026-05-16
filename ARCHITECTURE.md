# Architecture Direction

## Primary runtime

The cleaned project now treats `apps/web` as the primary runtime:

- Next.js App Router for UI and API routes.
- PostgreSQL through `apps/web/lib/db.ts`.
- Protected write endpoints using `ABOS_ADMIN_TOKEN`.
- Demo fallbacks for read endpoints when the database is not configured.

## Legacy runtime

The root `_worker.js`, `index.html`, `dashboard.html`, `schema.sql`, and `wrangler.toml.example` are kept as a legacy Cloudflare Worker/D1 implementation. They should not be mixed with the Next.js runtime until a deliberate migration decision is made.

## Cleanup already applied

- Removed duplicated `.gitignore` entries.
- Removed stale lockfiles so `pnpm install` can generate a fresh lock from the cleaned package manifests.
- Replaced eager database initialization with lazy initialization so the app can build without `DATABASE_URL`.
- Changed unsafe database setup/seed routes from `GET` to protected `POST`.
- Added basic request validation and public-safe error handling for memory writes.
- Added demo fallback data for dashboard read endpoints.

## Next recommended cleanup

1. Move the legacy Worker app into `legacy/cloudflare-worker` or remove it after confirming it is no longer needed.
2. Add real authentication instead of a single admin bearer token.
3. Add a migration system, for example Drizzle, Prisma, or node-pg-migrate.
4. Wire `@qassem/ai-core` to real provider SDKs behind explicit environment flags.
5. Add tests for API routes and risk-calculation logic.
