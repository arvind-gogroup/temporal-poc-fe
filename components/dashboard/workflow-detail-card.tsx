"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStatusBadge } from "@/components/shared/workflow-status-badge";
import { SignalButton } from "@/components/shared/signal-button";
import { WorkflowTimeline } from "./workflow-timeline";
import {
  useWorkflow,
  useWorkflowHistory,
  useSignalFormSubmitted,
  useSignalLeadApproved,
} from "@/api/hooks/use-workflows";
import { RATING_OPTIONS, STATUS_LABELS } from "@/constants/enums";
import type { WorkflowStatus } from "@/constants/enums";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Hash,
  User,
  Users,
  Calendar,
  Clock,
  Star,
  AlertTriangle,
} from "lucide-react";
import type { WorkflowDetailCardProps } from "./types";

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
        {icon && <span className="opacity-70">{icon}</span>}
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

// --- Funnel / Pipeline progress ---

const ORDERED_STEPS: WorkflowStatus[] = [
  "INITIATED",
  "WAITING_FORM",
  "FORM_SUBMITTED",
  "WAITING_APPROVAL",
  "APPROVED",
  "COMPLETED",
];

const STEP_DESCRIPTIONS: Record<WorkflowStatus, string> = {
  INITIATED:        "Workflow created",
  WAITING_FORM:     "Self-review pending",
  FORM_SUBMITTED:   "Form received",
  WAITING_APPROVAL: "Lead review pending",
  APPROVED:         "Lead approved",
  COMPLETED:        "Process complete",
  FAILED:           "Terminated",
};

