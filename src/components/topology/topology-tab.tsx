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
import { getDevices } from "@/lib/mock-api/devices";
import { getHierarchyNode } from "@/lib/mock-api/hierarchy";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import type { Device } from "@/types/device";
import type { HierarchyNode } from "@/types/hierarchy";
import { ConnectivityView } from "./connectivity-view";
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

type TopologyTabProps = {
  nodeId: string;
};

type MockApiError = { code?: string };

type TopologyQueryResult = {
  node: HierarchyNode;
  devices: Device[];
};

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

function groupDevicesByPathLevel(devices: Device[], levelType: string) {
  const groups = new Map<string, { label: string; count: number; status: TopologyFlowNodeData["status"] }>();

  for (const device of devices) {
    const pathItem = device.assignment?.path.find((item) => item.type === levelType);
    const key = pathItem?.id ?? device.assignment?.nodeId ?? device.id;
    const label = pathItem?.name ?? device.assignment?.nodeName ?? device.name;
    const current = groups.get(key);

    const nextStatus: TopologyFlowNodeData["status"] =
      device.status === "offline"
        ? "offline"
        : device.status === "warning" || current?.status === "warning"
          ? "warning"
          : "online";

    groups.set(key, {
      label,
      count: (current?.count ?? 0) + 1,
      status: current?.status === "offline" ? "offline" : nextStatus,
    });
  }

  return Array.from(groups.entries()).map(([id, value]) => ({ id, ...value }));
}

function makeGroupNodes(groups: Array<{ id: string; label: string; count: number; status: TopologyFlowNodeData["status"] }>): Node<TopologyFlowNodeData>[] {
  return groups.map((group, index) => ({
    id: group.id,
    type: "topology",
    position: {
      x: 90 + (index % 3) * 260,
      y: 90 + Math.floor(index / 3) * 190,
    },
    data: {
      id: group.id,
      label: group.label,
      subtitle: "summary node",
      status: group.status,
      kind: "group",
      meta: `${group.count} devices`,
    },
  }));
}

function makeDeviceNodes(devices: Device[], columns = 3): Node<TopologyFlowNodeData>[] {
  return devices.map((device, index) => ({
    id: device.id,
    type: "topology",
    position: {
      x: 80 + (index % columns) * 250,
      y: 80 + Math.floor(index / columns) * 180,
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

function buildTopologyForNode(node: HierarchyNode, devices: Device[]): {
  nodes: Node<TopologyFlowNodeData>[];
  edges: Edge[];
  modeLabel: string;
} {
  if (node.type === "site") {
    const groups = groupDevicesByPathLevel(devices, "building");
    return {
      nodes: makeGroupNodes(groups),
      edges: groups.slice(1).map((group, index) => ({
        id: `site-edge-${index}`,
        source: groups[index].id,
        target: group.id,
      })),
      modeLabel: "Site mode: building summaries and aggregate topology.",
    };
  }

  if (node.type === "building") {
    const groups = groupDevicesByPathLevel(devices, "floor");
    return {
      nodes: makeGroupNodes(groups),
      edges: groups.slice(1).map((group, index) => ({
        id: `building-edge-${index}`,
        source: groups[index].id,
        target: group.id,
      })),
      modeLabel: "Building mode: floor and device distribution summary.",
    };
  }

  if (node.type === "tower") {
    const groups = groupDevicesByPathLevel(devices, "floor");
    return {
      nodes: makeGroupNodes(groups),
      edges: groups.slice(1).map((group, index) => ({
        id: `tower-edge-${index}`,
        source: groups[index].id,
        target: group.id,
      })),
      modeLabel: "Tower mode: floor relationship summary.",
    };
  }

  if (node.type === "floor") {
    const nodes = makeDeviceNodes(devices, 3).map((flowNode, index) => ({
      ...flowNode,
      position: {
        x: 100 + (index % 2) * 300,
        y: 90 + Math.floor(index / 2) * 190,
      },
    }));

    const edges = devices.slice(1).map((device, index) => ({
      id: `floor-edge-${index}`,
      source: devices[Math.max(0, index)].id,
      target: device.id,
    }));

    return {
      nodes,
      edges,
      modeLabel: "Floor mode: AP placement and floor topology.",
    };
  }

  if (node.type === "venue") {
    const nodes = makeDeviceNodes(devices, 2);
    const edges = devices.slice(1).map((device, index) => ({
      id: `venue-edge-${index}`,
      source: devices[Math.max(0, index)].id,
      target: device.id,
    }));

    return {
      nodes,
      edges,
      modeLabel: "Venue mode: detailed AP behavior and coverage-oriented topology.",
    };
  }

  return {
    nodes: makeDeviceNodes(devices, 3),
    edges: devices.slice(1).map((device, index) => ({
      id: `default-edge-${index}`,
      source: devices[Math.max(0, index)].id,
      target: device.id,
    })),
    modeLabel: "Contextual topology derived from scoped infrastructure devices.",
  };
}

export function TopologyTab({ nodeId }: TopologyTabProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [overlays, setOverlays] = useState(defaultOverlays);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const decision = currentUser ? can(currentUser, "view", "devices", selectedScope) : null;
  const query = useQuery<TopologyQueryResult>({
    queryKey: ["hierarchy-topology", nodeId, selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && decision?.allowed),
    queryFn: async () => {
      const [node, devices] = await Promise.all([
        getHierarchyNode(nodeId),
        getDevices(nodeId, currentUser!),
      ]);

      return { node, devices };
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
    return <NoPermissionState description="You cannot view topology for this scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading topology" variant="page" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Topology is not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  if (!query.data) {
    return (
      <ErrorState
        title="Topology unavailable"
        description="The topology context could not be loaded for this node."
      />
    );
  }

  if (!query.data.node.metadata.hasTopology && query.data.devices.length === 0) {
    return (
      <EmptyState
        title="No topology data"
        description="This hierarchy node does not currently expose topology information."
      />
    );
  }

  if (query.data.devices.length === 0) {
    return (
      <EmptyState
        title="No scoped devices"
        description="Topology will render when gateways, switches, or access points are available in this node scope."
      />
    );
  }

  const topology = buildTopologyForNode(query.data.node, query.data.devices);

  return (
    <div className="space-y-4">
      <TopologyOverlayControls
        overlays={overlays}
        onToggle={(key) => setOverlays((current) => ({ ...current, [key]: !current[key] }))}
      />
      <TopologyCanvas
        title="Topology"
        contextLabel={`${topology.modeLabel} Selected scope: ${query.data.node.path.map((item) => item.name).join(" / ")}`}
        nodes={topology.nodes}
        edges={topology.edges}
        overlays={overlays}
        devicesById={devicesById}
        onNodeClick={setSelectedDeviceId}
      />
      <ConnectivityView scopeId={nodeId} />
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
