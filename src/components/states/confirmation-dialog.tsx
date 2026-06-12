"use client";

import { ReactNode } from "react";
import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  impactItems?: string[];
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  impactItems = [],
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const confirmVariant = variant === "danger" ? "destructive" : "default";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onCancel() : undefined)}>
      <DialogContent className="max-w-lg" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {impactItems.length > 0 ? (
          <div className="rounded-lg border border-amber-200/70 bg-amber-50/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-900">
              <AlertTriangleIcon className="size-4" />
              Impact review
            </div>
            <ul className="list-inside list-disc space-y-1 text-sm text-amber-900/80">
              {impactItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            onClick={onCancel}
            type="button"
            variant="outline"
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            type="button"
            variant={confirmVariant}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
