import { CreditCardIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardSummary } from "@/types/dashboard";

type BillingSummaryPanelProps = {
  summary: NonNullable<DashboardSummary["billingSummary"]>;
};

function formatPlanType(type: NonNullable<DashboardSummary["billingSummary"]>["currentPlanType"]) {
  if (!type) {
    return "No plan";
  }

  return type === "fixed_device" ? "Fixed Device" : "Connection Based";
}

export function BillingSummaryPanel({ summary }: BillingSummaryPanelProps) {
  return (
    <Card className="rounded-[24px] border border-[var(--mdu-border)] bg-[var(--mdu-surface-elevated)] py-0 shadow-[var(--mdu-shadow-strong)]">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl text-[var(--mdu-text)]">Billing Summary</CardTitle>
            <CardDescription className="text-sm text-[var(--mdu-text-muted)]">
              Current subscription visibility for the selected scope.
            </CardDescription>
          </div>
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--mdu-info-soft)] text-[var(--mdu-info)]">
            <CreditCardIcon className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pb-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--mdu-border)] bg-[var(--mdu-surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mdu-text-muted)]">
            Current plan
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--mdu-text-strong)]">
            {summary.currentPlanName ?? "No active plan"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--mdu-border)] bg-[var(--mdu-surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mdu-text-muted)]">
            Plan type
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--mdu-text-strong)]">
            {formatPlanType(summary.currentPlanType)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--mdu-border)] bg-[var(--mdu-surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mdu-text-muted)]">
            Subscription status
          </p>
          <div className="mt-2">
            <Badge variant="outline" className="border-[var(--mdu-border-strong)] bg-[var(--mdu-surface-muted)] text-[var(--mdu-text)]">
              {summary.subscriptionStatus ?? "none"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
