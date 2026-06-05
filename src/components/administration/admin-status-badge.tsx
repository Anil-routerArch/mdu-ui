import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AdminStatus =
  | "active"
  | "inactive"
  | "warning"
  | "restricted"
  | "success"
  | "failure";

type AdminStatusBadgeProps = {
  status: AdminStatus;
};

const statusClassNames: Record<AdminStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  restricted: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failure: "border-rose-200 bg-rose-50 text-rose-700",
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize", statusClassNames[status])}>
      {status}
    </Badge>
  );
}
