import { Skeleton } from "@/components/ui/skeleton";
import type { WorkflowTimelineProps } from "./types";
import type { WorkflowHistoryEvent } from "@/api/types";

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatEventLabel(type: string): string {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getEventColor(type: string): { dot: string; badge: string } {
  const t = type.toUpperCase();
  if (t.includes("FAIL") || t.includes("ERROR") || t.includes("TERMINATE"))
    return { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50" };
  if (t.includes("COMPLETE") || t.includes("APPROVED") || t.includes("CLOSED"))
    return { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50" };
  if (t.includes("START") || t.includes("INIT") || t.includes("SCHEDULED"))
    return { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50" };
  if (t.includes("SIGNAL") || t.includes("SUBMIT"))
    return { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50" };
  if (t.includes("TIMER") || t.includes("WAIT"))
    return { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50" };
  if (t.includes("ACTIVITY"))
    return { dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50" };
  return { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50" };
}

function getSnippet(event: WorkflowHistoryEvent): string | null {
  const attrs = event.attributes;
  if (!attrs || typeof attrs !== "object") return null;
  for (const key of ["signalName", "signal_name", "activityType", "workflowType", "reason", "message"]) {
    const val = (attrs as Record<string, unknown>)[key];
    if (typeof val === "string" && val.length > 0 && val.length < 80) return val;
  }
  return null;
}

function TimelineEvent({ event }: { event: WorkflowHistoryEvent }) {
  const { dot, badge } = getEventColor(event.event_type);
  const snippet = getSnippet(event);
  return (
    <div className="relative flex items-start gap-3 pb-5 last:pb-0">
      <div className={`absolute -left-[1.3rem] top-1 z-10 h-2.5 w-2.5 rounded-full border-2 border-background ${dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge}`}>
            {formatEventLabel(event.event_type)}
          </span>
          <span className="text-[10px] text-muted-foreground/60">#{event.event_id}</span>
        </div>
        {snippet && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{snippet}</p>
        )}
        <p className="mt-0.5 text-[10px] text-muted-foreground/50">{formatTimestamp(event.timestamp)}</p>
      </div>
    </div>
  );
}

/**
 * Renders Temporal event history as a chronological vertical timeline.
 * Shows a skeleton while loading and a labelled badge per event type.
 * Events are sorted ascending by timestamp — Temporal does not guarantee order.
 */
export function WorkflowTimeline({ events, isLoading }: WorkflowTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 pl-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">No events yet</p>
        <p className="text-xs text-muted-foreground/60">Timeline updates as the workflow progresses.</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative pl-5">
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
      <div>
        {sorted.map((event) => (
          <TimelineEvent key={event.event_id} event={event} />
        ))}
      </div>
    </div>
  );
}
