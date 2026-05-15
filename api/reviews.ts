import { z } from "zod";
import apiClient from "./axios";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  ReviewSummarySchema,
  ReviewDetailSchema,
  StartWorkflowRequestSchema,
  StartWorkflowResponseSchema,
  SignalResponseSchema,
  FormSubmitSignalPayloadSchema,
  ApproveSignalPayloadSchema,
  WorkflowHistoryResponseSchema,
  type ReviewSummary,
  type ReviewDetail,
  type StartWorkflowRequest,
  type StartWorkflowResponse,
  type SignalResponse,
  type FormSubmitSignalPayload,
  type ApproveSignalPayload,
  type WorkflowHistoryResponse,
} from "./types";
import type { WorkflowStatus } from "@/constants/enums";

export interface FetchWorkflowsParams {
  status?: WorkflowStatus;
  page?: number;
  per_page?: number;
}

export async function fetchWorkflows(params?: FetchWorkflowsParams): Promise<ReviewSummary[]> {
  const { data } = await apiClient.get(ENDPOINTS.REVIEWS.LIST, { params });
  return z.array(ReviewSummarySchema).parse(data.payload);
}

export async function fetchWorkflow(workflowId: string): Promise<ReviewDetail> {
  const { data } = await apiClient.get(ENDPOINTS.REVIEWS.DETAIL(workflowId));
  return ReviewDetailSchema.parse(data.payload);
}

export async function startWorkflow(
  body: StartWorkflowRequest
): Promise<StartWorkflowResponse> {
  const validated = StartWorkflowRequestSchema.parse(body);
  const { data } = await apiClient.post(ENDPOINTS.REVIEWS.START, validated);
  return StartWorkflowResponseSchema.parse(data.payload);
}

export async function signalFormSubmitted(
  workflowId: string,
  body: FormSubmitSignalPayload
): Promise<SignalResponse> {
  const validated = FormSubmitSignalPayloadSchema.parse(body);
  const { data } = await apiClient.post(
    ENDPOINTS.REVIEWS.SIGNAL_FORM_SUBMITTED(workflowId),
    validated
  );
  return SignalResponseSchema.parse(data.payload);
}

export async function signalLeadApproved(
  workflowId: string,
  body: ApproveSignalPayload
): Promise<SignalResponse> {
  const validated = ApproveSignalPayloadSchema.parse(body);
  const { data } = await apiClient.post(
    ENDPOINTS.REVIEWS.SIGNAL_LEAD_APPROVED(workflowId),
    validated
  );
  return SignalResponseSchema.parse(data.payload);
}

export async function fetchWorkflowHistory(workflowId: string): Promise<WorkflowHistoryResponse> {
  const { data } = await apiClient.get(ENDPOINTS.REVIEWS.HISTORY(workflowId));
  return WorkflowHistoryResponseSchema.parse(data.payload);
}
