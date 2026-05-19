// --- WorkflowStatus — single source of truth ---

export const WORKFLOW_STATUSES = [
  "INITIATED",
  "WAITING_FORM",
  "FORM_SUBMITTED",
  "WAITING_APPROVAL",
  "APPROVED",
  "COMPLETED",
  "FAILED",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

// --- App config ---

/** How often live queries re-fetch workflow data (ms). */
export const POLLING_INTERVAL_MS = 5_000;

/**
 * How long a cached result is considered fresh (ms).
 * Kept below POLLING_INTERVAL_MS so every poll triggers a network request.
 */
export const STALE_TIME_MS = 4_000;

/** Valid rating values for the lead_approved signal. */
export const RATING_OPTIONS = [
  "exceeds_expectations",
  "meets_expectations",
  "needs_improvement",
] as const;

export type RatingOption = (typeof RATING_OPTIONS)[number];

// --- Status display mappings ---

/** Tailwind class strings per status, consumed by WorkflowStatusBadge. */
export const STATUS_STYLES: Record<WorkflowStatus, string> = {
  INITIATED:        "bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-950/40  dark:text-blue-300   dark:border-blue-800/50",
  WAITING_FORM:     "bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-950/40 dark:text-amber-300  dark:border-amber-800/50",
  FORM_SUBMITTED:   "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50",
  WAITING_APPROVAL: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50",
  APPROVED:         "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  COMPLETED:        "bg-slate-100 text-slate-600   border-slate-200  dark:bg-slate-800/40 dark:text-slate-300   dark:border-slate-700/50",
  FAILED:           "bg-red-50    text-red-700    border-red-200    dark:bg-red-950/40   dark:text-red-300    dark:border-red-800/50",
};

/** Tailwind bg class for the status dot in WorkflowStatusBadge. */
export const STATUS_DOT_COLORS: Record<WorkflowStatus, string> = {
  INITIATED:        "bg-blue-500",
  WAITING_FORM:     "bg-amber-500",
  FORM_SUBMITTED:   "bg-orange-500",
  WAITING_APPROVAL: "bg-violet-500",
  APPROVED:         "bg-emerald-500",
  COMPLETED:        "bg-slate-400",
  FAILED:           "bg-red-500",
};

/** Human-readable display labels per status. */
export const STATUS_LABELS: Record<WorkflowStatus, string> = {
  INITIATED: "Initiated",
  WAITING_FORM: "Waiting Form",
  FORM_SUBMITTED: "Form Submitted",
  WAITING_APPROVAL: "Waiting Approval",
  APPROVED: "Approved",
  COMPLETED: "Completed",
  FAILED: "Failed",
};
