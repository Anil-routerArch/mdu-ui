"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/states";
import type { Customer } from "@/types/customer";

type SuspendCustomerDialogProps = {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SuspendCustomerDialog({
  customer,
  open,
  onOpenChange,
}: SuspendCustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!customer) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Suspend ${customer.name}`}
      description="This is a mock suspension flow only. No persistent tenant status change is performed."
      confirmLabel="Suspend Customer"
      impactItems={[
        "Scoped users may lose operational access",
        "Device workflows may be blocked",
        "Billing/subscription activity may be impacted",
        "Child hierarchy nodes remain present but operationally restricted",
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
