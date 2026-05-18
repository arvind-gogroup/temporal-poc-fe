# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # eslint
npm run start    # start production server
```

No test runner is configured.

## Environment

Copy `.env.example` to `.env` before running:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The backend must be running locally. Interactive API docs are at `http://localhost:8000/docs`.

## Stack

- **Next.js 16.2.6** (App Router) + **React 19**
- **TailwindCSS v4** — PostCSS-based, no `tailwind.config.js`
- **shadcn** components built on **`@base-ui/react`** — no `asChild` prop; read component source before using primitives
- **TanStack Query v5** for all server state (polling + mutations)
- **Zod** for schema validation on both API responses and form inputs
- **react-hook-form** + `@hookform/resolvers/zod` for forms
- **Sonner** for toast notifications (mounted in `api/providers.tsx`)
- **Axios** as the HTTP client

## Architecture

### Layer separation

```
api/          — pure data layer (no JSX)
  axios.ts        axios instance (reads NEXT_PUBLIC_API_URL, attaches error interceptor)
  types.ts        Zod schemas + inferred TypeScript types for all API shapes
  reviews.ts      typed async functions for each endpoint
  hooks/
    use-workflows.ts  TanStack Query hooks (useQuery + useMutation) consumed by components
  providers.tsx   QueryClientProvider + Toaster, mounted in app/layout.tsx

constants/
  endpoints.ts    all API URL paths as constants
  enums.ts        WorkflowStatus union, POLLING_INTERVAL_MS, STALE_TIME_MS, RATING_OPTIONS, STATUS_STYLES/LABELS

components/
  ui/             shadcn primitives (button, card, dialog, table, …)
  shared/         reusable cross-feature components (WorkflowStatusBadge, SignalButton)
  dashboard/      feature-specific components (WorkflowTable, StartWorkflowDialog, WorkflowDetailCard, WorkflowTimeline)

app/              Next.js App Router pages
  layout.tsx      wraps everything in <Providers>
  dashboard/      list page and [workflowId] detail route
```

### API response envelope

Every backend response is wrapped:
```ts
interface ApiResponse<T> {
  payload: T | null;
  status: { success: boolean; code: number; message?: string };
  meta?: ApiMeta | null;   // only on paginated list endpoints
}
```
Functions in `api/reviews.ts` always unwrap `data.payload` and parse it with the relevant Zod schema before returning. Never access `payload` directly in components — use the typed hooks.

### Data flow

1. Components call hooks from `api/hooks/use-workflows.ts`.
2. Hooks call functions from `api/reviews.ts`.
3. Functions call the Axios instance in `api/axios.ts`.
4. The Axios error interceptor converts backend error envelopes into `ApiError` instances (see `api/types.ts`).
5. Mutation hooks catch `ApiError` and call `toast.error(error.message)`.

### Polling

`useWorkflows` and `useWorkflow` poll every `POLLING_INTERVAL_MS` (5 s) with a `staleTime` of 4 s. This drives live status updates without websockets.

### Signals

Workflow state transitions are triggered by POST requests to signal endpoints (`/signal/form_submitted`, `/signal/lead_approved`). These return 409 if the workflow is not in the expected state — the Axios interceptor converts this to an `ApiError` surfaced as a toast.

## JSDoc coverage

All exported symbols have JSDoc. Notable annotations worth knowing:

- `api/axios.ts` — documents the error interceptor behaviour
- `api/types.ts` — `ApiResponse<T>` and `ApiError` are annotated; each schema has a one-line description
- `api/reviews.ts` — every function has `@param`/`@throws` noting the HTTP status and required workflow state
- `api/hooks/use-workflows.ts` — each hook documents polling behaviour and cache-invalidation scope; `workflowKeys` documents why the factory exists
- `constants/enums.ts` — `STALE_TIME_MS` documents its invariant relationship to `POLLING_INTERVAL_MS`
- `components/shared/signal-button.tsx` — documents the generic signal pattern
- `components/dashboard/workflow-detail-card.tsx` — documents which status gates which action button

---

### Type safety

`WorkflowStatus` and all related display maps (`STATUS_STYLES`, `STATUS_LABELS`) are defined in `constants/enums.ts` as the single source of truth. `api/types.ts` imports from there so Zod schemas and TypeScript types stay in sync.
