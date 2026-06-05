"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2Icon, RefreshCwIcon } from "lucide-react";

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
import { getDashboardSummary } from "@/lib/mock-api/dashboard";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useMockRuntimeStore } from "@/stores/mock-runtime-store";
import { useScopeStore } from "@/stores/scope-store";
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

function DashboardContent({
  data,
  user,
  selectedScope,
}: {
  data: DashboardSummary;
  user: User;
  selectedScope: SelectedScope | null;
}) {
  const billingDecision = can(user, "view", "billing", selectedScope);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Building2Icon className="size-4" />
          <span>{formatScopeSummary(selectedScope)}</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Operational overview for the current hierarchy scope.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value.toLocaleString()}
            description={kpi.delta > 0 ? `Change: ${kpi.delta}` : undefined}
            trend={kpi.deltaLabel}
            severity={kpi.severity}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <HealthSummaryPanel health={data.health} />
        <RecentAlertsPanel alerts={data.recentAlerts} />
      </div>

      {billingDecision.allowed && data.billingSummary ? (
        <BillingSummaryPanel summary={data.billingSummary} />
      ) : null}

      <QuickActionsPanel user={user} selectedScope={selectedScope} />
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          <RefreshCwIcon className="size-4" />
          Refresh
        </Button>
      </div>
      <Card className="border border-slate-200/80 bg-slate-50/60 shadow-none">
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    </div>
  );
}
