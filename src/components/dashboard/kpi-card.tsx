import {
  AlertTriangleIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  Building2Icon,
  BuildingIcon,
  Layers3Icon,
  MapPinnedIcon,
  MinusIcon,
  RouterIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardKpi } from "@/types/dashboard";
import type { StatusSeverity } from "@/types/common";

type KpiCardProps = {
  kpiKey: DashboardKpi["key"];
  label: string;
  value: number | string;
  description?: string;
  trend?: string;
  severity?: StatusSeverity;
};

const severityStyles: Record<StatusSeverity, string> = {
  info: "bg-blue-50 text-blue-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  critical: "bg-rose-50 text-rose-600",
};

const kpiIconConfig: Record<
  DashboardKpi["key"],
  { icon: typeof Building2Icon; iconClassName: string; containerClassName: string }
> = {
  sites: {
    icon: Building2Icon,
    iconClassName: "text-blue-600",
    containerClassName: "bg-blue-50",
  },
  buildings: {
    icon: BuildingIcon,
    iconClassName: "text-violet-600",
    containerClassName: "bg-violet-50",
  },
  floors: {
    icon: Layers3Icon,
    iconClassName: "text-emerald-600",
    containerClassName: "bg-emerald-50",
  },
  venues: {
    icon: MapPinnedIcon,
    iconClassName: "text-amber-500",
    containerClassName: "bg-amber-50",
  },
  devices: {
    icon: RouterIcon,
    iconClassName: "text-blue-600",
    containerClassName: "bg-blue-50",
  },
  alerts: {
    icon: AlertTriangleIcon,
    iconClassName: "text-rose-500",
    containerClassName: "bg-rose-50",
  },
};

function TrendIcon({ trend }: { trend?: string }) {
  if (!trend) {
    return <MinusIcon className="size-3.5" />;
  }

  const normalized = trend.toLowerCase();

  if (normalized.includes("down") || normalized.includes("decrease")) {
    return <ArrowDownRightIcon className="size-3.5" />;
  }

  if (normalized.includes("0") || normalized.includes("no change")) {
    return <MinusIcon className="size-3.5" />;
  }

  return <ArrowUpRightIcon className="size-3.5" />;
}

export function KpiCard({
  kpiKey,
  label,
  value,
  trend,
  severity = "info",
}: KpiCardProps) {
  const config = kpiIconConfig[kpiKey];
  const Icon = config.icon;

  return (
    <Card className="min-h-[8px] rounded-[12px] border border-[#e7edf7] bg-white p-0 py-0 shadow-[0_6px_14px_rgba(15,23,42,0.025)]">
      <CardContent className="p-0">
        <div className="flex h-full flex-col justify-between gap-3 ">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 ">
              <p className="text-[12px] font-semibold text-slate-800">{label}</p>
              <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-[#0f1f46]">
                {value}
              </p>
            </div>
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full",
                config.containerClassName,
              )}
            >
              <Icon className={cn("size-4", config.iconClassName)} />
            </div>
          </div>

          <div className="space-y-1">
            {trend ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                <span
                  className={cn(
                    "inline-flex size-4.5 items-center justify-center rounded-full",
                    severityStyles[severity],
                  )}
                >
                  <TrendIcon trend={trend} />
                </span>
                <span>{trend}</span>
              </div>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-medium",
                  severityStyles[severity],
                )}
              >
                <span className="rounded-full px-2 py-1">{severity}</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
