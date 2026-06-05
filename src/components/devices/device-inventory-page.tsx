"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { getDevices } from "@/lib/mock-api/devices";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { useUiStore } from "@/stores/ui-store";
import { AddDeviceDialog } from "./add-device-dialog";
import { DeviceList } from "./device-list";

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function DeviceInventoryPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const setActiveModule = useUiStore((state) => state.setActiveModule);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setActiveModule("devices");
  }, [setActiveModule]);

  const viewDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "devices", selectedScope);
  }, [currentUser, selectedScope]);

  const createDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "create", "devices", selectedScope);
  }, [currentUser, selectedScope]);

  const query = useQuery({
    queryKey: ["devices", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getDevices(selectedScope!.nodeId, currentUser!),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!selectedScope) {
    return (
      <EmptyState
        title="No scope selected"
        description="Select a hierarchy scope to load infrastructure devices."
      />
    );
  }

  if (!viewDecision?.allowed) {
    return <NoPermissionState description="You cannot view devices for this scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading devices" variant="page" rows={5} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Device inventory is not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const devices = query.data ?? [];
  const scopeSummary = selectedScope.path.map((item) => item.name).join(" / ");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Devices</h1>
          <p className="text-sm text-slate-600">
            Infrastructure inventory for the selected scope: {scopeSummary}
          </p>
        </div>
        {createDecision?.allowed ? (
          <Button type="button" onClick={() => setAddOpen(true)}>
            Add Device
          </Button>
        ) : null}
      </div>

      {devices.length === 0 ? (
        <EmptyState
          title="No infrastructure devices"
          description="Gateways, switches, and access points in the selected scope will appear here."
          actionLabel={createDecision?.allowed ? "Add Device" : undefined}
          onAction={createDecision?.allowed ? () => setAddOpen(true) : undefined}
          canAct={Boolean(createDecision?.allowed)}
        />
      ) : (
        <DeviceList devices={devices} user={currentUser} selectedScope={selectedScope} />
      )}

      {createDecision?.allowed ? (
        <AddDeviceDialog
          open={addOpen}
          selectedScope={selectedScope}
          onOpenChange={setAddOpen}
        />
      ) : null}
    </div>
  );
}
