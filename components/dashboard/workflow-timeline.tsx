"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WorkflowTimelineProps } from "./types";
import type { WorkflowStage, StageEvent } from "@/api/types";

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "In progress…";
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60_000);
  const secs = Math.floor((ms % 60_000) / 1000);
  return secs ? `${mins}m ${secs}s` : `${mins}m`;
}

function StageIcon({ status }: { status: WorkflowStage["status"] }) {
  if (status === "completed") {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm shadow-emerald-200/60 dark:shadow-emerald-950/60">
        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
        <span className="absolute h-7 w-7 animate-ping rounded-full bg-primary/20" />
        <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-sm shadow-primary/25 ring-2 ring-primary/20">
          <Zap className="h-3 w-3 text-primary-foreground" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-border/40 bg-muted/20">
      <Circle className="h-2.5 w-2.5 text-muted-foreground/25" />
    </div>
  );
}

function EventRow({ event }: { event: StageEvent }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/30" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] leading-snug text-muted-foreground">{event.label}</p>
        <p className="text-[10px] text-muted-foreground/45">{formatTimestamp(event.timestamp)}</p>
      </div>
    </div>
  );
}

function StageRow({ stage, isLast }: { stage: WorkflowStage; isLast: boolean }) {
  const isDone = stage.status === "completed";
  const isActive = stage.status === "active";
  const isPending = stage.status === "pending";

  const hasDetails =
    !isPending && (!!stage.key_event || !!stage.started_at || stage.events.length > 0);

  const [expanded, setExpanded] = useState(isActive);

  return (
    <div className="flex gap-3">
      {/* Icon + vertical connector */}
      <div className="flex flex-col items-center">
        <StageIcon status={stage.status} />
        {!isLast && (
          <div
            className={cn(
              "w-px flex-1 transition-colors",
              isDone ? "bg-emerald-300/50 dark:bg-emerald-800/50" : "bg-border/40"
            )}
            style={{ minHeight: "1.25rem" }}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("min-w-0 flex-1 pb-5", isLast && "pb-0")}>
        {/* Stage header row — clickable to collapse/expand */}
        <button
          type="button"
          onClick={() => hasDetails && setExpanded((v) => !v)}
          className={cn(
            "flex w-full items-center gap-1.5 text-left",
            hasDetails && "cursor-pointer"
          )}
          disabled={!hasDetails}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "text-[13px] font-semibold leading-none",
                isDone && "text-emerald-700 dark:text-emerald-400",
                isActive && "text-foreground",
                isPending && "text-muted-foreground/35"
              )}
            >
              {stage.label}
            </span>

            {isDone && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                Done
              </span>
            )}
            {isActive && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                Active
              </span>
            )}
            {stage.event_count > 0 && !isPending && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground/55">
                {stage.event_count}
              </span>
            )}
          </div>

          {hasDetails && (
            expanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/40" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
            )
          )}
        </button>

        {/* Collapsible body */}
        {expanded && hasDetails && (
          <div className="mt-0.5 space-y-1">
            {/* Description */}
            <p className="text-[11px] leading-snug text-muted-foreground/60">
              {stage.description}
            </p>

            {/* Key event callout */}
            {stage.key_event && (
              <p className="text-[11px] italic text-muted-foreground/55">
                &ldquo;{stage.key_event}&rdquo;
              </p>
            )}

            {/* Timing */}
            {stage.started_at && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/45">
                <Clock className="h-2.5 w-2.5 shrink-0" />
                <span>
                  {formatTimestamp(stage.started_at)}
                  {" · "}
                  {formatDuration(stage.started_at, stage.completed_at)}
                </span>
              </div>
            )}

            {/* Individual events */}
            {stage.events.length > 0 && (
              <div className="mt-1.5 space-y-1.5 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                {stage.events.map((event) => (
                  <EventRow key={event.event_id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Renders Temporal workflow execution history as a staged vertical timeline.
 * Each stage is collapsible — click the header to expand/collapse.
 * Completed and active stages start expanded; pending stages start collapsed.
 */
export function WorkflowTimeline({ stages, isLoading }: WorkflowTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5 pt-0.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-2.5 w-36" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stages.length) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">No stages yet</p>
        <p className="text-xs text-muted-foreground/60">Timeline updates as the workflow progresses.</p>
      </div>
    );
  }

  return (
    <div>
      {stages.map((stage, idx) => (
        <StageRow key={stage.name} stage={stage} isLast={idx === stages.length - 1} />
      ))}
    </div>
  );
}
