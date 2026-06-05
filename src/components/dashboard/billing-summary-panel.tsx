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
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-950">Billing Summary</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Current subscription visibility for the selected scope.
            </CardDescription>
          </div>
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <CreditCardIcon className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current plan
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {summary.currentPlanName ?? "No active plan"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Plan type
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {formatPlanType(summary.currentPlanType)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Subscription status
          </p>
          <div className="mt-2">
            <Badge variant="outline" className="bg-slate-100 text-slate-700">
              {summary.subscriptionStatus ?? "none"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
