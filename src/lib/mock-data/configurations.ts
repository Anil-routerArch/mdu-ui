import { getScopePath, hierarchyExampleIds } from "@/lib/mock-data/hierarchy";
import type {
  ConfigurationAssignment,
  ConfigurationSet,
  ConfigurationVersion,
} from "@/types/config";

const now = "2026-06-05T10:24:00Z";

function createVersion(version: ConfigurationVersion): ConfigurationVersion {
  return version;
}

function createConfig(config: ConfigurationSet): ConfigurationSet {
  return config;
}

function createAssignment(
  assignment: ConfigurationAssignment,
): ConfigurationAssignment {
  return assignment;
}

export const mockConfigurationSets: ConfigurationSet[] = [
  createConfig({
    id: "config-core-floor12",
    name: "Floor 12 Core Network",
    description: "Primary switching and AP profile for Floor 12",
    scopePath: getScopePath(hierarchyExampleIds.FLOOR_12_ID),
    status: "active",
    currentVersion: createVersion({
      id: "config-core-floor12-v3",
      version: 3,
      changeSummary: "Adjusted AP channel plan and uplink settings",
      createdAt: now,
      createdByUserId: "user-operator-admin",
    }),
    assignmentCount: 2,
    updatedAt: now,
  }),
  createConfig({
    id: "config-lounge-ssid",
    name: "Venue Lounge SSID Profile",
    description: "Guest Wi-Fi profile for venue lounge",
    scopePath: getScopePath(hierarchyExampleIds.VENUE_LOUNGE_ID),
    status: "active",
    currentVersion: createVersion({
      id: "config-lounge-ssid-v2",
      version: 2,
      changeSummary: "Updated captive portal timeout",
      createdAt: now,
      createdByUserId: "user-customer-admin",
    }),
    assignmentCount: 1,
    updatedAt: now,
  }),
  createConfig({
    id: "config-harbor-gateway",
    name: "Harbor Gateway Base",
    description: "Baseline configuration for Harbor gateway",
    scopePath: getScopePath(hierarchyExampleIds.HARBOR_SITE_ID),
    status: "draft",
    currentVersion: createVersion({
      id: "config-harbor-gateway-v1",
      version: 1,
      changeSummary: "Initial draft",
      createdAt: now,
      createdByUserId: "user-read-only",
    }),
    assignmentCount: 1,
    updatedAt: now,
  }),
];

export const mockConfigurationAssignments: ConfigurationAssignment[] = [
  createAssignment({
    id: "config-assignment-floor12",
    configurationId: "config-core-floor12",
    targetNodeId: hierarchyExampleIds.FLOOR_12_ID,
    targetNodeType: "floor",
    targetPath: getScopePath(hierarchyExampleIds.FLOOR_12_ID),
    assignedAt: now,
  }),
  createAssignment({
    id: "config-assignment-lounge",
    configurationId: "config-lounge-ssid",
    targetNodeId: hierarchyExampleIds.VENUE_LOUNGE_ID,
    targetNodeType: "venue",
    targetPath: getScopePath(hierarchyExampleIds.VENUE_LOUNGE_ID),
    assignedAt: now,
  }),
  createAssignment({
    id: "config-assignment-harbor",
    configurationId: "config-harbor-gateway",
    targetNodeId: hierarchyExampleIds.HARBOR_VENUE_ID,
    targetNodeType: "venue",
    targetPath: getScopePath(hierarchyExampleIds.HARBOR_VENUE_ID),
    assignedAt: now,
  }),
];
