import type { WorkflowHistoryEvent, ReviewDetail } from "@/api/types";

export interface WorkflowTableProps {
  // no external props — data sourced from useWorkflows() internally
}

export interface WorkflowDetailCardProps {
  workflowId: string;
}

export interface WorkflowTimelineProps {
  events: WorkflowHistoryEvent[];
}

export interface StartWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type { ReviewDetail };
