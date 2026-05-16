# Phase 2 — Real AI OS Runtime

This phase turns the foundation into an executable AI OS runtime layer.

## Added

- Next.js workspace runtime shell
- Universal command palette with `CMD/CTRL + K`
- Edge AI streaming API using SSE
- Provider router foundation in `@qassem/ai-core`
- Realtime collaboration contracts in `@qassem/realtime`
- Durable Objects-ready Worker entrypoint
- Theme runtime tokens in `@qassem/theme-engine`
- Cloudflare health/realtime endpoints

## Cloudflare bindings already expected

Pages bindings:

```txt
DB      -> D1 database qassem-db
BUCKET  -> R2 bucket qassem-media
```

Worker Durable Object binding for the next worker deployment:

```txt
AI_ROOM -> Durable Object class AIRoom
```

## Recommended Pages build settings

Use these when you are ready to deploy the Next.js workspace instead of the legacy static shell:

```txt
Build command: pnpm install --frozen-lockfile && pnpm --filter @qassem/web build
Build output directory: apps/web/.next
Root directory: /
```

For a full Cloudflare Pages Next.js runtime, connect `@cloudflare/next-on-pages` or OpenNext Cloudflare in the next phase.

## Local development

```bash
pnpm install
pnpm web
```

Open:

```txt
http://localhost:3000/workspace
```

## Runtime endpoints

```txt
POST /api/ai/stream
GET  /api/health
GET  /api/realtime/snapshot
```

## Next phase

- Connect OpenAI/Claude/Gemini provider adapters
- Add Vectorize memory retrieval
- Add D1 migrations for AI sessions and audit logs
- Add live CRDT document sync
- Add Theme Studio visual token editor
- Add plugin command registry
