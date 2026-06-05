import { ActivityIcon, AlertTriangleIcon, CheckCircle2Icon, WifiOffIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HealthSummary } from "@/types/dashboard";

const healthItems = [
  {
    key: "online",
    label: "Online",
    icon: CheckCircle2Icon,
    textClassName: "text-emerald-700",
    bgClassName: "bg-emerald-50",
  },
  {
    key: "warning",
    label: "Warning",
    icon: AlertTriangleIcon,
    textClassName: "text-amber-700",
    bgClassName: "bg-amber-50",
  },
  {
    key: "offline",
    label: "Offline",
    icon: WifiOffIcon,
    textClassName: "text-rose-700",
    bgClassName: "bg-rose-50",
  },
  {
    key: "unknown",
    label: "Unknown",
    icon: ActivityIcon,
    textClassName: "text-slate-700",
    bgClassName: "bg-slate-100",
  },
] as const;

type HealthSummaryPanelProps = {
  health: HealthSummary;
};

function getPercentage(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function HealthSummaryPanel({ health }: HealthSummaryPanelProps) {
  const onlinePercentage = getPercentage(health.online, health.totalDevices);
  const warningPercentage = getPercentage(health.warning, health.totalDevices);
  const offlinePercentage = getPercentage(health.offline, health.totalDevices);
  const unknownPercentage = getPercentage(health.unknown, health.totalDevices);

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-950">Environment Health</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Operational status within the selected scope.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            {health.totalDevices} devices
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="flex h-full w-full">
              <div className="bg-emerald-500" style={{ width: `${onlinePercentage}%` }} />
              <div className="bg-amber-400" style={{ width: `${warningPercentage}%` }} />
              <div className="bg-rose-500" style={{ width: `${offlinePercentage}%` }} />
              <div className="bg-slate-300" style={{ width: `${unknownPercentage}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span>{onlinePercentage}% online</span>
            <span>•</span>
            <span>{warningPercentage}% warning</span>
            <span>•</span>
            <span>{offlinePercentage}% offline</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {healthItems.map((item) => {
            const Icon = item.icon;
            const count = health[item.key];

            return (
              <div
                key={item.key}
                className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`inline-flex size-8 items-center justify-center rounded-full ${item.bgClassName}`}
                  >
                    <Icon className={`size-4 ${item.textClassName}`} />
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold text-slate-950">{count}</p>
                  <p className="text-xs text-slate-500">
                    {getPercentage(count, health.totalDevices)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
