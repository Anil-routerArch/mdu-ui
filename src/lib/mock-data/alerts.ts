import { getScopePath, hierarchyExampleIds } from "@/lib/mock-data/hierarchy";
import type { RecentAlert } from "@/types/dashboard";

function createAlert(alert: RecentAlert): RecentAlert {
  return alert;
}

export const mockRecentAlerts: RecentAlert[] = [
  createAlert({
    id: "alert-node-n12",
    severity: "critical",
    title: "Node N-12 is unreachable",
    description: "Heartbeat lost from Floor 12 aggregation path",
    occurredAt: "2026-06-05T10:15:00Z",
    scopePath: getScopePath(hierarchyExampleIds.FLOOR_12_ID),
    resourceId: hierarchyExampleIds.FLOOR_12_ID,
    resourceLabel: "Floor 12",
  }),
  createAlert({
    id: "alert-device-sw-memory",
    severity: "warning",
    title: "High memory usage on Device SW-001",
    description: "Switch memory usage exceeded 80%",
    occurredAt: "2026-06-05T09:58:00Z",
    scopePath: getScopePath(hierarchyExampleIds.FLOOR_12_ID),
    resourceId: "device-sw-001",
    resourceLabel: "Switch SW-001",
  }),
  createAlert({
    id: "alert-venue-latency",
    severity: "warning",
    title: "High latency detected on Venue Lounge",
    description: "Wireless latency is above SLA threshold",
    occurredAt: "2026-06-05T09:30:00Z",
    scopePath: getScopePath(hierarchyExampleIds.VENUE_LOUNGE_ID),
    resourceId: hierarchyExampleIds.VENUE_LOUNGE_ID,
    resourceLabel: "Venue Lounge",
  }),
  createAlert({
    id: "alert-config-success",
    severity: "info",
    title: "Configuration rollout completed",
    description: "Floor 12 configuration rollout finished successfully",
    occurredAt: "2026-06-05T09:10:00Z",
    scopePath: getScopePath(hierarchyExampleIds.FLOOR_12_ID),
    resourceId: "config-core-floor12",
    resourceLabel: "Floor 12 Core Network",
  }),
];
