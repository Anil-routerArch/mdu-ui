import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BillingConflict, BillingPlanStatus, SubscriptionStatus } from "@/types/billing";

type BillingStatusBadgeProps = {
  status: BillingPlanStatus | SubscriptionStatus | BillingConflict["code"];
};

const statusClassNames: Record<string, string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-amber-200 bg-amber-50 text-amber-700",
  archived: "border-slate-200 bg-slate-100 text-slate-700",
  pending: "border-blue-200 bg-blue-50 text-blue-700",
  suspended: "border-rose-200 bg-rose-50 text-rose-700",
  expired: "border-slate-200 bg-slate-100 text-slate-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-700",
  single_active_subscription_conflict: "border-rose-200 bg-rose-50 text-rose-700",
  inactive_plan: "border-amber-200 bg-amber-50 text-amber-700",
  plan_not_eligible: "border-violet-200 bg-violet-50 text-violet-700",
};

export function BillingStatusBadge({ status }: BillingStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", statusClassNames[status] ?? "border-slate-200 bg-slate-100 text-slate-700")}
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
