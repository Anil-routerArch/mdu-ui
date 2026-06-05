import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingPlan, Subscription } from "@/types/billing";
import { BillingStatusBadge } from "./billing-status-badge";

type BillingPlanDetailProps = {
  plan: BillingPlan | null;
  subscriptions?: Subscription[];
  readOnly?: boolean;
};

function formatPlanType(type: BillingPlan["type"]) {
  return type === "fixed_device" ? "Fixed Device" : "Connection Based";
}

export function BillingPlanDetail({
  plan,
  subscriptions = [],
  readOnly = false,
}: BillingPlanDetailProps) {
  if (!plan) {
    return null;
  }

  const relatedSubscriptions = subscriptions.filter(
    (subscription) => subscription.planId === plan.id,
  );

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base text-slate-950">Plan Detail</CardTitle>
          <BillingStatusBadge status={plan.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2 text-sm text-slate-700">
        <div className="space-y-3">
          <div>
            <span className="text-slate-500">Name:</span> {plan.name}
          </div>
          <div>
            <span className="text-slate-500">Type:</span> {formatPlanType(plan.type)}
          </div>
          <div>
            <span className="text-slate-500">Price:</span> ${plan.price} / {plan.billingCycle}
          </div>
          <div>
            <span className="text-slate-500">Limits:</span>{" "}
            {plan.type === "fixed_device"
              ? `${plan.deviceLimit ?? "N/A"} devices`
              : `$${plan.pricePerConnection ?? 0} per connection`}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-slate-500">Assignments / Subscriptions:</span>{" "}
            {relatedSubscriptions.length}
          </div>
          <div>
            <span className="text-slate-500">Offered By:</span>{" "}
            {plan.offeredByScope.map((item) => item.name).join(" / ")}
          </div>
          <div>
            <span className="text-slate-500">Description:</span>{" "}
            {plan.description ?? "No description"}
          </div>
          <div>
            <span className="text-slate-500">Access Mode:</span>{" "}
            {readOnly ? "Read-only" : "Editable where permitted"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
