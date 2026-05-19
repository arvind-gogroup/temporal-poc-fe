import { z } from "zod";
import { WORKFLOW_STATUSES } from "@/constants/enums";

// --- Envelope ---

/** Pagination metadata included on list endpoint responses. */
export interface ApiMeta {
  page: number;
  per_page: number;
  total_pages: number;
  total_records: number;
  filters?: Record<string, unknown>;
}

/**
 * Universal response envelope wrapping every backend response.
 * Always read data from `payload`; never from the raw Axios response body.
 */
export interface ApiResponse<T> {
  payload: T | null;
  status: {
    success: boolean;
    code: number;
    message?: string;
  };
  meta?: ApiMeta | null;
}

// --- Status ---

export const WorkflowStatusSchema = z.enum(WORKFLOW_STATUSES);

export type { WorkflowStatus } from "@/constants/enums";

// --- ReviewSummary (list endpoint) ---

/** Shape of each item returned by GET /api/reviews. */
export const ReviewSummarySchema = z.object({
  workflow_id: z.string(),
  employee_id: z.string(),
  lead_id: z.string(),
  status: WorkflowStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;

// --- ReviewDetail (single endpoint) ---

/** Full workflow detail returned by GET /api/reviews/{workflow_id}. */
export const ReviewDetailSchema = z.object({
  id: z.string(),
  workflow_id: z.string(),
  employee_id: z.string(),
  lead_id: z.string(),
  status: WorkflowStatusSchema,
  form_data: z.record(z.string(), z.unknown()).nullable(),
  ai_summary: z.string().nullable(),
  rating: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ReviewDetail = z.infer<typeof ReviewDetailSchema>;

// --- StartWorkflow ---

/** Request payload for POST /api/reviews/start. Validated client-side before sending. */
export const StartWorkflowRequestSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  lead_id: z.string().min(1, "Lead ID is required"),
});

export type StartWorkflowRequest = z.infer<typeof StartWorkflowRequestSchema>;

export const StartWorkflowResponseSchema = z.object({
  workflow_id: z.string(),
  employee_id: z.string(),
  lead_id: z.string(),
  status: WorkflowStatusSchema,
  created_at: z.string(),
});

export type StartWorkflowResponse = z.infer<typeof StartWorkflowResponseSchema>;

// --- Signals ---

export const SignalResponseSchema = z.object({
  message: z.string(),
  workflow_id: z.string(),
});

export type SignalResponse = z.infer<typeof SignalResponseSchema>;

/** Payload for the form_submitted signal. Any JSON object is valid as form_data. */
export const FormSubmitSignalPayloadSchema = z.object({
  form_data: z.record(z.string(), z.unknown()),
});

export type FormSubmitSignalPayload = z.infer<typeof FormSubmitSignalPayloadSchema>;

/** Payload for the lead_approved signal. */
export const ApproveSignalPayloadSchema = z.object({
  rating: z.string().min(1, "Rating is required"),
});

export type ApproveSignalPayload = z.infer<typeof ApproveSignalPayloadSchema>;

// --- Workflow History ---

/** A single Temporal event within a workflow stage, with a human-readable label. */
export const StageEventSchema = z.object({
  event_id: z.number(),
  event_type: z.string(),
  label: z.string(),
  timestamp: z.string(),
});

/** One logical stage of workflow execution, grouping related Temporal events. */
export const WorkflowStageSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string(),
  status: z.enum(["completed", "active", "pending"]),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  event_count: z.number(),
  key_event: z.string().nullable(),
  events: z.array(StageEventSchema),
});

/** Staged Temporal execution history returned by GET /api/reviews/{id}/history. */
export const WorkflowHistoryResponseSchema = z.object({
  workflow_id: z.string(),
  total_events: z.number(),
  stages: z.array(WorkflowStageSchema),
});

export type StageEvent = z.infer<typeof StageEventSchema>;
export type WorkflowStage = z.infer<typeof WorkflowStageSchema>;
export type WorkflowHistoryResponse = z.infer<typeof WorkflowHistoryResponseSchema>;

// --- Error ---

/**
 * Typed error thrown by the Axios interceptor for all non-2xx responses.
 * `status` mirrors the HTTP status code; `message` comes from the error envelope when available.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
