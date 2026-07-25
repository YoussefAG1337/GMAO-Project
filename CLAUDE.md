# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

GMAO (Gestion de Maintenance Assistee par Ordinateur) is a maintenance management system for tracking equipment, work orders (OT), intervention requests (DI), preventive maintenance plans, and spare-parts inventory (Magasin PDR). It is a monorepo with two independent Node projects:

- `gmao-backend/` — Express 5 + Prisma (MySQL) API, TypeScript strict mode.
- `gmao-frontend/` — Next.js 16 (App Router) + React 19 + TailwindCSS v4 + shadcn/ui, French-language UI.
- `terraform/` — Azure infrastructure (Container Apps, VNet, MySQL Flexible Server, monitoring), modularized by domain (`networking`, `database`, `identity`, `compute`, `monitoring`).

Each subfolder has its own `package.json`, `.gitignore`, and env files — there is no workspace tooling tying them together. Always `cd` into the relevant subfolder (or use `working-directory` in commands) before running scripts.

## Commands

### Backend (`gmao-backend/`)
```bash
npm run dev            # tsx watch src/index.ts - local dev server
npm run build           # tsc build to dist/
npm start                # run built dist/index.js
npm run lint              # eslint src
npx prisma validate && npx tsc --noEmit   # what CI runs for static checks
npm test                 # currently a no-op ("No backend tests defined yet")
npm run db:migrate      # prisma migrate dev
npm run db:seed          # tsx prisma/seed.ts
npm run db:reset         # prisma migrate reset
npm run db:studio        # prisma studio
```
There are no backend automated tests yet - don't assume `npm test` exercises anything.

### Frontend (`gmao-frontend/`)
```bash
npm run dev              # next dev
npm run build             # next build (standalone output)
npm run lint               # eslint
npx tsc --noEmit           # type-check (run before considering frontend work done)
npx vitest run             # run the full test suite (jsdom + Testing Library)
npx vitest run path/to/x.test.ts   # run a single test file
```
Tests live beside the code they cover, in `__tests__/` directories (e.g. `src/services/__tests__/di.service.test.ts`, `src/features/dis/hooks/__tests__/useDis.test.tsx`). Test env is jsdom via `vitest.config.ts` / `vitest.setup.ts`.

### CI (`.github/workflows/ci.yml`)
Runs on push/PR to `main`: backend job (lint, `prettier --check`, `prisma validate`, `prisma generate`, `tsc --noEmit`, tests w/ coverage, `npm audit --audit-level=high`), frontend job (lint, `prettier --check`, `tsc --noEmit`, `next build`, `npm audit`), and an independent TruffleHog secret-scan job. Match these checks locally before pushing.

## Backend architecture

Thin Controller / Fat Service pattern, strictly layered:

```
routes/ -> middleware (auth, rbac, validate) -> controllers/ -> services/ -> Prisma
```

