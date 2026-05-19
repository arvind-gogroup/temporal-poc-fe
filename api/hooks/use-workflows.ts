import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { POLLING_INTERVAL_MS, STALE_TIME_MS } from "@/constants/enums";
import {
  fetchWorkflow,
  fetchWorkflows,
  fetchWorkflowHistory,
  signalFormSubmitted,
  signalLeadApproved,
  startWorkflow,
  type FetchWorkflowsParams,
} from "@/api/reviews";
import type {
  ApproveSignalPayload,
  FormSubmitSignalPayload,
  StartWorkflowRequest,
} from "@/api/types";
import { ApiError } from "@/api/types";

/**
 * Query key factory for all workflow-related queries.
 * Centralising keys here enables targeted cache invalidation after mutations.
 */
export const workflowKeys = {
  all: ["workflows"] as const,
  lists: () => [...workflowKeys.all, "list"] as const,
  detail: (id: string) => [...workflowKeys.all, "detail", id] as const,
  history: (id: string) => [...workflowKeys.all, "history", id] as const,
};

/**
 * Polls the full workflow list every {@link POLLING_INTERVAL_MS} for live status updates.
 * @param params - optional status filter and pagination
 */
export function useWorkflows(params?: FetchWorkflowsParams) {
  return useQuery({
    queryKey: [...workflowKeys.lists(), params],
    queryFn: () => fetchWorkflows(params),
    staleTime: STALE_TIME_MS,
    refetchInterval: POLLING_INTERVAL_MS,
  });
}

/**
 * Polls a single workflow every {@link POLLING_INTERVAL_MS}.
 * Disabled when workflowId is empty.
 */
export function useWorkflow(workflowId: string) {
  return useQuery({
    queryKey: workflowKeys.detail(workflowId),
    queryFn: () => fetchWorkflow(workflowId),
    staleTime: STALE_TIME_MS,
    refetchInterval: POLLING_INTERVAL_MS,
    enabled: !!workflowId,
  });
}

/**
 * Polls the raw Temporal event history every {@link POLLING_INTERVAL_MS}.
 * Events are appended by Temporal as the workflow progresses, so polling keeps the timeline live.
 */
export function useWorkflowHistory(workflowId: string) {
  return useQuery({
    queryKey: workflowKeys.history(workflowId),
    queryFn: () => fetchWorkflowHistory(workflowId),
    staleTime: STALE_TIME_MS,
    refetchInterval: POLLING_INTERVAL_MS,
    enabled: !!workflowId,
  });
}

/** Creates a new employee review workflow. Invalidates the workflow list on success. */
export function useStartWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: StartWorkflowRequest) => startWorkflow(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      toast.success("Review workflow started");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError ? error.message : "Failed to start workflow";
      toast.error(message);
    },
  });
}

/**
 * Sends the employee self-review form signal to the workflow.
 * Invalidates the list and detail on success.
 * Expects the workflow to be in WAITING_FORM state; errors (409) otherwise.
 */
export function useSignalFormSubmitted(workflowId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: FormSubmitSignalPayload) =>
      signalFormSubmitted(workflowId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(workflowId) });
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      toast.success("Form submitted successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError ? error.message : "Failed to submit form";
      toast.error(message);
    },
  });
}

/**
 * Sends the lead approval signal to the workflow.
 * Invalidates the list and detail on success.
 * Expects the workflow to be in WAITING_APPROVAL state; errors (409) otherwise.
 */
export function useSignalLeadApproved(workflowId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApproveSignalPayload) =>
      signalLeadApproved(workflowId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(workflowId) });
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      toast.success("Workflow approved");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError ? error.message : "Failed to approve workflow";
      toast.error(message);
    },
  });
}
