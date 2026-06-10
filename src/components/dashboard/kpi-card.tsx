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
  info: "bg-[var(--mdu-info-soft)] text-[var(--mdu-info)]",
  success: "bg-[var(--mdu-success-soft)] text-[var(--mdu-success)]",
  warning: "bg-[var(--mdu-warning-soft)] text-[var(--mdu-warning)]",
  critical: "bg-[var(--mdu-danger-soft)] text-[var(--mdu-danger)]",
};

const kpiIconConfig: Record<
  DashboardKpi["key"],
  { icon: typeof Building2Icon; iconClassName: string; containerClassName: string }
> = {
  sites: {
    icon: Building2Icon,
    iconClassName: "text-[var(--mdu-info)]",
    containerClassName: "bg-[var(--mdu-info-soft)]",
  },
  buildings: {
    icon: BuildingIcon,
    iconClassName: "text-violet-500 dark:text-violet-300",
    containerClassName: "bg-violet-50 dark:bg-violet-500/12",
  },
  floors: {
    icon: Layers3Icon,
    iconClassName: "text-[var(--mdu-success)]",
    containerClassName: "bg-[var(--mdu-success-soft)]",
  },
  venues: {
    icon: MapPinnedIcon,
    iconClassName: "text-[var(--mdu-warning)]",
    containerClassName: "bg-[var(--mdu-warning-soft)]",
  },
  devices: {
    icon: RouterIcon,
    iconClassName: "text-[var(--mdu-info)]",
    containerClassName: "bg-[var(--mdu-info-soft)]",
  },
  alerts: {
    icon: AlertTriangleIcon,
    iconClassName: "text-[var(--mdu-danger)]",
    containerClassName: "bg-[var(--mdu-danger-soft)]",
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
    <Card className="min-h-[8px] rounded-[12px] border border-[var(--mdu-border)] bg-[var(--mdu-surface)] p-0 py-0 shadow-[var(--mdu-shadow-soft)]">
      <CardContent className="p-0">
        <div className="flex h-full flex-col justify-between gap-3 ">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 ">
              <p className="text-[12px] font-semibold text-[var(--mdu-text-strong)]">{label}</p>
              <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-[var(--mdu-text)]">
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
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--mdu-text-muted)]">
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
