import { Separator } from "@/components/ui/separator";
import { WorkflowStatusBadge } from "@/components/shared/workflow-status-badge";
import type { WorkflowTimelineProps } from "./types";

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function WorkflowTimeline({ history }: WorkflowTimelineProps) {
  if (!history.length) {
    return <p className="text-sm text-muted-foreground">No history available.</p>;
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-0">
      {sorted.map((entry, idx) => (
        <div key={idx}>
          <div className="flex items-start gap-3 py-3">
            <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-50" />
            <div className="flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <WorkflowStatusBadge status={entry.status} />
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
              {entry.notes && (
                <p className="text-sm text-muted-foreground">{entry.notes}</p>
              )}
            </div>
          </div>
          {idx < sorted.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
