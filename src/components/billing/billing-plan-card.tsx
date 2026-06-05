import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingPlan } from "@/types/billing";
import { BillingStatusBadge } from "./billing-status-badge";

type BillingPlanCardProps = {
  plan: BillingPlan;
  canSelect?: boolean;
  onSelect?: (plan: BillingPlan) => void;
};

function formatPlanType(type: BillingPlan["type"]) {
  return type === "fixed_device" ? "Fixed Device" : "Connection Based";
}

function formatLimits(plan: BillingPlan) {
  if (plan.type === "fixed_device") {
    return `${plan.deviceLimit ?? "N/A"} devices`;
  }

  return `$${plan.pricePerConnection ?? 0}/connection`;
}

export function BillingPlanCard({
  plan,
  canSelect = false,
  onSelect,
}: BillingPlanCardProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-950">{plan.name}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{formatPlanType(plan.type)}</p>
          </div>
          <BillingStatusBadge status={plan.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700">
        <p className="text-lg font-semibold text-slate-950">
          ${plan.price} / {plan.billingCycle}
        </p>
        <p>{formatLimits(plan)}</p>
        <p>{plan.description ?? "No description"}</p>
        {canSelect && onSelect ? (
          <Button
            type="button"
            className="w-full"
            onClick={() => onSelect(plan)}
            disabled={plan.status !== "active"}
          >
            Select Plan
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
