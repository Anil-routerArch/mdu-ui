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
    <Card className="border border-[var(--mdu-border)] bg-[var(--mdu-surface)] shadow-[var(--mdu-shadow-card)]">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-base text-[var(--mdu-text)]">Billing Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-0 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-[var(--mdu-border)] bg-[var(--mdu-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mdu-text-soft)]">Scope</p>
          <p className="mt-2 text-sm font-medium text-[var(--mdu-text)]">{scopeSummary}</p>
        </div>
        <div className="rounded-xl border border-[var(--mdu-border)] bg-[var(--mdu-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mdu-text-soft)]">Active Subscriptions</p>
          <p className="mt-2 text-lg font-semibold text-[var(--mdu-text)]">
            {subscriptions.filter((subscription) => subscription.status === "active").length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--mdu-border)] bg-[var(--mdu-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mdu-text-soft)]">Available Plans</p>
          <p className="mt-2 text-lg font-semibold text-[var(--mdu-text)]">{plans.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--mdu-border)] bg-[var(--mdu-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mdu-text-soft)]">Billing Conflicts</p>
          <p className="mt-2 text-lg font-semibold text-[var(--mdu-text)]">{conflicts.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--mdu-border)] bg-[var(--mdu-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mdu-text-soft)]">Current Subscription</p>
          <p className="mt-2 text-sm font-medium text-[var(--mdu-text)]">
            {currentSubscription?.planName ?? "No active subscription"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
