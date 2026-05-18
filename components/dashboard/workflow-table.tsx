"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkflowStatusBadge } from "@/components/shared/workflow-status-badge";
import { StartWorkflowDialog } from "./start-workflow-dialog";
import { useWorkflows } from "@/api/hooks/use-workflows";

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Fetches and displays all workflows in a table.
 * Polls automatically via useWorkflows and provides a button to open StartWorkflowDialog.
 */
export function WorkflowTable() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: workflows, isLoading, isError, error } = useWorkflows();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Employee Review Workflows
        </h1>
        <Button onClick={() => setDialogOpen(true)}>Start New Review</Button>
      </div>

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load workflows:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow ID</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Lead ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : workflows?.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No workflows found. Start a new review to get started.
                    </TableCell>
                  </TableRow>
                )
              : workflows?.map((wf) => (
                  <TableRow key={wf.workflow_id}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/dashboard/${wf.workflow_id}`}
                        className="text-blue-600 underline-offset-4 hover:underline"
                      >
                        {wf.workflow_id}
                      </Link>
                    </TableCell>
                    <TableCell>{wf.employee_id}</TableCell>
                    <TableCell>{wf.lead_id}</TableCell>
                    <TableCell>
                      <WorkflowStatusBadge status={wf.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(wf.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/${wf.workflow_id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <StartWorkflowDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
