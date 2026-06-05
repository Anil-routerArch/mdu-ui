"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Edge, Node } from "@xyflow/react";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { getConnectivityGraph, getDevices } from "@/lib/mock-api/devices";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import type { Device } from "@/types/device";
import { TopologyCanvas } from "./topology-canvas";
import { TopologyDeviceDrawer } from "./topology-device-drawer";
import {
  TopologyOverlayControls,
  type TopologyOverlayState,
} from "./topology-overlay-controls";
import type { TopologyFlowNodeData } from "./topology-node";

const defaultOverlays: TopologyOverlayState = {
  gateways: true,
  switches: true,
  access_points: true,
  health: true,
  links: true,
  wireless_quality: false,
};

type ConnectivityViewProps = {
  scopeId: string;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

function buildConnectivityLayout(devices: Device[]): Node<TopologyFlowNodeData>[] {
  const order: Record<Device["type"], number> = {
    gateway: 0,
    switch: 1,
    access_point: 2,
  };

  return [...devices]
    .sort((left, right) => order[left.type] - order[right.type])
    .map((device, index) => ({
      id: device.id,
      type: "topology",
      position: {
        x: 80 + (index % 3) * 260,
        y: 80 + Math.floor(index / 3) * 170,
      },
      data: {
        id: device.id,
        label: device.name,
        subtitle: device.type.replaceAll("_", " "),
        status: device.status,
        kind: device.type,
        deviceId: device.id,
        meta: device.health.summary,
      },
    }));
}

export function ConnectivityView({ scopeId }: ConnectivityViewProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [overlays, setOverlays] = useState(defaultOverlays);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const decision = currentUser ? can(currentUser, "view", "devices", selectedScope) : null;
  const query = useQuery({
    queryKey: ["connectivity-view", scopeId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && decision?.allowed),
    queryFn: async () => {
      const [graph, devices] = await Promise.all([
        getConnectivityGraph(scopeId, currentUser!),
        getDevices(scopeId, currentUser!),
      ]);

      return { graph, devices };
    },
  });

  const devicesById = useMemo(
    () =>
      Object.fromEntries((query.data?.devices ?? []).map((device) => [device.id, device])) as Record<
        string,
        Device
      >,
    [query.data?.devices],
  );

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!decision?.allowed) {
    return <NoPermissionState description="You cannot view connectivity for this scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading connectivity" variant="section" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Connectivity data is not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  if (!query.data || query.data.devices.length === 0) {
    return (
      <EmptyState
        title="No connectivity data"
        description="Infrastructure links will appear when scoped devices are available."
      />
    );
  }

  const nodes = buildConnectivityLayout(query.data.devices);
  const edges: Edge[] = query.data.graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
  }));

  return (
    <div className="space-y-4">
      <TopologyOverlayControls
        overlays={overlays}
        onToggle={(key) => setOverlays((current) => ({ ...current, [key]: !current[key] }))}
      />
      <TopologyCanvas
        title="Connectivity View"
        contextLabel="Gateway → switch → access point relationships within the selected scope."
        nodes={nodes}
        edges={edges}
        overlays={overlays}
        devicesById={devicesById}
        onNodeClick={setSelectedDeviceId}
      />
      <TopologyDeviceDrawer
        device={selectedDeviceId ? devicesById[selectedDeviceId] ?? null : null}
        open={Boolean(selectedDeviceId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDeviceId(null);
          }
        }}
      />
    </div>
  );
}
