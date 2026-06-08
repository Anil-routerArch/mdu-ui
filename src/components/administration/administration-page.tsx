"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { can } from "@/lib/rbac/can";
import {
  getAdminOverview,
  getAuditLogs,
  getRolesAndPolicies,
} from "@/lib/mock-api/administration";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { AdministrationOverview } from "./administration-overview";
import { AuditLogs } from "./audit-logs";
import { PermissionChangeImpactWarning } from "./permission-change-impact-warning";
import { RolesAndPolicies } from "./roles-and-policies";

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function AdministrationPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);

  const viewDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "administration", selectedScope);
  }, [currentUser, selectedScope]);

  const editDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "edit", "administration", selectedScope);
  }, [currentUser, selectedScope]);

  const overviewQuery = useQuery({
    queryKey: ["administration-overview", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getAdminOverview(currentUser!),
  });

  const rolesQuery = useQuery({
    queryKey: ["administration-roles", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getRolesAndPolicies(currentUser!),
  });

  const auditLogsQuery = useQuery({
    queryKey: ["administration-audit-logs", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getAuditLogs(selectedScope!.nodeId, currentUser!),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!selectedScope) {
    return (
      <EmptyState
        title="No scope selected"
        description="Select a hierarchy scope to load administration data."
      />
    );
  }

  if (!viewDecision?.allowed) {
    return <NoPermissionState description="You cannot view administration in this scope." />;
  }

  const queryError = overviewQuery.error ?? rolesQuery.error ?? auditLogsQuery.error;

  if (overviewQuery.isLoading || rolesQuery.isLoading || auditLogsQuery.isLoading) {
    return <LoadingState title="Loading administration" variant="page" rows={6} />;
  }

  if (queryError) {
    if (isMockApiError(queryError) && queryError.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void overviewQuery.refetch()} />;
    }

    if (isMockApiError(queryError) && queryError.code === "NO_PERMISSION") {
      return <NoPermissionState description="Administration data is not available in this scope." />;
    }

    return <ErrorState error={queryError} onRetry={() => void overviewQuery.refetch()} />;
  }

  const overview = overviewQuery.data;
  const roles = rolesQuery.data ?? [];
  const auditLogs = auditLogsQuery.data ?? [];

  if (!overview || (!roles.length && !auditLogs.length)) {
    return (
      <EmptyState
        title="No administration data"
        description="No administration sections are currently visible for the selected scope."
      />
    );
  }

  return (
    <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Administration</h1>
        <p className="text-sm text-slate-600">
          Scoped administrative controls for {selectedScope.path.map((item) => item.name).join(" / ")}
        </p>
      </div>

      <AdministrationOverview
        overview={overview}
        roles={roles}
        auditLogs={auditLogs}
        selectedScope={selectedScope}
      />

      <PermissionChangeImpactWarning
        affectedUsersCount={1}
        affectedScopes={[selectedScope.path.map((item) => item.name).join(" / ")]}
        affectedModules={["Administration", "Users", "Billing"]}
      />

      <RolesAndPolicies
        profiles={roles}
        currentUser={currentUser}
        canEdit={Boolean(editDecision?.allowed)}
      />

      <AuditLogs selectedScope={selectedScope} currentUser={currentUser} />
    </div>
  );
}
