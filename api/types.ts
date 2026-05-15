import { z } from "zod";
import { WORKFLOW_STATUSES } from "@/constants/enums";

export const WorkflowStatusSchema = z.enum(WORKFLOW_STATUSES);

export type { WorkflowStatus } from "@/constants/enums";

export const StatusHistoryEntrySchema = z.object({
  status: WorkflowStatusSchema,
  timestamp: z.string(),
  notes: z.string().nullable().optional(),
});

export type StatusHistoryEntry = z.infer<typeof StatusHistoryEntrySchema>;

export const WorkflowSchema = z.object({
  workflow_id: z.string(),
  employee_id: z.string(),
  lead_id: z.string(),
  status: WorkflowStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  ai_summary: z.string().nullable(),
  form_data: z.record(z.string(), z.unknown()).nullable(),
  status_history: z.array(StatusHistoryEntrySchema),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

export const WorkflowListResponseSchema = z.array(WorkflowSchema);

export const StartWorkflowRequestSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  lead_id: z.string().min(1, "Lead ID is required"),
});

export type StartWorkflowRequest = z.infer<typeof StartWorkflowRequestSchema>;

export const StartWorkflowResponseSchema = z.object({
  workflow_id: z.string(),
  status: WorkflowStatusSchema,
});

export type StartWorkflowResponse = z.infer<typeof StartWorkflowResponseSchema>;

export const SignalResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type SignalResponse = z.infer<typeof SignalResponseSchema>;

export const FormSubmitSignalPayloadSchema = z.object({
  form_response: z.string().min(1, "Response is required"),
});

export type FormSubmitSignalPayload = z.infer<typeof FormSubmitSignalPayloadSchema>;

export const ApproveSignalPayloadSchema = z.object({
  rating: z.number().int().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
});

export type ApproveSignalPayload = z.infer<typeof ApproveSignalPayloadSchema>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
