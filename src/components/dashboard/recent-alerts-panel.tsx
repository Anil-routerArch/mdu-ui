import { AlertTriangleIcon, InfoIcon, SirenIcon } from "lucide-react";

import { EmptyState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentAlert } from "@/types/dashboard";

type RecentAlertsPanelProps = {
  alerts: RecentAlert[];
};

const severityConfig = {
  info: {
    icon: InfoIcon,
    badgeClassName: "bg-blue-50 text-blue-700 ring-blue-200/70",
  },
  success: {
    icon: InfoIcon,
    badgeClassName: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  },
  warning: {
    icon: AlertTriangleIcon,
    badgeClassName: "bg-amber-50 text-amber-700 ring-amber-200/70",
  },
  critical: {
    icon: SirenIcon,
    badgeClassName: "bg-rose-50 text-rose-700 ring-rose-200/70",
  },
} as const;

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function RecentAlertsPanel({ alerts }: RecentAlertsPanelProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-base text-slate-950">Recent Alerts</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Latest operational events within the selected scope.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <EmptyState
            title="No recent alerts"
            description="Operational alerts for the selected scope will appear here."
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`border-0 ring-1 ${config.badgeClassName}`}
                        >
                          <Icon className="size-3.5" />
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatTimestamp(alert.occurredAt)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-950">{alert.title}</p>
                        <p className="text-sm text-slate-600">{alert.description}</p>
                      </div>
                    </div>
                    {alert.resourceLabel ? (
                      <div className="rounded-lg bg-white px-3 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200/70">
                        {alert.resourceLabel}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
