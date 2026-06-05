import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatusSeverity } from "@/types/common";

type KpiCardProps = {
  label: string;
  value: number | string;
  description?: string;
  trend?: string;
  severity?: StatusSeverity;
};

const severityStyles: Record<StatusSeverity, string> = {
  info: "bg-blue-50 text-blue-700 ring-blue-200/70",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/70",
  critical: "bg-rose-50 text-rose-700 ring-rose-200/70",
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
  label,
  value,
  description,
  trend,
  severity = "info",
}: KpiCardProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-700">{label}</CardTitle>
            {description ? (
              <CardDescription className="text-xs text-slate-500">
                {description}
              </CardDescription>
            ) : null}
          </div>
          <Badge
            variant="outline"
            className={cn("border-0 ring-1", severityStyles[severity])}
          >
            {severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        {trend ? (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-full",
                severityStyles[severity],
              )}
            >
              <TrendIcon trend={trend} />
            </span>
            <span>{trend}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
