import { z } from "zod";
import { WORKFLOW_STATUSES } from "@/constants/enums";

// --- Envelope ---

export interface ApiMeta {
  page: number;
  per_page: number;
  total_pages: number;
  total_records: number;
  filters?: Record<string, unknown>;
}

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

export const FormSubmitSignalPayloadSchema = z.object({
  form_data: z.record(z.string(), z.unknown()),
});

export type FormSubmitSignalPayload = z.infer<typeof FormSubmitSignalPayloadSchema>;

export const ApproveSignalPayloadSchema = z.object({
  rating: z.string().min(1, "Rating is required"),
});

export type ApproveSignalPayload = z.infer<typeof ApproveSignalPayloadSchema>;

// --- Workflow History ---

export const WorkflowHistoryEventSchema = z.object({
  event_id: z.number(),
  event_type: z.string(),
  timestamp: z.string(),
  attributes: z.record(z.string(), z.unknown()),
});

export const WorkflowHistoryResponseSchema = z.object({
  workflow_id: z.string(),
  events: z.array(WorkflowHistoryEventSchema),
});

export type WorkflowHistoryEvent = z.infer<typeof WorkflowHistoryEventSchema>;
export type WorkflowHistoryResponse = z.infer<typeof WorkflowHistoryResponseSchema>;

// --- Error ---

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