- **Controllers** (`src/controllers/*.controller.ts`) only orchestrate: parse the validated request, call one service method, shape the HTTP response. No business logic, no try/catch - Express 5's native async handling propagates errors to `errorHandler.middleware.ts`.
- **Services** (`src/services/*.service.ts`) hold all business logic and talk to Prisma directly - there is no separate repository layer (a deliberate choice to avoid over-engineering).
- **Interfaces** (`src/interfaces/services/I*.ts`) define explicit contracts for each service (Interface Segregation Principle). When adding a service method, update the interface too.
- **DTOs** (`src/dtos/*.dto.ts`) are Zod schemas (Zod v4, not Joi/class-validator - chosen for TS inference). `validate.middleware.ts` parses `body`/`query`/`params` against a DTO before the controller runs.
- **Auth**: JWT via `access_token` (15 min) / `refresh_token` (7 day) HTTP-only cookies (`auth.middleware.ts`), role-based access via `rbac.middleware.ts` and the Prisma `Role` enum (`ADMIN`, `CHEF_MAINTENANCE`, `CHEF_TECHNICIEN`, `TECHNICIEN`, `MAGASINIER`). Refresh tokens **rotate** with family-wide reuse detection (`auth.service.ts`). Rotation has a **30s grace window**: the newly-issued token pair is cached in Redis keyed by the old token's hash (`refresh:grace:<hash>`), so a benign replay of a just-rotated token (multiple tabs share the refresh cookie and race on `/refresh`) returns the same pair idempotently instead of tripping reuse-detection and logging everyone out. Replays *after* the window still revoke the family. Redis failure degrades to strict behavior. **Don't** revert rotation to hard-revoke-on-use without restoring this grace path — it reintroduces spurious ~15-min multi-tab logouts.
- **Config & lifecycle**: `src/config/env.ts` validates all env vars with Zod at boot (imported first in `tracing.ts`) — missing/invalid config, or weak/default JWT secrets in production, abort startup. `src/index.ts` handles `SIGTERM`/`SIGINT` for graceful shutdown (close HTTP → drain BullMQ worker → close Redis/Prisma → exit 0). `src/config/redis.ts` is a shared `ioredis` client (grace cache, general use) separate from BullMQ's own connection — both need `error` listeners (an unlistened `ioredis` `error` crashes Node).
- **Cron/jobs** (`src/cron/`, `src/jobs/`): `preventive.service.ts` generates OTs from maintenance plans; both the daily cron and the manual "trigger now" HTTP endpoint call the same service method (no duplicated generation logic). `outbox.cron.ts` sweeps unsent email events as a fallback.
- **Email notifications** use a Transactional Outbox Pattern: the intent to send an email is written to the `OutboxEvent` table in the same DB transaction as the triggering entity (e.g. a new DI), then BullMQ (Redis-backed, `email.queue.ts`) attempts instant delivery. The Node-Cron sweeper picks up anything still `PENDING`. BullMQ's `jobId` is set to `OutboxEvent.id` for idempotency (prevents duplicate sends if both the instant push and the cron fire). Queue/worker `error` listeners are mandatory - an unhandled `ioredis` `error` event crashes the Node process.
- **Express 5 quirk**: `req.query` is a **getter that re-parses the querystring on every access** — mutating it in place (`delete` + `Object.assign`) is silently discarded, so validated/coerced query values never reach the controller. `validate.middleware.ts` therefore **replaces the getter** with the parsed object via `Object.defineProperty(req, 'query', { value, writable, configurable })`. (`req.params` is a normal property, so `Object.assign` is fine there.) When adding query validation to a route, read the coerced values straight off `req.query` in the controller — don't re-`parseInt` the raw string.
- **Pagination**: list endpoints (DIs, OTs, rapports, plans) return a standard envelope `data: { items, total, page, limit, totalPages }` built by `src/utils/pagination.ts` (`buildPagination`, `paginated`). Query params (`page`/`limit` + entity filters) are validated by a Zod schema extending `paginationQuery` (`src/dtos/pagination.dto.ts`) — `limit` is **clamped** to 100, not rejected. Reference/dropdown lists (ateliers/lignes/postes/familles/pannes) stay un-paginated (fetch-all).
- **Prisma**: schema at `prisma/schema.prisma` (MySQL). Key enums: `Role`, `StatutDI`, `StatutOT`, `Priorite`, `TypeMaintenance`, `FrequenceMaintenance`, `TypePanne`. `Panne` (standardized incident type) is linked to either a `Ligne` or a `Poste`, never both - queries needing pannes for a DI must `OR` across `ligneId`/`posteId`, not `AND`.
- Generated Prisma client output lives under `src/generated/` (gitignored) - run `npx prisma generate` after schema changes.

## Frontend architecture

Feature-Sliced Design combined with Next.js Server Components:

```
app/dashboard/<feature>/page.tsx   -> thin async Server Component: fetches initialData via api-server, passes to a Client component
features/<feature>/components/     -> *Client.tsx orchestrator + presentational components/modals
features/<feature>/hooks/          -> use*.ts - SWR-based data hooks, the only thing components call
services/<feature>.service.ts      -> typed API wrapper functions, the only thing hooks call
```

