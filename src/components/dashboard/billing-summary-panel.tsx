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
    <Card className="rounded-[24px] border border-[#e8eef7] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] py-0 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl text-[#0f1f46]">Billing Summary</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Current subscription visibility for the selected scope.
            </CardDescription>
          </div>
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <CreditCardIcon className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pb-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e7eef8] bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current plan
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {summary.currentPlanName ?? "No active plan"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e7eef8] bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Plan type
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {formatPlanType(summary.currentPlanType)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e7eef8] bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Subscription status
          </p>
          <div className="mt-2">
            <Badge variant="outline" className="border-[#dce7f8] bg-[#f7faff] text-slate-700">
              {summary.subscriptionStatus ?? "none"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
