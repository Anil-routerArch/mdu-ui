"use client";

import { useMemo } from "react";

import { ConfirmationDialog } from "@/components/states";
import type { BillingConflict, BillingPlan, Subscription } from "@/types/billing";
import { BillingConflictState } from "./billing-conflict-state";

type SelectPlanConfirmationProps = {
  open: boolean;
  plan: BillingPlan | null;
  currentSubscription: Subscription | null;
  conflict: BillingConflict | null;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onDismissConflict: () => void;
};

export function SelectPlanConfirmation({
  open,
  plan,
  currentSubscription,
  conflict,
  isSubmitting = false,
  onConfirm,
  onCancel,
  onDismissConflict,
}: SelectPlanConfirmationProps) {
  const impactItems = useMemo(() => {
    if (!plan) {
      return [];
    }

    return [
      `Selected plan: ${plan.name}`,
      `Billing model: ${plan.type.replaceAll("_", " ")}`,
      currentSubscription
        ? `Current active subscription: ${currentSubscription.planName}`
        : "No current active subscription",
    ];
  }, [currentSubscription, plan]);

  if (conflict) {
    return <BillingConflictState conflict={conflict} onDismiss={onDismissConflict} />;
  }

  if (!plan) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Select ${plan.name}`}
      description={
        currentSubscription
          ? "A current active subscription exists. Replacing it is mock-only in this phase."
          : "Confirm selection of this billing plan."
      }
      confirmLabel="Confirm Plan Selection"
      impactItems={impactItems}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
