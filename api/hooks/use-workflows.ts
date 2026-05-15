import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { POLLING_INTERVAL_MS, STALE_TIME_MS } from "@/constants/enums";
import {
  fetchWorkflow,
  fetchWorkflows,
  signalFormSubmitted,
  signalLeadApproved,
  startWorkflow,
} from "@/api/reviews";
import type {
  ApproveSignalPayload,
  FormSubmitSignalPayload,
  StartWorkflowRequest,
} from "@/api/types";
import { ApiError } from "@/api/types";

export const workflowKeys = {
  all: ["workflows"] as const,
  lists: () => [...workflowKeys.all, "list"] as const,
  detail: (id: string) => [...workflowKeys.all, "detail", id] as const,
};

export function useWorkflows() {
  return useQuery({
    queryKey: workflowKeys.lists(),
    queryFn: fetchWorkflows,
    staleTime: STALE_TIME_MS,
    refetchInterval: POLLING_INTERVAL_MS,
  });
}

export function useWorkflow(workflowId: string) {
  return useQuery({
    queryKey: workflowKeys.detail(workflowId),
    queryFn: () => fetchWorkflow(workflowId),
    staleTime: STALE_TIME_MS,
    refetchInterval: POLLING_INTERVAL_MS,
    enabled: !!workflowId,
  });
}

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
