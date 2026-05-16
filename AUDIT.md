# ABOS Architecture Stabilization Audit

## Current status

The repository has moved beyond a dashboard prototype and now contains a multi-package AI operating-system foundation:

- `apps/web` — primary Next.js App Router runtime, PostgreSQL APIs, Drizzle migrations, and operator UI.
- `packages/ai-core` — provider-aware AI streaming abstractions.
- `packages/agents-core` — typed multi-agent runtime primitives and tests.
- `packages/runtime-core` — autonomous task/runtime primitives and tests.
- Legacy Cloudflare files remain at the repository root for reference only.

## Stabilization changes in this pass

- Added a root `test` script that delegates to Turborepo.
- Added a root `audit:repo` script for generated-directory, large-file, and obvious-secret checks.
- Added a Turbo `test` task so package tests can be run consistently.
- Hardened the runtime SSE task stream so timers are cleared on client disconnect and enqueue-after-close crashes are avoided.
- Tightened the typed `parseJson` and `validateSearchParams` helpers so route handlers receive inferred Zod output types.
- Expanded `.gitignore` for Wrangler, coverage, and generated audit artifacts.
- Removed generated local artifacts from the distributable copy: `node_modules`, `.next`, `.turbo`, and `.wrangler`.

## What is intentionally not production-ready yet

- Admin protection still relies on `ABOS_ADMIN_TOKEN`; a real user/session auth layer is still needed.
- Rate limiting is in-memory and suitable for local/single-instance development only.
- Runtime execution is structurally present, but connector execution and sandboxing should be designed before real external actions are enabled.
- The legacy Worker/D1 implementation still exists and should eventually move under `legacy/` or be removed after the Next.js runtime fully replaces it.
- Some placeholder packages are not yet deeply integrated: `packages/database`, `packages/security`, and `packages/ui`.

## Recommended next steps

1. Run the full verification locally after reinstalling dependencies:

   ```bash
   pnpm install
   pnpm typecheck
   pnpm test
   pnpm audit:repo
   ```

2. Keep new Codex work limited to one architectural layer per PR.
3. Do not add new major runtime features until the current APIs, migrations, and tests are documented and stable.
4. Move legacy Cloudflare files into a `legacy/cloudflare-worker/` folder in a dedicated cleanup PR.
5. Replace token-only admin protection with real authentication before public deployment.
