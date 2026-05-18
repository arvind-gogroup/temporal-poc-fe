import type { WorkflowHistoryEvent, ReviewDetail } from "@/api/types";

/** Props for the workflow list table — data sourced internally via useWorkflows(). */
export interface WorkflowTableProps {
  // no external props — data sourced from useWorkflows() internally
}

/** Props for the detail card shown on the /dashboard/[workflowId] page. */
export interface WorkflowDetailCardProps {
  workflowId: string;
}

/** Props for the Temporal event history timeline. */
export interface WorkflowTimelineProps {
  events: WorkflowHistoryEvent[];
}

/** Props for the dialog that creates a new employee review workflow. */
export interface StartWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type { ReviewDetail };
