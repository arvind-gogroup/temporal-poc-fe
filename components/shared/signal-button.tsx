"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import type { SignalButtonProps } from "./types";

export function SignalButton({
  label,
  variant = "default",
  dialogTitle,
  dialogDescription,
  fields = [],
  onSignal,
  disabled,
}: SignalButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Record<string, unknown>>();

  async function onSubmit(data: Record<string, unknown>) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const coerced = Object.fromEntries(
        fields.map((f) => [
          f.name,
          f.type === "number" ? Number(data[f.name]) : data[f.name],
        ])
      );
      await onSignal(coerced);
      setOpen(false);
      reset();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        disabled={disabled}
        onClick={() => {
          setSubmitError(null);
          setOpen(true);
        }}
      >
        {label}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!isSubmitting) {
            setOpen(val);
            if (!val) reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            {dialogDescription && (
              <DialogDescription>{dialogDescription}</DialogDescription>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name, {
                    required: field.validation.required,
                    min: field.validation.min,
                    max: field.validation.max,
                    valueAsNumber: field.type === "number",
                  })}
                />
                {errors[field.name] && (
                  <p className="text-sm text-red-600">
                    {errors[field.name]?.message as string}
                  </p>
                )}
              </div>
            ))}

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
