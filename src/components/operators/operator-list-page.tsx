"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { getOperators } from "@/lib/mock-api/operators";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { CreateOperatorForm } from "./create-operator-form";
import { OperatorList } from "./operator-list";

export function OperatorListPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [createOpen, setCreateOpen] = useState(false);

  const viewDecision = useMemo(() => {
    if (!currentUser) return { allowed: false };
    return can(currentUser, "view", "operators", selectedScope);
  }, [currentUser, selectedScope]);

  const createDecision = useMemo(() => {
    if (!currentUser) return { allowed: false };
    return can(currentUser, "create", "operators", selectedScope);
  }, [currentUser, selectedScope]);

  const query = useQuery({
    queryKey: ["operators", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && viewDecision?.allowed),
    queryFn: () => getOperators(),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!viewDecision?.allowed) {
    return <NoPermissionState description="You do not have permission to view operators." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading operators" variant="page" rows={5} />;
  }

  if (query.isError) {
    // If it's a connection / URL error or standard HTTP failure
    const errMsg = (query.error as any)?.message || "";
    if (errMsg.includes("unreachable") || errMsg.includes("not configured")) {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const operators = query.data ?? [];

  return (
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Operators</h1>
          <p className="text-sm text-slate-600">
            Manage provisioned operators, device registration IDs, and default parameters.
          </p>
        </div>
        {createDecision?.allowed ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create Operator
          </Button>
        ) : null}
      </div>

      {operators.length === 0 ? (
        <EmptyState
          title="No operators found"
          description="Provisioned operators will appear here."
          actionLabel={createDecision?.allowed ? "Create Operator" : undefined}
          onAction={createDecision?.allowed ? () => setCreateOpen(true) : undefined}
          canAct={Boolean(createDecision?.allowed)}
        />
      ) : (
        <OperatorList
          operators={operators}
          currentUser={currentUser}
          selectedScope={selectedScope}
        />
      )}

      {createDecision?.allowed ? (
        <CreateOperatorForm
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      ) : null}
    </div>
  );
}
