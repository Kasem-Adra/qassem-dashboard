# Monorepo Foundation — Phase 1

This repository now contains a forward-compatible AI OS monorepo foundation while preserving the existing static Cloudflare Pages app.

## Added structure

```txt
apps/web              Next.js AI Workspace shell
apps/workers          Cloudflare Worker entrypoint
packages/ui           Shared UI primitives
packages/theme-engine Theme token system
packages/ai-core      Provider abstraction + streaming response foundation
packages/realtime     Presence/event contracts
packages/database     Database domain map
packages/security     Security constants
```

## First run

```bash
corepack enable
pnpm install
pnpm web
```

## Phase 1 status

- Monorepo scaffold: done
- Next.js AI Workspace: foundation done
- Cinematic App Shell: foundation done
- Command Palette: foundation done
- AI Streaming Interface: route + UI placeholder done
- Cloudflare Workers: typed entrypoint done
- Realtime Collaboration Layer: event/presence contracts done

## Next implementation targets

1. Move legacy `index.html`, `dashboard.html`, and `_worker.js` features into Next.js routes and Worker modules.
2. Add shadcn/ui installation and component registry.
3. Replace AI placeholder stream with AI SDK provider router.
4. Implement Durable Object rooms for live presence and CRDT patches.
5. Expand D1 schema to organizations, workspaces, permissions, AI memory, plugins, and audit domains.
