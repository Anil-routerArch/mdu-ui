import { getHeaders, getServiceUrl, checkServiceUrl } from "@/lib/api/config";
import { getHierarchyNode, globalFlattenedNodesCache } from "@/lib/mock-api/hierarchy";
import type { Device, DeviceType, DeviceDiagnosticEvent, DeviceStatus } from "@/types/device";
import type { User } from "@/types/user";
import type { HierarchyNode } from "@/types/hierarchy";

const OWPROV_URL = getServiceUrl("provisioning");

function checkProvServiceUrl() {
  checkServiceUrl("provisioning");
}

function mapInventoryTagToDevice(
  tag: any,
  allEntities: any[],
  allVenues: any[],
  hierarchyNodes: HierarchyNode[]
): Device {
  const typeMap: Record<string, DeviceType> = {
    gateway: "gateway",
    switch: "switch",
    access_point: "access_point",
    subscriber: "access_point",
  };
  const type = typeMap[tag.devClass] || "access_point";

  let assignment: Device["assignment"] = null;
  const targetId = tag.venue || tag.entity;
  const cachedNode = hierarchyNodes.find((n) => n.id === targetId);

  if (cachedNode) {
    assignment = {
      nodeId: cachedNode.id,
      nodeType: cachedNode.type,
      nodeName: cachedNode.name,
      assignedAt: new Date((tag.created || tag.info?.created || 0) * 1000).toISOString(),
      path: cachedNode.path,
    };
  } else {
    if (tag.venue) {
      const venue = allVenues.find((v: any) => v.id === tag.venue);
      assignment = {
        nodeId: tag.venue,
        nodeType: "venue",
        nodeName: venue ? venue.name : "Venue",
        venueId: tag.venue,
        assignedAt: new Date((tag.created || tag.info?.created || 0) * 1000).toISOString(),
        path: [],
      };
    } else if (tag.entity) {
      const entity = allEntities.find((e: any) => e.id === tag.entity);
      assignment = {
        nodeId: tag.entity,
        nodeType: "customer",
        nodeName: entity ? entity.name : "Entity",
        assignedAt: new Date((tag.created || tag.info?.created || 0) * 1000).toISOString(),
        path: [],
      };
    }
  }

  const tagId = tag.info?.id || tag.id || tag.serialNumber;
  const tagName = tag.info?.name || tag.name || tag.serialNumber;
  const tagCreated = tag.info?.created || tag.created || 0;
  const tagModified = tag.info?.modified || tag.modified || 0;

  return {
    id: tagId,
    serial: tag.serialNumber,
    name: tagName,
    type: type,
    model: tag.deviceType || tag.platform || "Unknown",
    macAddress: tag.realMacAddress || "00:00:00:00:00:00",
    status: tag.connected ? "online" : "offline",
    health: {
      status: tag.connected ? "online" : "offline",
      severity: tag.connected ? "info" : "critical",
      summary: tag.connected ? "Device is online and healthy" : "Device is offline",
      lastSeenAt: tagModified ? new Date(tagModified * 1000).toISOString() : null,
      cpuUsagePercent: tag.connected ? 18 : undefined,
      memoryUsagePercent: tag.connected ? 35 : undefined,
      latencyMs: tag.connected ? 8 : undefined,
    },
    assignment: assignment,
    firmware: {
      currentVersion: "v1.0.0",
      availableVersion: null,
      targetVersion: null,
      upgradeEligible: false,
      upgradeStatus: "up_to_date",
    },
    createdAt: new Date(tagCreated * 1000).toISOString(),
    updatedAt: new Date(tagModified * 1000).toISOString(),
  };
}

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
  checkProvServiceUrl();

  // 1. Fetch all entities (for mapping names)
  const entitiesRes = await fetch(`${OWPROV_URL}/api/v1/entity`, {
    method: "GET",
    headers: getHeaders(),
  });
  const entitiesData = entitiesRes.ok ? await entitiesRes.json() : {};
  const allEntities = entitiesData.entities || [];

  // 2. Fetch all venues (for mapping names)
  const venuesRes = await fetch(`${OWPROV_URL}/api/v1/venue`, {
    method: "GET",
    headers: getHeaders(),
  });
  const venuesData = venuesRes.ok ? await venuesRes.json() : {};
  const allVenues = venuesData.venues || venuesData.entries || [];

  // 3. Always query full global inventory first to resolve recursively
  const res = await fetch(`${OWPROV_URL}/api/v1/inventory`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData?.ErrorDescription || "Failed to fetch inventory from Provisioning service."
    );
  }

  const data = await res.json();
  const taglist = data.taglist || [];

  // 4. Map devices and resolve their paths from cache
  const allDevices: Device[] = taglist.map((tag: any) =>
    mapInventoryTagToDevice(tag, allEntities, allVenues, globalFlattenedNodesCache)
  );

  // 5. If no scopeId or top entity, show all devices
  if (!scopeId || scopeId === "0000-0000-0000") {
    return allDevices;
  }

  // 6. Otherwise filter by selected scope recursively
  return allDevices.filter(
    (device) =>
      device.assignment &&
      device.assignment.path.some((pathItem) => pathItem.id === scopeId)
  );
}

