import type { WorkflowStatus } from "@/api/types";

export interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
}

export interface SignalFieldConfig {
  name: string;
  label: string;
  type: "text" | "number";
  placeholder?: string;
  validation: {
    required?: string;
    min?: { value: number; message: string };
    max?: { value: number; message: string };
  };
}

export interface SignalButtonProps {
  label: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  dialogTitle: string;
  dialogDescription?: string;
  fields?: SignalFieldConfig[];
  onSignal: (data: Record<string, unknown>) => Promise<unknown>;
  disabled?: boolean;
}
