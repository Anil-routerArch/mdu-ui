import Link from "next/link";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  WifiOffIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    textClassName: "text-[var(--mdu-success)]",
    bgClassName: "bg-[var(--mdu-success-soft)]",
  },
  {
    key: "warning",
    label: "Warning",
    icon: AlertTriangleIcon,
    textClassName: "text-[var(--mdu-warning)]",
    bgClassName: "bg-[var(--mdu-warning-soft)]",
  },
  {
    key: "offline",
    label: "Offline",
    icon: WifiOffIcon,
    textClassName: "text-[var(--mdu-danger)]",
    bgClassName: "bg-[var(--mdu-danger-soft)]",
  },
  {
    key: "unknown",
    label: "Unknown",
    icon: ActivityIcon,
    textClassName: "text-[var(--mdu-text-muted)]",
    bgClassName: "bg-[var(--mdu-neutral-soft)]",
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
  const donutStyle = {
    background: `conic-gradient(var(--mdu-success) 0 ${onlinePercentage}%, var(--mdu-warning) ${onlinePercentage}% ${onlinePercentage + warningPercentage}%, var(--mdu-danger) ${onlinePercentage + warningPercentage}% ${onlinePercentage + warningPercentage + offlinePercentage}%, var(--mdu-border-strong) ${onlinePercentage + warningPercentage + offlinePercentage}% 100%)`,
  };
  const topIssues = [
    health.offline > 0
      ? `${health.offline} infrastructure device${health.offline === 1 ? "" : "s"} offline`
      : null,
    health.warning > 0
      ? `${health.warning} device${health.warning === 1 ? "" : "s"} require attention`
      : null,
    health.unknown > 0
      ? `${health.unknown} device${health.unknown === 1 ? "" : "s"} reporting unknown status`
      : null,
    health.online > 0
      ? `${health.online} device${health.online === 1 ? "" : "s"} healthy and online`
      : null,
  ].filter((issue): issue is string => Boolean(issue));

  return (
    <Card className="h-[358px] rounded-[14px] border border-[var(--mdu-border)] bg-[var(--mdu-surface)] py-0 shadow-[var(--mdu-shadow-card)]">
      <CardHeader className="gap-1.5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-[1.05rem] text-[var(--mdu-text)]">Environment Health</CardTitle>
            <CardDescription className="text-[13px] leading-5 text-[var(--mdu-text-muted)]">
              Operational status within the selected scope.
            </CardDescription>
          </div>
          <Button asChild variant="ghost" className="text-[var(--mdu-primary)] hover:bg-[var(--mdu-primary-soft)]">
            <Link href="/devices">
              View all
              <ChevronRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid h-[calc(358px-64px)] gap-3 overflow-hidden pb-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-3 md:grid-cols-[126px_1fr] md:items-center">
          <div className="flex items-center justify-center">
            <div className="relative flex size-[92px] items-center justify-center rounded-full" style={donutStyle}>
              <div className="flex size-[68px] flex-col items-center justify-center rounded-full bg-[var(--mdu-surface)] text-center shadow-[inset_0_0_0_1px_var(--mdu-border)]">
                <p className="text-[1.1rem] font-semibold leading-none text-[var(--mdu-text)]">
                  {health.totalDevices}
                </p>
                <p className="mt-1 text-[10px] text-[var(--mdu-text-muted)]">Total Devices</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {healthItems.map((item) => {
              const Icon = item.icon;
              const count = health[item.key];

              return (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded-full ${item.bgClassName}`}
                    >
                      <Icon className={`size-3 ${item.textClassName}`} />
                    </span>
                    <span className="text-[0.95rem] font-medium text-[var(--mdu-text)]">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.95rem] font-semibold text-[var(--mdu-text-strong)]">{count.toLocaleString()}</p>
                    <p className="text-[0.95rem] text-[var(--mdu-text-muted)]">
                      {getPercentage(count, health.totalDevices)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden border-t border-[var(--mdu-border-soft)] pt-1 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-[0.95rem] font-semibold text-[var(--mdu-text-strong)]">Top Issues</p>
              <p className="text-[0.9rem] text-[var(--mdu-text-muted)]">Operational highlights from this scope.</p>
            </div>
            <Badge variant="outline" className="border-[var(--mdu-border-strong)] bg-[var(--mdu-surface-muted)] text-[var(--mdu-text-muted)]">
              {health.totalDevices} devices
            </Badge>
          </div>
          <div className="space-y-1.5 overflow-y-auto pr-1">
            {topIssues.map((issue, index) => (
              <div key={issue} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "inline-flex size-2.5 rounded-full",
                      index === 0
                        ? "bg-[var(--mdu-danger)]"
                        : index === 1
                          ? "bg-[var(--mdu-warning)]"
                          : index === 2
                            ? "bg-[var(--mdu-text-soft)]"
                            : "bg-[var(--mdu-success)]",
                    ].join(" ")}
                  />
                  <p className="text-[0.95rem] text-[var(--mdu-text)]">{issue}</p>
                </div>
                <Button variant="link" className="h-auto px-0 text-[0.95rem] text-[var(--mdu-primary)]">
                  View
                </Button>
              </div>
            ))}
          </div>
          <Button variant="link" className="mt-2 h-auto px-0 text-[0.95rem] text-[var(--mdu-primary)]">
            Go to System Health
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
