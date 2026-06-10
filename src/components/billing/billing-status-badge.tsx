import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BillingConflict, BillingPlanStatus, SubscriptionStatus } from "@/types/billing";

type BillingStatusBadgeProps = {
  status: BillingPlanStatus | SubscriptionStatus | BillingConflict["code"];
};

const statusClassNames: Record<string, string> = {
  draft: "border-[var(--mdu-border)] bg-[var(--mdu-neutral-soft)] text-[var(--mdu-text-muted)]",
  active: "border-emerald-200 bg-[var(--mdu-success-soft)] text-[var(--mdu-success)]",
  inactive: "border-amber-200 bg-[var(--mdu-warning-soft)] text-[var(--mdu-warning)]",
  archived: "border-[var(--mdu-border)] bg-[var(--mdu-neutral-soft)] text-[var(--mdu-text-muted)]",
  pending: "border-blue-200 bg-[var(--mdu-info-soft)] text-[var(--mdu-info)]",
  suspended: "border-rose-200 bg-[var(--mdu-danger-soft)] text-[var(--mdu-danger)]",
  expired: "border-[var(--mdu-border)] bg-[var(--mdu-neutral-soft)] text-[var(--mdu-text-muted)]",
  cancelled: "border-[var(--mdu-border)] bg-[var(--mdu-neutral-soft)] text-[var(--mdu-text-muted)]",
  single_active_subscription_conflict: "border-rose-200 bg-[var(--mdu-danger-soft)] text-[var(--mdu-danger)]",
  inactive_plan: "border-amber-200 bg-[var(--mdu-warning-soft)] text-[var(--mdu-warning)]",
  plan_not_eligible: "border-violet-200 bg-violet-50 dark:bg-violet-500/12 text-violet-700 dark:text-violet-300",
};

export function BillingStatusBadge({ status }: BillingStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", statusClassNames[status] ?? "border-[var(--mdu-border)] bg-[var(--mdu-neutral-soft)] text-[var(--mdu-text-muted)]")}
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
