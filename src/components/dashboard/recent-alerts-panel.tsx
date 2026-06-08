import Link from "next/link";
import { AlertTriangleIcon, ChevronRightIcon, InfoIcon, SirenIcon } from "lucide-react";

import { EmptyState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RecentAlertsPanel({ alerts }: RecentAlertsPanelProps) {
  return (
    <Card className="h-[358px] rounded-[14px] border border-[#e6edf7] bg-white py-0 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
      <CardHeader className="gap-1.5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-[1.05rem] text-[#0f1f46]">Recent Alerts</CardTitle>
            <CardDescription className="text-[13px] leading-5 text-slate-500">
              Latest operational events within the selected scope.
            </CardDescription>
          </div>
          <Button asChild variant="ghost" className="text-[#2563eb] hover:bg-[#f2f7ff]">
            <Link href="/devices">
              View all
              <ChevronRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(358px-64px)] overflow-hidden pb-4">
        {alerts.length === 0 ? (
          <EmptyState
            title="No recent alerts"
            description="Operational alerts for the selected scope will appear here."
          />
        ) : (
          <div className="h-full space-y-1.5 overflow-y-auto pr-1">
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              const scopeSummary = alert.scopePath.map((item) => item.name).join(" / ");

              return (
                <div
                  key={alert.id}
                  className="rounded-[12px] border border-[#edf2f8] bg-white px-3 py-2 shadow-none"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full ${config.badgeClassName}`}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[0.95rem] font-semibold leading-5 text-slate-900">{alert.title}</p>
                      <p className="truncate text-[0.95rem] text-slate-500">
                        {alert.resourceLabel ?? scopeSummary}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-[0.95rem] text-slate-500">
                        {formatTimestamp(alert.occurredAt)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`h-6 border-0 px-2 text-[0.9rem] ring-1 ${config.badgeClassName}`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
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
