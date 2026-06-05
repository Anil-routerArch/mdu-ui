"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/states";
import type { Customer } from "@/types/customer";

type DeleteCustomerDialogProps = {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteCustomerDialog({
  customer,
  open,
  onOpenChange,
}: DeleteCustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!customer) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete ${customer.name}`}
      description="This is a mock destructive flow only. No persistent tenant deletion is performed."
      confirmLabel="Delete Customer"
      variant="danger"
      impactItems={[
        "Child hierarchy nodes may be orphaned or removed in the real workflow",
        "Scoped users would be affected",
        "Assigned infrastructure devices would require reassignment",
        "Billing/subscription visibility and subscriptions would be impacted",
        "Scoped configurations and inherited settings may be invalidated",
      ]}
      isSubmitting={isSubmitting}
      onCancel={() => {
        setIsSubmitting(false);
        onOpenChange(false);
      }}
      onConfirm={() => {
        setIsSubmitting(true);
        window.setTimeout(() => {
          setIsSubmitting(false);
          onOpenChange(false);
        }, 600);
      }}
    />
  );
}
