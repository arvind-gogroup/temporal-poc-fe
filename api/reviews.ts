import apiClient from "./axios";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  WorkflowSchema,
  WorkflowListResponseSchema,
  StartWorkflowRequestSchema,
  StartWorkflowResponseSchema,
  SignalResponseSchema,
  FormSubmitSignalPayloadSchema,
  ApproveSignalPayloadSchema,
  type Workflow,
  type StartWorkflowRequest,
  type StartWorkflowResponse,
  type SignalResponse,
  type FormSubmitSignalPayload,
  type ApproveSignalPayload,
} from "./types";

export async function fetchWorkflows(): Promise<Workflow[]> {
  const { data } = await apiClient.get(ENDPOINTS.REVIEWS.LIST);
  return WorkflowListResponseSchema.parse(data);
}

export async function fetchWorkflow(workflowId: string): Promise<Workflow> {
  const { data } = await apiClient.get(ENDPOINTS.REVIEWS.DETAIL(workflowId));
  return WorkflowSchema.parse(data);
}

export async function startWorkflow(
  body: StartWorkflowRequest
): Promise<StartWorkflowResponse> {
  const validated = StartWorkflowRequestSchema.parse(body);
  const { data } = await apiClient.post(ENDPOINTS.REVIEWS.START, validated);
  return StartWorkflowResponseSchema.parse(data);
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
  return SignalResponseSchema.parse(data);
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
  return SignalResponseSchema.parse(data);
}
