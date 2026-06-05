import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CustomerStatus } from "@/types/customer";

type CustomerStatusBadgeProps = {
  status: CustomerStatus;
};

const statusClassNames: Record<CustomerStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  suspended: "border-rose-200 bg-rose-50 text-rose-700",
  provisioning: "border-blue-200 bg-blue-50 text-blue-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-700",
};

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize", statusClassNames[status])}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
