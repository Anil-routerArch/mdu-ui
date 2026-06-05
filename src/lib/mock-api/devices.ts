import {
  assertCanAccess,
  createMockApiError,
  filterByScope,
  getRuntimeFlags,
  withMockApi,
} from "@/lib/mock-api/client";
import { mockDeviceDiagnostics, mockDevices } from "@/lib/mock-data/devices";
import type { Device, DeviceDiagnosticEvent } from "@/types/device";
import type { User } from "@/types/user";

export interface ConnectivityGraphNode {
  id: string;
  label: string;
  type: Device["type"];
  status: Device["status"];
}

export interface ConnectivityGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ConnectivityGraph {
  nodes: ConnectivityGraphNode[];
  edges: ConnectivityGraphEdge[];
}

export async function getDevices(scopeId: string, user: User): Promise<Device[]> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "devices", scopeId);
    return filterByScope(mockDevices, (device) => device.assignment?.path ?? [], scopeId, user);
  });
}

export async function getDeviceById(deviceId: string, user: User): Promise<Device> {
  return withMockApi(() => {
    const device = mockDevices.find((item) => item.id === deviceId);

    if (!device) {
      throw createMockApiError("NOT_FOUND", "Device not found.", { status: 404 });
    }

    const scopeId = device.assignment?.path[0]?.id ?? null;
    assertCanAccess(user, "view", "devices", scopeId);

    const accessible = filterByScope(
      [device],
      (item) => item.assignment?.path ?? [],
      null,
      user,
    )[0];

    if (!accessible) {
      throw createMockApiError("NO_PERMISSION", "Device is outside allowed scope.", {
        status: 403,
      });
    }

    return accessible;
  });
}

export async function getDeviceDiagnostics(
  deviceId: string,
  user: User,
): Promise<DeviceDiagnosticEvent[]> {
  return withMockApi(async () => {
    const device = await getDeviceById(deviceId, user);
    assertCanAccess(user, "diagnose", "devices", device.assignment?.path[0]?.id ?? null);
    return mockDeviceDiagnostics[deviceId] ?? [];
  });
}

export async function getConnectivityGraph(
  scopeId: string,
  user: User,
): Promise<ConnectivityGraph> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "devices", scopeId);

    const scopedDevices = filterByScope(
      mockDevices,
      (device) => device.assignment?.path ?? [],
      scopeId,
      user,
    );

    const nodes: ConnectivityGraphNode[] = scopedDevices.map((device) => ({
      id: device.id,
      label: device.name,
      type: device.type,
      status: device.status,
    }));

    const edges: ConnectivityGraphEdge[] = [];

    if (scopedDevices.length > 1) {
      for (let index = 1; index < scopedDevices.length; index += 1) {
        edges.push({
          id: `edge-${scopedDevices[index - 1].id}-${scopedDevices[index].id}`,
          source: scopedDevices[index - 1].id,
          target: scopedDevices[index].id,
          label: "uplink",
        });
      }
    }

    const { forcePartialData } = getRuntimeFlags();

    if (forcePartialData) {
      return {
        nodes,
        edges: edges.slice(0, Math.max(0, edges.length - 1)),
      };
    }

    return { nodes, edges };
  });
}
