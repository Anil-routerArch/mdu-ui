import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConfigurationSet } from "@/types/config";

type ConfigurationStatus = ConfigurationSet["status"];

type ConfigurationStatusBadgeProps = {
  status: ConfigurationStatus;
};

const statusClassNames: Record<ConfigurationStatus, string> = {
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-slate-200 bg-slate-100 text-slate-700",
};

export function ConfigurationStatusBadge({
  status,
}: ConfigurationStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize", statusClassNames[status])}>
      {status}
    </Badge>
  );
}
