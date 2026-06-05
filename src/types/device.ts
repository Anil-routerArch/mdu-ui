import type { ID, ISODateTime, StatusSeverity } from "@/types/common";
import type { ScopePathItem } from "@/types/hierarchy";

export type DeviceType = "gateway" | "switch" | "access_point";

export type DeviceStatus = "online" | "warning" | "offline" | "unknown";

export type DeviceAction =
  | "reboot"
  | "upgrade_firmware"
  | "blink_led"
  | "factory_reset";

export interface DeviceHealth {
  status: DeviceStatus;
  severity: StatusSeverity;
  summary: string;
  lastSeenAt: ISODateTime | null;
  cpuUsagePercent?: number;
  memoryUsagePercent?: number;
  latencyMs?: number;
}

export interface DeviceAssignment {
  nodeId: ID;
  nodeType: ScopePathItem["type"];
  nodeName: string;
  venueId?: ID;
  floorId?: ID;
  assignedAt: ISODateTime;
  path: ScopePathItem[];
}

export interface FirmwareInfo {
  currentVersion: string;
  availableVersion: string | null;
  targetVersion: string | null;
  upgradeEligible: boolean;
  upgradeStatus:
    | "up_to_date"
    | "available"
    | "scheduled"
    | "in_progress"
    | "failed";
}

export interface DeviceDiagnosticEvent {
  id: ID;
  severity: StatusSeverity;
  code: string;
  message: string;
  occurredAt: ISODateTime;
}

export interface Device {
  id: ID;
  serial: string;
  name: string;
  type: DeviceType;
  model: string;
  macAddress: string;
  status: DeviceStatus;
  health: DeviceHealth;
  assignment: DeviceAssignment | null;
  firmware: FirmwareInfo;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
