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

export const POLLING_INTERVAL_MS = 5_000;
export const STALE_TIME_MS = 4_000;

export const RATING_OPTIONS = [
  "exceeds_expectations",
  "meets_expectations",
  "needs_improvement",
] as const;

export type RatingOption = (typeof RATING_OPTIONS)[number];

// --- Status display mappings ---

export const STATUS_STYLES: Record<WorkflowStatus, string> = {
  INITIATED: "bg-blue-100 text-blue-800 border-blue-200",
  WAITING_FORM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  FORM_SUBMITTED: "bg-orange-100 text-orange-800 border-orange-200",
  WAITING_APPROVAL: "bg-purple-100 text-purple-800 border-purple-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
};

export const STATUS_LABELS: Record<WorkflowStatus, string> = {
  INITIATED: "Initiated",
  WAITING_FORM: "Waiting Form",
  FORM_SUBMITTED: "Form Submitted",
  WAITING_APPROVAL: "Waiting Approval",
  APPROVED: "Approved",
  COMPLETED: "Completed",
  FAILED: "Failed",
};
