import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subscription } from "@/types/billing";
import { BillingStatusBadge } from "./billing-status-badge";
import { NoActiveSubscriptionState } from "./no-active-subscription-state";

type CurrentSubscriptionDetailProps = {
  subscription: Subscription | null;
  canSelectPlan?: boolean;
  onSelectPlan?: () => void;
};

export function CurrentSubscriptionDetail({
  subscription,
  canSelectPlan = false,
  onSelectPlan,
}: CurrentSubscriptionDetailProps) {
  if (!subscription) {
    return (
      <NoActiveSubscriptionState
        canSelect={canSelectPlan}
        onSelectPlan={onSelectPlan}
      />
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base text-slate-950">Current Subscription</CardTitle>
          <BillingStatusBadge status={subscription.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2 text-sm text-slate-700">
        <div className="space-y-3">
          <div>
            <span className="text-slate-500">Plan:</span> {subscription.planName}
          </div>
          <div>
            <span className="text-slate-500">Type:</span>{" "}
            {subscription.planType.replaceAll("_", " ")}
          </div>
          <div>
            <span className="text-slate-500">Renews:</span>{" "}
            {subscription.renewsAt ?? "No renewal scheduled"}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-slate-500">Usage:</span>{" "}
            {subscription.planType === "fixed_device"
              ? `${subscription.usage.deviceCountUsed ?? 0} / ${subscription.usage.deviceLimit ?? "N/A"} devices`
              : `${subscription.usage.billableConnectionCount ?? 0} billable connections`}
          </div>
          <div>
            <span className="text-slate-500">Scope:</span>{" "}
            {subscription.scopePath.map((item) => item.name).join(" / ")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
