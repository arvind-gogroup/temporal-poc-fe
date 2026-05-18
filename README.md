# Employee Review Workflow — Frontend

A Next.js dashboard for managing Temporal.io-backed employee review workflows. HR admins start reviews, employees submit self-assessments, and leads approve with a rating — all driven by a Temporal workflow running on the backend.

---

## Prerequisites

- Node.js 18+
- The [backend API](http://localhost:8000) running locally (see `API_INTEGRATION.md` for the full spec)

---

## Setup

```bash
cp .env.example .env   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev            # http://localhost:3000
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 (PostCSS-based, no `tailwind.config.js`) |
| Components | shadcn built on `@base-ui/react` |
| Server state | TanStack Query v5 |
| HTTP | Axios |
| Validation | Zod v4 |
| Forms | react-hook-form + `@hookform/resolvers/zod` |
| Toasts | Sonner |

---

## Project Structure

```
app/
  layout.tsx                  # root layout — mounts <Providers>
  page.tsx                    # redirects to /dashboard
  dashboard/
    page.tsx                  # workflow list
    [workflowId]/page.tsx     # workflow detail

api/                          # pure data layer (no JSX)
  axios.ts                    # Axios instance + error interceptor
  types.ts                    # Zod schemas and TypeScript types
  reviews.ts                  # typed async functions for each endpoint
  hooks/
    use-workflows.ts          # TanStack Query hooks (useQuery + useMutation)
  providers.tsx               # QueryClientProvider + Toaster

constants/
  endpoints.ts                # all API URL paths
  enums.ts                    # WorkflowStatus, polling config, rating options, display maps

components/
  ui/                         # shadcn primitives (button, card, dialog, table…)
  shared/
    workflow-status-badge.tsx # coloured status badge
    signal-button.tsx         # generic configurable dialog button for sending signals
  dashboard/
    workflow-table.tsx        # list page table with polling
    workflow-detail-card.tsx  # detail page with context-aware action buttons
    workflow-timeline.tsx     # Temporal event history timeline
    start-workflow-dialog.tsx # dialog form to create a new workflow

lib/
  utils.ts                    # cn() Tailwind class merge utility
```

---

## Architecture

### API layer

All HTTP calls go through `api/axios.ts`, which is a pre-configured Axios instance. The response interceptor converts every non-2xx response into a typed `ApiError`, extracting the error message from the backend's error envelope automatically.

Every backend response is wrapped in a universal envelope:

```ts
interface ApiResponse<T> {
  payload: T | null;
  status: { success: boolean; code: number; message?: string };
  meta?: ApiMeta | null;  // only on paginated list endpoints
}
```

Functions in `api/reviews.ts` unwrap `payload` and parse it with the relevant Zod schema before returning — components never touch the raw envelope.

### Data flow

```
Component
  → hook (api/hooks/use-workflows.ts)
    → API function (api/reviews.ts)
      → Axios instance (api/axios.ts)
        → Backend (NEXT_PUBLIC_API_URL)
```

Mutation hooks surface `ApiError.message` as a Sonner toast on failure.

### Live polling

`useWorkflows` and `useWorkflow` both poll every **5 s** (`POLLING_INTERVAL_MS`) with a stale time of **4 s** (`STALE_TIME_MS`), so every poll interval triggers a fresh network request without extra re-renders.

### Temporal signals

State transitions are triggered by POST requests to signal endpoints:

| Signal | Endpoint | Required status |
|--------|----------|-----------------|
| Employee submits form | `POST /api/reviews/{id}/signal/form_submitted` | `WAITING_FORM` |
| Lead approves | `POST /api/reviews/{id}/signal/lead_approved` | `WAITING_APPROVAL` |

The backend returns HTTP 409 if the workflow is not in the expected state. The `SignalButton` component in `components/shared/` is a generic reusable dialog that handles any signal — no per-signal dialog component needed.

### Workflow status lifecycle

```
INITIATED → WAITING_FORM → FORM_SUBMITTED → WAITING_APPROVAL → APPROVED → COMPLETED
                                                                         ↘ FAILED
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend base URL |

---

## API Reference

See `API_INTEGRATION.md` for the full endpoint spec, request/response shapes, and the happy-path flow.
