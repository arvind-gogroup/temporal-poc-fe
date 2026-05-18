import type { WorkflowStatus } from "@/api/types";

export interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
}

/** Config for a single form field rendered inside a SignalButton dialog. */
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

/**
 * Props for the generic SignalButton component.
 * `onSignal` receives the raw form values and should call the relevant mutation.
 */
export interface SignalButtonProps {
  label: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  dialogTitle: string;
  dialogDescription?: string;
  fields?: SignalFieldConfig[];
  onSignal: (data: Record<string, unknown>) => Promise<unknown>;
  disabled?: boolean;
}
