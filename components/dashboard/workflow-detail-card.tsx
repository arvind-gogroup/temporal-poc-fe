"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { WorkflowStatusBadge } from "@/components/shared/workflow-status-badge";
import { SignalButton } from "@/components/shared/signal-button";
import { WorkflowTimeline } from "./workflow-timeline";
import { useWorkflow, useSignalFormSubmitted, useSignalLeadApproved } from "@/api/hooks/use-workflows";
import { RATING_MIN, RATING_MAX } from "@/constants/enums";
import type { WorkflowDetailCardProps } from "./types";

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function WorkflowDetailCard({ workflowId }: WorkflowDetailCardProps) {
  const { data: workflow, isLoading, isError, error } = useWorkflow(workflowId);
  const formSubmitMutation = useSignalFormSubmitted(workflowId);
  const approveMutation = useSignalLeadApproved(workflowId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6 grid grid-cols-2 gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !workflow) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load workflow:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex gap-2">
          {workflow.status === "WAITING_FORM" && (
            <SignalButton
              label="Submit Form"
              dialogTitle="Submit Employee Review Form"
              dialogDescription="Provide a response to complete this review form."
              fields={[
                {
                  name: "form_response",
                  label: "Response",
                  type: "text",
                  placeholder: "Enter your response…",
                  validation: { required: "Response is required" },
                },
              ]}
              onSignal={(data) =>
                formSubmitMutation.mutateAsync(
                  data as { form_response: string }
                )
              }
            />
          )}
          {workflow.status === "WAITING_APPROVAL" && (
            <SignalButton
              label="Approve"
              variant="default"
              dialogTitle="Approve Review"
              dialogDescription="Provide a rating from 1 (poor) to 5 (excellent)."
              fields={[
                {
                  name: "rating",
                  label: `Rating (${RATING_MIN}–${RATING_MAX})`,
                  type: "number",
                  placeholder: "4",
                  validation: {
                    required: "Rating is required",
                    min: { value: RATING_MIN, message: `Minimum rating is ${RATING_MIN}` },
                    max: { value: RATING_MAX, message: `Maximum rating is ${RATING_MAX}` },
                  },
                },
              ]}
              onSignal={(data) =>
                approveMutation.mutateAsync(data as { rating: number })
              }
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Workflow Details
            <WorkflowStatusBadge status={workflow.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailRow label="Workflow ID" value={<span className="font-mono text-xs">{workflow.workflow_id}</span>} />
          <DetailRow label="Employee ID" value={workflow.employee_id} />
          <DetailRow label="Lead ID" value={workflow.lead_id} />
          <DetailRow label="Created At" value={formatDate(workflow.created_at)} />
          <DetailRow label="Updated At" value={formatDate(workflow.updated_at)} />
        </CardContent>
      </Card>

      {workflow.ai_summary && (
        <Card>
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{workflow.ai_summary}</p>
          </CardContent>
        </Card>
      )}

      {workflow.form_data && (
        <Card>
          <CardHeader>
            <CardTitle>Form Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
              {JSON.stringify(workflow.form_data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowTimeline history={workflow.status_history} />
        </CardContent>
      </Card>
    </div>
  );
}
