import { Separator } from "@/components/ui/separator";
import type { WorkflowTimelineProps } from "./types";

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Renders Temporal event history as a chronological timeline.
 * Events are sorted ascending by timestamp — the backend does not guarantee order.
 */
export function WorkflowTimeline({ events }: WorkflowTimelineProps) {
  if (!events.length) {
    return <p className="text-sm text-muted-foreground">No history available.</p>;
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-0">
      {sorted.map((event, idx) => (
        <div key={event.event_id}>
          <div className="flex items-start gap-3 py-3">
            <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-50" />
            <div className="flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{event.event_type}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
            </div>
          </div>
          {idx < sorted.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
