import { getScopePath, hierarchyExampleIds } from "@/lib/mock-data/hierarchy";
import type { Device, DeviceDiagnosticEvent } from "@/types/device";

const now = "2026-06-05T10:24:00Z";

function createDevice(device: Device): Device {
  return device;
}

function createEvent(event: DeviceDiagnosticEvent): DeviceDiagnosticEvent {
  return event;
}

export const mockDevices: Device[] = [
  createDevice({
    id: "device-gw-001",
    serial: "GW-001-AX9",
    name: "Gateway GW-001",
    type: "gateway",
    model: "EdgeCore G900",
    macAddress: "00:11:22:33:44:01",
    status: "online",
    health: {
      status: "online",
      severity: "success",
      summary: "Gateway operational",
      lastSeenAt: now,
      cpuUsagePercent: 31,
      memoryUsagePercent: 46,
      latencyMs: 8,
    },
    assignment: {
      nodeId: hierarchyExampleIds.TOWER_1_ID,
      nodeType: "tower",
      nodeName: "Tower 1",
      assignedAt: now,
      path: getScopePath(hierarchyExampleIds.TOWER_1_ID),
    },
    firmware: {
      currentVersion: "3.2.1",
      availableVersion: "3.2.2",
      targetVersion: null,
      upgradeEligible: true,
      upgradeStatus: "available",
    },
    createdAt: now,
    updatedAt: now,
  }),
  createDevice({
    id: "device-sw-001",
    serial: "SW-001-48P",
    name: "Switch SW-001",
    type: "switch",
    model: "CoreSwitch 48P",
    macAddress: "00:11:22:33:44:02",
    status: "warning",
    health: {
      status: "warning",
      severity: "warning",
      summary: "High memory usage detected",
      lastSeenAt: now,
      cpuUsagePercent: 52,
      memoryUsagePercent: 84,
      latencyMs: 13,
    },
    assignment: {
      nodeId: hierarchyExampleIds.FLOOR_12_ID,
      nodeType: "floor",
      nodeName: "Floor 12",
      assignedAt: now,
      path: getScopePath(hierarchyExampleIds.FLOOR_12_ID),
    },
    firmware: {
      currentVersion: "5.4.0",
      availableVersion: null,
      targetVersion: null,
      upgradeEligible: false,
      upgradeStatus: "up_to_date",
    },
    createdAt: now,
    updatedAt: now,
  }),
  createDevice({
    id: "device-ap-001",
    serial: "AP-001-W6",
    name: "AP Lounge 01",
    type: "access_point",
    model: "AirMesh AP6",
    macAddress: "00:11:22:33:44:03",
    status: "online",
    health: {
      status: "online",
      severity: "success",
      summary: "Coverage healthy",
      lastSeenAt: now,
      cpuUsagePercent: 24,
      memoryUsagePercent: 38,
      latencyMs: 6,
    },
    assignment: {
      nodeId: hierarchyExampleIds.VENUE_LOUNGE_ID,
      nodeType: "venue",
      nodeName: "Venue Lounge",
      venueId: hierarchyExampleIds.VENUE_LOUNGE_ID,
      floorId: hierarchyExampleIds.FLOOR_12_ID,
      assignedAt: now,
      path: getScopePath(hierarchyExampleIds.VENUE_LOUNGE_ID),
    },
    firmware: {
      currentVersion: "2.9.4",
      availableVersion: "2.9.5",
      targetVersion: "2.9.5",
      upgradeEligible: true,
      upgradeStatus: "scheduled",
    },
    createdAt: now,
    updatedAt: now,
  }),
  createDevice({
    id: "device-ap-002",
    serial: "AP-002-W6",
    name: "AP Office 01",
    type: "access_point",
    model: "AirMesh AP6",
    macAddress: "00:11:22:33:44:04",
    status: "offline",
    health: {
      status: "offline",
      severity: "critical",
      summary: "AP unreachable",
      lastSeenAt: "2026-06-05T09:58:00Z",
      cpuUsagePercent: 0,
      memoryUsagePercent: 0,
      latencyMs: 0,
    },
    assignment: {
      nodeId: hierarchyExampleIds.VENUE_OFFICE_ID,
      nodeType: "venue",
      nodeName: "Venue Office",
      venueId: hierarchyExampleIds.VENUE_OFFICE_ID,
      floorId: hierarchyExampleIds.FLOOR_12_ID,
      assignedAt: now,
      path: getScopePath(hierarchyExampleIds.VENUE_OFFICE_ID),
    },
    firmware: {
      currentVersion: "2.9.3",
      availableVersion: "2.9.5",
      targetVersion: null,
      upgradeEligible: true,
      upgradeStatus: "failed",
    },
    createdAt: now,
    updatedAt: now,
  }),
  createDevice({
    id: "device-gw-002",
    serial: "GW-002-AX9",
    name: "Gateway Harbor 01",
    type: "gateway",
    model: "EdgeCore G900",
    macAddress: "00:11:22:33:44:05",
    status: "online",
    health: {
      status: "online",
      severity: "success",
      summary: "Gateway operational",
      lastSeenAt: now,
      cpuUsagePercent: 28,
      memoryUsagePercent: 41,
      latencyMs: 10,
    },
    assignment: {
      nodeId: hierarchyExampleIds.HARBOR_VENUE_ID,
      nodeType: "venue",
      nodeName: "Venue Harbor Club",
      venueId: hierarchyExampleIds.HARBOR_VENUE_ID,
      assignedAt: now,
      path: getScopePath(hierarchyExampleIds.HARBOR_VENUE_ID),
    },
    firmware: {
      currentVersion: "3.2.1",
      availableVersion: null,
      targetVersion: null,
      upgradeEligible: false,
      upgradeStatus: "up_to_date",
    },
    createdAt: now,
    updatedAt: now,
  }),
];

export const mockDeviceDiagnostics: Record<string, DeviceDiagnosticEvent[]> = {
  "device-gw-001": [
    createEvent({
      id: "diag-gw-001-1",
      severity: "info",
      code: "WAN_OK",
      message: "WAN uplink stable",
      occurredAt: "2026-06-05T10:10:00Z",
    }),
  ],
  "device-sw-001": [
    createEvent({
      id: "diag-sw-001-1",
      severity: "warning",
      code: "HIGH_MEMORY",
      message: "Memory usage exceeded 80%",
      occurredAt: "2026-06-05T09:58:00Z",
    }),
  ],
  "device-ap-001": [
    createEvent({
      id: "diag-ap-001-1",
      severity: "info",
      code: "RADIO_HEALTHY",
      message: "Radio utilization within expected range",
      occurredAt: "2026-06-05T10:08:00Z",
    }),
  ],
  "device-ap-002": [
    createEvent({
      id: "diag-ap-002-1",
      severity: "critical",
      code: "DEVICE_UNREACHABLE",
      message: "Access point not responding to heartbeat",
      occurredAt: "2026-06-05T09:42:00Z",
    }),
  ],
  "device-gw-002": [
    createEvent({
      id: "diag-gw-002-1",
      severity: "info",
      code: "SYSTEM_OK",
      message: "System diagnostics passed",
      occurredAt: "2026-06-05T10:12:00Z",
    }),
  ],
};
