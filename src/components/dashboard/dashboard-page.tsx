"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowUpIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  ActivityIcon,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
  PartialDataState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getDashboardSummary } from "@/lib/mock-api/dashboard";
import { getDevices } from "@/lib/mock-api/devices";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useMockRuntimeStore } from "@/stores/mock-runtime-store";
import { useScopeStore } from "@/stores/scope-store";
import type { Device } from "@/types/device";
import type { DashboardSummary } from "@/types/dashboard";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";
import { BillingSummaryPanel } from "./billing-summary-panel";
import { HealthSummaryPanel } from "./health-summary-panel";
import { KpiCard } from "./kpi-card";
import { QuickActionsPanel } from "./quick-actions-panel";
import { RecentAlertsPanel } from "./recent-alerts-panel";

type MockApiError = {
  code?: string;
};

function formatScopeSummary(selectedScope: SelectedScope | null): string {
  if (!selectedScope?.path.length) {
    return "No scope selected";
  }

  return selectedScope.path.map((item) => item.name).join(" / ");
}

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

function formatUpdatedTime(data: DashboardSummary): string {
  const timestamp = data.recentAlerts[0]?.occurredAt;

  if (!timestamp) {
    return "Recently updated";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSystemStatus(data: DashboardSummary) {
  if (data.health.offline > 0 || data.recentAlerts.some((alert) => alert.severity === "critical")) {
    return {
      title: "System Attention Required",
      description: "One or more infrastructure resources need immediate review.",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      iconClassName: "bg-rose-600 text-white",
    };
  }

  if (data.health.warning > 0 || data.recentAlerts.some((alert) => alert.severity === "warning")) {
    return {
      title: "Operational Warnings Detected",
      description: "The backend is healthy, but some scoped resources require attention.",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      iconClassName: "bg-amber-500 text-white",
    };
  }

  return {
    title: "All Systems Operational",
    description: "MDU Backend is healthy",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "bg-emerald-600 text-white",
  };
}

function buildTrendSeries(total: number) {
  const base = Math.max(total, 3);
  return [0.72, 0.68, 0.77, 0.74, 0.7, 0.78, 0.73, 0.82, 0.79, 0.86].map((ratio, index) => ({
    label: `${index * 2}h`,
    value: Math.round(base * 1000 * ratio),
  }));
}

function DeviceSummaryPanel({ devices }: { devices: Device[] }) {
  const rows = [
    { label: "Access Points", type: "access_point" as const },
    { label: "Switches", type: "switch" as const },
    { label: "Gateways", type: "gateway" as const },
  ].map((row) => {
    const scoped = devices.filter((device) => device.type === row.type);

    return {
      label: row.label,
      total: scoped.length,
      online: scoped.filter((device) => device.status === "online").length,
      warning: scoped.filter((device) => device.status === "warning").length,
      offline: scoped.filter((device) => device.status === "offline").length,
      unknown: scoped.filter((device) => device.status === "unknown").length,
    };
  });

  return (
    <Card className="h-[368px] rounded-[24px] border border-[#e8eef7] bg-white py-0 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-[#edf2f8] px-5 py-4">
          <div>
            <h3 className="text-xl font-semibold text-[#0f1f46]">Device Summary by Type</h3>
            <p className="text-sm text-slate-500">Infrastructure-only inventory status.</p>
          </div>
          <Button variant="ghost" asChild className="text-[#2563eb] hover:bg-[#f2f7ff]">
            <Link href="/devices">View all</Link>
          </Button>
        </div>
        <div className="h-[calc(368px-80px)] overflow-x-auto px-5 pb-4 pt-2">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="pb-3">Device Type</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Online</th>
                <th className="pb-3">Warning</th>
                <th className="pb-3">Offline</th>
                <th className="pb-3">Unknown</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-[#edf2f8] text-slate-700">
                  <td className="py-2.5 font-medium text-slate-800">{row.label}</td>
                  <td className="py-2.5">{row.total}</td>
                  <td className="py-2.5">{row.online}</td>
                  <td className="py-2.5">{row.warning}</td>
                  <td className="py-2.5">{row.offline}</td>
                  <td className="py-2.5">{row.unknown}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function InfrastructureTrendPanel({ devices }: { devices: Device[] }) {
  const series = buildTrendSeries(devices.length);
  const currentValue = series.at(-1)?.value ?? 0;
  const previousValue = series.at(-2)?.value ?? currentValue;
  const delta = currentValue - previousValue;
  const chartConfig = {
    endpoints: {
      label: "Endpoints",
      color: "#2563eb",
    },
  } satisfies ChartConfig;
  const chartData = series.map((point) => ({
    period: point.label,
    endpoints: point.value,
  }));

  return (
    <Card className="h-[368px] rounded-[24px] border border-[#e8eef7] bg-white py-0 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <CardContent className="flex h-full flex-col p-0">
        <div className="flex flex-col gap-2 border-b border-[#edf2f8] px-5 py-3.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-[1.05rem] font-semibold leading-tight text-[#0f1f46]">Infrastructure Trend</h3>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">Live operational volume across the selected scope.</p>
          </div>
          <Button variant="outline" className="h-9 shrink-0 rounded-2xl border-[#dce7f8] bg-white px-3 text-[13px] text-slate-600">
            Last 24 Hours
          </Button>
        </div>
        <div className="flex flex-1 flex-col px-5 pb-4 pt-3">
          <div className="h-[114px] rounded-2xl bg-[linear-gradient(180deg,#fbfdff_0%,#ffffff_100%)] px-2 py-1">
            <ChartContainer className="h-full w-full" config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 2,
                  right: 2,
                  top: 8,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  tickFormatter={(value) => value}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="endpoints"
                  type="natural"
                  stroke="var(--color-endpoints)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-[#f8fbff] px-3 py-2.5">
            <div>
              <p className="text-[1.1rem] font-semibold leading-none text-[#0f1f46]">
                {currentValue.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">Current Active Endpoints</p>
            </div>
            <div className="text-right">
              <p className="inline-flex items-center gap-1 text-[1rem] font-semibold text-emerald-600">
                <ArrowUpIcon className="size-3.5" />
                {Math.abs(delta).toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">vs previous window</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent({
  data,
  user,
  selectedScope,
  devices,
  onRefresh,
}: {
  data: DashboardSummary;
  user: User;
  selectedScope: SelectedScope | null;
  devices: Device[];
  onRefresh: () => void;
}) {
  const billingDecision = can(user, "view", "billing", selectedScope);
  const systemStatus = getSystemStatus(data);
  const scopeSummary = formatScopeSummary(selectedScope);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <div>
            <h1 className="text-[2rem] font-semibold tracking-tight text-[#0f1f46]">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Overview of your environment within the selected scope.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start">
          <Button
            type="button"
            variant="ghost"
            onClick={onRefresh}
            className="hidden items-center gap-2 rounded-[10px] border border-[#e7eef8] bg-white px-4 py-2 text-sm text-slate-500 shadow-[0_6px_16px_rgba(15,23,42,0.04)] hover:bg-slate-50 md:inline-flex"
          >
            <RefreshCwIcon className="size-4" />
            <span>Last updated: {formatUpdatedTime(data)}</span>
          </Button>
        </div>
      </div>

      <div
        className={[
          "hidden flex-col justify-between gap-4 rounded-[14px] border px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.035)] lg:flex-row lg:items-center",
          systemStatus.className,
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <span
            className={[
              "inline-flex size-10 items-center justify-center rounded-full",
              systemStatus.iconClassName,
            ].join(" ")}
          >
            <ActivityIcon className="size-5" />
          </span>
          <div>
            <p className="font-semibold">{systemStatus.title}</p>
            <p className="text-sm opacity-90">{systemStatus.description}</p>
          </div>
        </div>
        <Button variant="ghost" className="justify-start text-current hover:bg-white/40 hover:text-current lg:justify-center">
          View Status
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {data.kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            kpiKey={kpi.key}
            label={kpi.label}
            value={kpi.value.toLocaleString()}
            description={kpi.delta > 0 ? `Change: ${kpi.delta}` : undefined}
            trend={kpi.deltaLabel}
            severity={kpi.severity}
          />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.12fr_0.88fr]">
        <HealthSummaryPanel health={data.health} />
        <RecentAlertsPanel alerts={data.recentAlerts} />
      </div>

      {billingDecision.allowed && data.billingSummary ? (
        <BillingSummaryPanel summary={data.billingSummary} />
      ) : null}

      <div className="grid gap-3 xl:grid-cols-[1.15fr_1fr_0.95fr]">
        {devices.length > 0 ? <DeviceSummaryPanel devices={devices} /> : null}
        {devices.length > 0 ? <InfrastructureTrendPanel devices={devices} /> : null}
        <QuickActionsPanel user={user} selectedScope={selectedScope} />
      </div>

      <div className="flex flex-col gap-3 rounded-[14px] border border-[#dfe8f7] bg-[linear-gradient(180deg,#f8fbff_0%,#f3f8ff_100%)] px-4 py-3 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-white text-[#2563eb] shadow-[0_2px_8px_rgba(37,99,235,0.12)]">
            <TrendingUpIcon className="size-4" />
          </span>
          <div>
            <p className="font-medium text-slate-700">
              You are viewing data within your current scope.
            </p>
            <p className="text-slate-500">Scope: {scopeSummary}</p>
          </div>
        </div>
        <Button asChild variant="link" className="h-auto px-0 text-[#2563eb]">
          <Link href="/hierarchy">Change Scope</Link>
        </Button>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const setSelectedNode = useScopeStore((state) => state.setSelectedNode);
  const forceNoPermission = useMockRuntimeStore((state) => state.forceNoPermission);

  const dashboardDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "dashboard", selectedScope);
  }, [currentUser, selectedScope]);
  const deviceDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "devices", selectedScope);
  }, [currentUser, selectedScope]);

  const query = useQuery({
    queryKey: ["dashboard", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(
      currentUser && selectedScope && dashboardDecision?.allowed && !forceNoPermission,
    ),
    queryFn: async () => {
      if (!currentUser || !selectedScope) {
        throw new Error("Dashboard scope is not available.");
      }

      return getDashboardSummary(selectedScope.nodeId, currentUser);
    },
  });
  const devicesQuery = useQuery({
    queryKey: ["dashboard-devices", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && deviceDecision?.allowed),
    queryFn: async () => {
      if (!currentUser || !selectedScope) {
        return [];
      }

      return getDevices(selectedScope.nodeId, currentUser);
    },
  });

  if (!currentUser) {
    return (
      <NoPermissionState
        title="No active session"
        description="Sign in with a mock user to access the dashboard."
      />
    );
  }

  if (!selectedScope) {
    return (
      <EmptyState
        title="No scope selected"
        description="Select a hierarchy scope to load the dashboard."
      />
    );
  }

  if (forceNoPermission || !dashboardDecision?.allowed) {
    return (
      <NoPermissionState
        onChangeScope={() => {
          const fallbackScopeId = currentUser.scopeAssignments[0]?.scopePath.at(-1)?.id;

          if (fallbackScopeId) {
            setSelectedNode(fallbackScopeId);
          }
        }}
      />
    );
  }

  if (query.isLoading) {
    return (
      <LoadingState
        title="Loading dashboard"
        description="Fetching KPI, health, and alert summaries for the selected scope."
        variant="page"
        rows={6}
      />
    );
  }

  if (query.isError) {
    const error = query.error;

    if (isMockApiError(error) && error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(error) && error.code === "NO_PERMISSION") {
      return <NoPermissionState onChangeScope={() => void query.refetch()} />;
    }

    return (
      <ErrorState
        error={error}
        onRetry={() => void query.refetch()}
        retryLabel="Retry dashboard"
      />
    );
  }

  if (!query.data) {
    return (
      <ErrorState
        title="Dashboard data unavailable"
        description="The dashboard did not return any data for this scope."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const content = (
    <DashboardContent
      data={query.data}
      user={currentUser}
      selectedScope={selectedScope}
      devices={devicesQuery.data ?? []}
      onRefresh={() => {
        void query.refetch();
        void devicesQuery.refetch();
      }}
    />
  );

  if (query.data.kpis.length === 0 && query.data.recentAlerts.length === 0) {
    return (
      <EmptyState
        title="No dashboard data"
        description="There is no dashboard summary available for the selected scope yet."
      />
    );
  }

  if (useMockRuntimeStore.getState().forcePartialData) {
    return (
      <PartialDataState
        title="Dashboard loaded with limited data"
        description="Available dashboard panels are shown below. Some sections are using fallback or incomplete data."
        failedSections={["Recent Alerts"]}
        onRetry={() => void query.refetch()}
      >
        {content}
      </PartialDataState>
    );
  }

  return (
    <div className="px-0 py-0 sm:px-0 sm:py-0">
      <Card className="border border-[#e7eef8] bg-transparent py-0 shadow-none">
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    </div>
  );
}
