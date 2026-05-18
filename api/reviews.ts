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

/** Query parameters accepted by the workflow list endpoint. */
export interface FetchWorkflowsParams {
  status?: WorkflowStatus;
  page?: number;
  per_page?: number;
}

/**
 * Fetches a paginated list of review workflows.
 * @param params - optional status filter and pagination controls
 * @throws {ApiError} on HTTP 4xx/5xx
 */
export async function fetchWorkflows(params?: FetchWorkflowsParams): Promise<ReviewSummary[]> {
  const { data } = await apiClient.get(ENDPOINTS.REVIEWS.LIST, { params });
  return z.array(ReviewSummarySchema).parse(data.payload);
}

/**
 * Fetches full detail for a single workflow, including form data and AI summary.
 * @param workflowId - the workflow_id returned from startWorkflow
 * @throws {ApiError} 404 if not found
 */
export async function fetchWorkflow(workflowId: string): Promise<ReviewDetail> {
  const { data } = await apiClient.get(ENDPOINTS.REVIEWS.DETAIL(workflowId));
  return ReviewDetailSchema.parse(data.payload);
}

/**
 * Creates a new Temporal-backed employee review workflow.
 * @throws {ApiError} 400 on validation error
 */
export async function startWorkflow(
  body: StartWorkflowRequest
): Promise<StartWorkflowResponse> {
  const validated = StartWorkflowRequestSchema.parse(body);
  const { data } = await apiClient.post(ENDPOINTS.REVIEWS.START, validated);
  return StartWorkflowResponseSchema.parse(data.payload);
}

/**
 * Sends the employee self-review form to the running workflow.
 * @param workflowId - target workflow
 * @param body - the form payload; any JSON object is accepted
 * @throws {ApiError} 409 if the workflow is not in WAITING_FORM state
 */
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

/**
 * Sends the lead approval and rating to the running workflow.
 * @param workflowId - target workflow
 * @throws {ApiError} 409 if the workflow is not in WAITING_APPROVAL state
 */
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

/**
 * Fetches the raw Temporal event history for a workflow.
 * @param workflowId - target workflow
 */
export async function fetchWorkflowHistory(workflowId: string): Promise<WorkflowHistoryResponse> {
  const { data } = await apiClient.get(ENDPOINTS.REVIEWS.HISTORY(workflowId));
  return WorkflowHistoryResponseSchema.parse(data.payload);
}
