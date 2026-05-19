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
import { Plus, ArrowRight, Users, CheckCircle2, AlertCircle, Activity } from "lucide-react";

function getInitials(id: string): string {
  return id
    .split(/[-_]/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRelativeDate(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function truncateId(id: string, max = 26): string {
  return id.length > max ? id.slice(0, max) + "…" : id;
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className={cn("flex items-center gap-1.5 text-xs font-medium text-muted-foreground", accent)}>
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function IdAvatar({ id, colorClass }: { id: string; colorClass: string }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
        colorClass
      )}
    >
      {getInitials(id) || "?"}
    </span>
  );
}

/**
 * Fetches and displays all workflows in a table with summary stats.
 * Polls automatically via useWorkflows and provides a button to open StartWorkflowDialog.
 */
export function WorkflowTable() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: workflows, isLoading, isError, error } = useWorkflows();

  const stats = {
    total: workflows?.length ?? 0,
    active:
      workflows?.filter((w) =>
        ["INITIATED", "WAITING_FORM", "FORM_SUBMITTED", "WAITING_APPROVAL"].includes(w.status)
      ).length ?? 0,
    completed: workflows?.filter((w) => ["COMPLETED", "APPROVED"].includes(w.status)).length ?? 0,
    failed: workflows?.filter((w) => w.status === "FAILED").length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Review Workflows</h1>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage and track employee review processes
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="mt-1 gap-2 self-start sm:mt-0 sm:self-auto">
          <Plus className="h-4 w-4" />
          New Review
        </Button>
      </div>

      {/* Stats */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={<Users className="h-3.5 w-3.5" />} />
          <StatCard
            label="In Progress"
            value={stats.active}
            icon={<Activity className="h-3.5 w-3.5" />}
            accent="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={<AlertCircle className="h-3.5 w-3.5" />}
            accent="text-red-600 dark:text-red-400"
          />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          Failed to load workflows:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[280px] font-medium">Workflow</TableHead>
              <TableHead className="font-medium">Employee</TableHead>
              <TableHead className="font-medium">Lead</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
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
                    <TableCell colSpan={6}>
                      <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Activity className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">No workflows yet</p>
                          <p className="mt-0.5 text-xs text-muted-foreground/60">
                            Start a new review to see it here.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              : workflows?.map((wf) => (
                  <TableRow key={wf.workflow_id} className="group cursor-pointer border-border/40">
                    <TableCell>
                      <Link href={`/dashboard/${wf.workflow_id}`} className="block">
                        <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                          {truncateId(wf.workflow_id)}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IdAvatar id={wf.employee_id} colorClass="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" />
                        <span className="text-sm">{wf.employee_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IdAvatar id={wf.lead_id} colorClass="bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" />
                        <span className="text-sm">{wf.lead_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <WorkflowStatusBadge status={wf.status} />
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-sm text-muted-foreground"
                        title={new Date(wf.created_at).toLocaleString()}
                      >
                        {formatRelativeDate(wf.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/${wf.workflow_id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        )}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
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
