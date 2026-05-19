import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_STYLES, STATUS_LABELS, STATUS_DOT_COLORS } from "@/constants/enums";
import type { WorkflowStatusBadgeProps } from "./types";

/** Renders a coloured badge with a status dot for a workflow status using STATUS_STYLES, STATUS_DOT_COLORS, and STATUS_LABELS. */
export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", STATUS_STYLES[status])}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_COLORS[status])} />
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
