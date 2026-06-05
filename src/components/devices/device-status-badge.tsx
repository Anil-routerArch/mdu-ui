import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeviceStatus } from "@/types/device";

type ExtendedDeviceStatus = DeviceStatus | "critical" | "provisioning";

type DeviceStatusBadgeProps = {
  status: ExtendedDeviceStatus;
};

const statusClassNames: Record<ExtendedDeviceStatus, string> = {
  online: "bg-emerald-50 text-emerald-700 border-emerald-200",
  offline: "bg-rose-50 text-rose-700 border-rose-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  unknown: "bg-slate-100 text-slate-700 border-slate-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
  provisioning: "bg-blue-50 text-blue-700 border-blue-200",
};

export function DeviceStatusBadge({ status }: DeviceStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize", statusClassNames[status])}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