export async function getDeviceById(deviceId: string, user: User): Promise<Device> {
  checkProvServiceUrl();

  // Find tag by SerialNumber lookup or general list mapping.
  // The deviceId can be either a serial number or tag UUID. We attempt lookup by SerialNumber first.
  const res = await fetch(`${OWPROV_URL}/api/v1/inventory/${encodeURIComponent(deviceId)}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    // If not found directly, scan list
    const all = await getDevices("0000-0000-0000", user).catch(() => []);
    const found = all.find((item) => item.id === deviceId || item.serial === deviceId);
    if (!found) {
      throw new Error("Device not found.");
    }
    return found;
  }

  const tag = await res.json();

  // Fetch names
  const entitiesRes = await fetch(`${OWPROV_URL}/api/v1/entity`, {
    method: "GET",
    headers: getHeaders(),
  });
  const entitiesData = entitiesRes.ok ? await entitiesRes.json() : {};
  const allEntities = entitiesData.entities || [];

  const venuesRes = await fetch(`${OWPROV_URL}/api/v1/venue`, {
    method: "GET",
    headers: getHeaders(),
  });
  const venuesData = venuesRes.ok ? await venuesRes.json() : {};
  const allVenues = venuesData.venues || venuesData.entries || [];

  return mapInventoryTagToDevice(tag, allEntities, allVenues, globalFlattenedNodesCache);
}

export async function createDevice(
  payload: {
    serialNumber: string;
    deviceType: string;
    scopeId: string;
    scopeType: string;
  },
  user: User
): Promise<any> {
  checkProvServiceUrl();

  const formattedSerial = payload.serialNumber.trim().toLowerCase();

  const body: any = {
    serialNumber: formattedSerial,
    name: payload.serialNumber.trim(),
    deviceType: "edgecore_eap101", // Default acceptable deviceType in openwifi DB cache
    devClass: payload.deviceType,
  };

  if (payload.scopeType === "venue") {
    body.venue = payload.scopeId;
  } else {
    if (payload.scopeId !== "0000-0000-0000") {
      body.entity = payload.scopeId;
    }
  }

  const res = await fetch(
    `${OWPROV_URL}/api/v1/inventory/${encodeURIComponent(formattedSerial)}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData?.ErrorDescription || "Failed to enroll device in Provisioning service."
    );
  }

  return res.json();
}

export async function getDeviceDiagnostics(
  deviceId: string,
  user: User
): Promise<DeviceDiagnosticEvent[]> {
  return [];
}

export async function getConnectivityGraph(
  scopeId: string,
  user: User
): Promise<ConnectivityGraph> {
  const scopedDevices = await getDevices(scopeId, user).catch(() => []);

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

  return { nodes, edges };
}
