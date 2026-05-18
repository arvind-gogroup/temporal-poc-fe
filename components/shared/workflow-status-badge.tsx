import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_STYLES, STATUS_LABELS } from "@/constants/enums";
import type { WorkflowStatusBadgeProps } from "./types";

/** Renders a coloured badge for a workflow status using STATUS_STYLES and STATUS_LABELS. */
export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status])}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
