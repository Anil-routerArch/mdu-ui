"use client";

import { useState } from "react";

import type { BillingConflict, BillingPlan, Subscription } from "@/types/billing";
import { BillingPlanCard } from "./billing-plan-card";
import { NoAvailablePlansState } from "./no-available-plans-state";
import { SelectPlanConfirmation } from "./select-plan-confirmation";

type AvailablePlansProps = {
  plans: BillingPlan[];
  currentSubscription: Subscription | null;
  canSelect?: boolean;
  onSelectPlan: (plan: BillingPlan) => Promise<{ conflict: BillingConflict | null }>;
};

export function AvailablePlans({
  plans,
  currentSubscription,
  canSelect = false,
  onSelectPlan,
}: AvailablePlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflict, setConflict] = useState<BillingConflict | null>(null);

  if (!plans.length) {
    return <NoAvailablePlansState />;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <BillingPlanCard
            key={plan.id}
            plan={plan}
            canSelect={canSelect}
            onSelect={canSelect ? (candidate) => setSelectedPlan(candidate) : undefined}
          />
        ))}
      </div>

      <SelectPlanConfirmation
        open={Boolean(selectedPlan)}
        plan={selectedPlan}
        currentSubscription={currentSubscription}
        conflict={conflict}
        isSubmitting={isSubmitting}
        onCancel={() => {
          setSelectedPlan(null);
          setConflict(null);
          setIsSubmitting(false);
        }}
        onDismissConflict={() => {
          setConflict(null);
          setSelectedPlan(null);
          setIsSubmitting(false);
        }}
        onConfirm={() => {
          if (!selectedPlan) {
            return;
          }

          setIsSubmitting(true);
          void onSelectPlan(selectedPlan).then((result) => {
            setIsSubmitting(false);

            if (result.conflict) {
              setConflict(result.conflict);
              return;
            }

            setSelectedPlan(null);
          });
        }}
      />
    </>
  );
}