Strict layering: **components never call `api`/`useSWR` directly.** Component -> hook -> service -> `lib/api.ts`. Enforce this when adding new features or the coupling that was deliberately removed will come back.

- **`src/lib/api.ts`** - client-side Axios-like wrapper used by hooks/services in Client Components.
- **`src/lib/api-server.ts`** - server-side fetch wrapper for Server Components; pulls the `access_token` cookie via `next/headers` `cookies()` and forwards it as a `Cookie:` header (cookies aren't automatically attached to server-side `fetch`). On a 401 it redirects to `/login?expired=true`. Has an **8s `AbortController` timeout** (→ `504`) so a hung backend can't block the render. **Don't wrap a page's primary resource in `.catch(() => [])`** — that also swallows the `/login` redirect and real errors; only the secondary reference lists get a `.catch` fallback.
- **Response shape**: the backend wraps everything as `{ success, data }`. `api-server.ts` calls require an explicit `.then(res => res.data)` to match what the client-side fetcher already unwraps - don't pass the raw wrapper into `fallbackData`.
- **Pagination & filters**: list pages (DIs/OTs/rapports/plans) are **URL-driven** — the Server Component reads `await searchParams`, and both it and the client build the same key via `buildListQuery`/`parseListParams` (`src/lib/pagination.ts`) so SWR `fallbackData` matches the visible page. Services expose `list(params) → PaginatedResponse<T>` with a `keys.list(params)` function; hooks take `(params, initialData)` + `keepPreviousData`. Shared `<Pagination>` (`components/ui/pagination.tsx`) and per-feature `*Filters` components `router.push` the updated `?page=/?statut=…` (filters reset `page`).
- **`useReferenceData()`** (global hook) - fetch shared reference lists (produits, lignes, postes, etc.) once via SWR dedup; don't add ad hoc fetches for these in individual modals.
- **`SWRProvider`** - wraps the app with a single global fetcher config; don't create local Axios/SWR configs inside feature components.
- Pages (`page.tsx`) should stay small (10-20 lines): async Server Component fetching with `Promise.all()` (avoid sequential-await waterfalls) and rendering a `*Client.tsx`.
- **Types**: `src/types/*.types.ts` define DTOs and a global `ApiResponse<T>` wrapper - avoid `any` on API responses.
- **UI theme**: dark aesthetic, Luminous Violet/Indigo (`#651FAA`) on shadcn/ui defaults. See `ui-registry.md` for the authoritative class baseline (card/button/input/text conventions) - check it before hand-rolling new component styling.
- **Proxy** (`src/proxy.ts`, Next.js's renamed `middleware.ts` convention) handles auth-redirect logic at the edge; `instrumentation.ts` guards Node-only imports (e.g. `@azure/monitor-opentelemetry`) behind `process.env.NEXT_RUNTIME === 'nodejs'` since this file also loads in the Edge runtime.

## Repo-specific documents worth checking before large changes

Project documentation is split by concern - check the one matching what you're touching before re-deciding something already evaluated:

- `dev.md` - Epic/feature tracking and application-level architecture decisions (backend SOLID/service layer, frontend FSD/RSC, email reliability, etc.).
- `ci-cd.md` - GitHub Actions pipeline design and history (CI checks, OIDC deployment auth, container registry tagging).
- `iac.md` - Terraform-specific patterns and gotchas (state management, module refactors, lifecycle blocks) - cloud-agnostic IaC mechanics, as distinct from Azure product behavior.
- `azure.md` - Azure-specific service selection, product quirks, and observability/cost decisions.
- `observability.md` - the self-hosted OTel/Tempo/Prometheus/Grafana stack: architecture, milestone log, and hard-won gotchas (entry-point ordering, honor_labels, flush timing) - read before touching instrumentation or `observability/` configs.
- `memory.md` - most recent session's state, decisions, and "next session starts with" pointer.
- `ui-registry.md` - canonical Tailwind class choices for UI consistency.

These are living docs; update the relevant one when making a significant architectural decision, per this repo's existing convention (see the bottom of `dev.md`).
