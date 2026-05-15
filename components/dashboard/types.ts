import type { StatusHistoryEntry, Workflow } from "@/api/types";

export interface WorkflowTableProps {
  // no external props — data sourced from useWorkflows() internally
}

export interface WorkflowDetailCardProps {
  workflowId: string;
}

export interface WorkflowTimelineProps {
  history: StatusHistoryEntry[];
}

export interface StartWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type { Workflow };
