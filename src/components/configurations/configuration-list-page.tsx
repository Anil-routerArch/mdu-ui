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
import { getConfigurations } from "@/lib/mock-api/configurations";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { ConfigurationList } from "./configuration-list";
import { CreateConfigurationDialog } from "./create-configuration-dialog";

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function ConfigurationListPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [createOpen, setCreateOpen] = useState(false);

  const viewDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "configurations", selectedScope);
  }, [currentUser, selectedScope]);

  const createDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "create", "configurations", selectedScope);
  }, [currentUser, selectedScope]);

  const query = useQuery({
    queryKey: ["configurations", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getConfigurations(selectedScope!.nodeId, currentUser!),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!selectedScope) {
    return (
      <EmptyState
        title="No scope selected"
        description="Select a hierarchy scope to load configuration sets."
      />
    );
  }

  if (!viewDecision?.allowed) {
    return <NoPermissionState description="You cannot view configurations for this scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading configurations" variant="page" rows={5} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Configuration data is not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const configurations = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Configurations</h1>
          <p className="text-sm text-slate-600">
            Scoped configuration sets for {selectedScope.path.map((item) => item.name).join(" / ")}
          </p>
        </div>
        {createDecision?.allowed ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create Configuration
          </Button>
        ) : null}
      </div>

      {configurations.length === 0 ? (
        <EmptyState
          title="No configurations"
          description="Configuration sets in the selected scope will appear here."
          actionLabel={createDecision?.allowed ? "Create Configuration" : undefined}
          onAction={createDecision?.allowed ? () => setCreateOpen(true) : undefined}
          canAct={Boolean(createDecision?.allowed)}
        />
      ) : (
        <ConfigurationList
          configurations={configurations}
          user={currentUser}
          selectedScope={selectedScope}
        />
      )}

      {createDecision?.allowed ? (
        <CreateConfigurationDialog
          open={createOpen}
          selectedScope={selectedScope}
          onOpenChange={setCreateOpen}
        />
      ) : null}
    </div>
  );
}
