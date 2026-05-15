"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStartWorkflow } from "@/api/hooks/use-workflows";
import { StartWorkflowRequestSchema, type StartWorkflowRequest } from "@/api/types";
import type { StartWorkflowDialogProps } from "./types";

export function StartWorkflowDialog({ open, onOpenChange }: StartWorkflowDialogProps) {
  const { mutateAsync, isPending } = useStartWorkflow();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StartWorkflowRequest>({
    resolver: zodResolver(StartWorkflowRequestSchema),
  });

  async function onSubmit(data: StartWorkflowRequest) {
    await mutateAsync(data);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isPending) {
          onOpenChange(val);
          if (!val) reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Review</DialogTitle>
          <DialogDescription>
            Begin a new employee review workflow. Both fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="employee_id">Employee ID</Label>
            <Input
              id="employee_id"
              placeholder="e.g. EMP-001"
              {...register("employee_id")}
            />
            {errors.employee_id && (
              <p className="text-sm text-red-600">{errors.employee_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead_id">Lead ID</Label>
            <Input
              id="lead_id"
              placeholder="e.g. LEAD-001"
              {...register("lead_id")}
            />
            {errors.lead_id && (
              <p className="text-sm text-red-600">{errors.lead_id.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Starting…" : "Start Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