function WorkflowProgress({ status }: { status: WorkflowStatus }) {
  if (status === "FAILED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200/80 bg-red-50/80 px-5 py-4 dark:border-red-900/50 dark:bg-red-950/30">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Workflow failed</p>
          <p className="text-xs text-red-500/80 dark:text-red-500/60">This workflow terminated unexpectedly.</p>
        </div>
      </div>
    );
  }

  const currentIdx = ORDERED_STEPS.indexOf(status);

  return (
    <div className="rounded-xl border border-border/60 bg-card px-6 py-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Pipeline Progress
        </p>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {currentIdx + 1} / {ORDERED_STEPS.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max items-start">
          {ORDERED_STEPS.map((step, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={step} className="flex items-start">
                <div className="flex w-24 flex-col items-center gap-2">
                  {/* Step circle */}
                  <div className="relative flex items-center justify-center">
                    {active && (
                      <span className="absolute h-12 w-12 animate-ping rounded-full bg-primary/15" />
                    )}
                    <div
                      className={cn(
                        "relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        done
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-200/60 dark:shadow-emerald-950/60"
                          : active
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground/50"
                      )}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                  </div>

                  {/* Step label + description */}
                  <div className="flex flex-col items-center gap-0.5 text-center">
                    <span
                      className={cn(
                        "whitespace-nowrap text-[10px] font-semibold leading-tight",
                        active
                          ? "text-foreground"
                          : done
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground/40"
                      )}
                    >
                      {STATUS_LABELS[step]}
                    </span>
                    <span className="whitespace-nowrap text-[9px] leading-tight text-muted-foreground/40">
                      {STEP_DESCRIPTIONS[step]}
                    </span>
                  </div>
                </div>

                {/* Connector */}
                {idx < ORDERED_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mt-4 h-0.5 w-10 shrink-0 rounded-full transition-all duration-500",
                      idx < currentIdx
                        ? "bg-emerald-400 dark:bg-emerald-700"
                        : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Form data table ---

function FormDataTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!entries.length) return null;
  return (
    <dl className="divide-y divide-border/50">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[1fr_2fr] gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-xs font-medium capitalize text-muted-foreground/70">
            {key.replace(/_/g, " ")}
          </dt>
          <dd className="break-words text-sm text-foreground">
            {typeof value === "object"
              ? <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(value, null, 2)}</pre>
              : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// --- Loading skeleton ---

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="grid grid-cols-2 gap-6 pt-6 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="space-y-4 pt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Full detail view for a single workflow. Polls status every 5 s and surfaces
 * context-aware action buttons (Submit Form at WAITING_FORM, Approve at WAITING_APPROVAL).
 * Includes a pipeline progress indicator and a live-updating Temporal event timeline.
 */
export function WorkflowDetailCard({ workflowId }: WorkflowDetailCardProps) {
  const { data: workflow, isLoading, isError, error } = useWorkflow(workflowId);
  const { data: historyData, isLoading: historyLoading } = useWorkflowHistory(workflowId);
  const formSubmitMutation = useSignalFormSubmitted(workflowId);
  const approveMutation = useSignalLeadApproved(workflowId);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !workflow) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Failed to load workflow: {error instanceof Error ? error.message : "Unknown error"}</span>
        </div>
      </div>
    );
  }

  const hasAction = workflow.status === "WAITING_FORM" || workflow.status === "WAITING_APPROVAL";

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {hasAction && (
          <div className="flex gap-2">
            {workflow.status === "WAITING_FORM" && (
              <SignalButton
                label="Submit Form"
                dialogTitle="Submit Employee Review Form"
                dialogDescription="Fill in the self-review details below."
                fields={[
                  {
                    name: "self_assessment",
                    label: "Self Assessment",
                    type: "text",
                    placeholder: "Describe your achievements this period…",
                    validation: { required: "Self assessment is required" },
                  },
                  {
                    name: "comments",
                    label: "Comments",
                    type: "text",
                    placeholder: "Any additional comments…",
                    validation: {},
                  },
                ]}
                onSignal={(data) => formSubmitMutation.mutateAsync({ form_data: data })}
              />
            )}
            {workflow.status === "WAITING_APPROVAL" && (
              <SignalButton
                label="Approve"
                variant="default"
                dialogTitle="Approve Review"
                dialogDescription={`Enter a rating: ${RATING_OPTIONS.join(" · ")}`}
                fields={[
                  {
                    name: "rating",
                    label: "Rating",
                    type: "text",
                    placeholder: "exceeds_expectations",
                    validation: { required: "Rating is required" },
                  },
                ]}
                onSignal={(data) => approveMutation.mutateAsync(data as { rating: string })}
              />
            )}
          </div>
        )}
      </div>

      {/* Pipeline progress */}
      <WorkflowProgress status={workflow.status} />

      {/* Two-column body */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column — details + form data + AI summary */}
        <div className="space-y-5 lg:col-span-2">
          {/* Workflow Details */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="flex items-center gap-3 text-base font-semibold">
                Workflow Details
                <WorkflowStatusBadge status={workflow.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-8 gap-y-6 pt-5 md:grid-cols-3">
              <DetailRow
                label="Workflow ID"
                icon={<Hash className="h-3 w-3" />}
                value={
                  <span className="font-mono text-xs tracking-tight text-muted-foreground">
                    {workflow.workflow_id}
                  </span>
                }
              />
              <DetailRow
                label="Employee"
                icon={<User className="h-3 w-3" />}
                value={workflow.employee_id}
              />
              <DetailRow
                label="Lead"
                icon={<Users className="h-3 w-3" />}
                value={workflow.lead_id}
              />
              <DetailRow
                label="Created"
                icon={<Calendar className="h-3 w-3" />}
                value={formatDate(workflow.created_at)}
              />
              <DetailRow
                label="Updated"
                icon={<Clock className="h-3 w-3" />}
                value={formatDate(workflow.updated_at)}
              />
              {workflow.rating && (
                <DetailRow
                  label="Rating"
                  icon={<Star className="h-3 w-3" />}
                  value={
                    <span className="capitalize">
                      {workflow.rating.replace(/_/g, " ")}
                    </span>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* AI Summary */}
          {workflow.ai_summary && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base font-semibold">AI Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {workflow.ai_summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Form Data */}
          {workflow.form_data && Object.keys(workflow.form_data).length > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base font-semibold">Form Data</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <FormDataTable data={workflow.form_data as Record<string, unknown>} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — timeline */}
        <div>
          <Card className="sticky top-6 border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Timeline</CardTitle>
                {historyData && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {historyData.events.length} events
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="max-h-[520px] overflow-y-auto pt-5">
              <WorkflowTimeline
                events={historyData?.events ?? []}
                isLoading={historyLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
