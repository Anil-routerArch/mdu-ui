import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingConflict, BillingPlan, Subscription } from "@/types/billing";
import type { SelectedScope } from "@/types/hierarchy";

type BillingOverviewProps = {
  selectedScope: SelectedScope;
  plans: BillingPlan[];
  currentSubscription: Subscription | null;
  subscriptions: Subscription[];
  conflicts?: BillingConflict[];
};

export function BillingOverview({
  selectedScope,
  plans,
  currentSubscription,
  subscriptions,
  conflicts = [],
}: BillingOverviewProps) {
  const scopeSummary = selectedScope.path.map((item) => item.name).join(" / ");

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">Billing Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Scope</p>
          <p className="mt-2 text-sm font-medium text-slate-950">{scopeSummary}</p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active Subscriptions</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {subscriptions.filter((subscription) => subscription.status === "active").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Available Plans</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{plans.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Billing Conflicts</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{conflicts.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current Subscription</p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {currentSubscription?.planName ?? "No active subscription"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
