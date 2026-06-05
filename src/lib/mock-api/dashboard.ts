import {
  assertCanAccess,
  getRuntimeFlags,
  withMockApi,
} from "@/lib/mock-api/client";
import { getCurrentSubscription } from "@/lib/mock-api/billing";
import { mockRecentAlerts } from "@/lib/mock-data/alerts";
import { mockDevices } from "@/lib/mock-data/devices";
import { filterByScope } from "@/lib/mock-api/client";
import { findNodeById, getDescendants } from "@/lib/mock-data/hierarchy";
import { can } from "@/lib/rbac/can";
import type { DashboardSummary } from "@/types/dashboard";
import type { User } from "@/types/user";

function getScopedCountByType(scopeId: string, type: "site" | "building" | "floor" | "venue") {
  const currentNode = findNodeById(scopeId);

  if (!currentNode) {
    return 0;
  }

  const descendants = getDescendants(scopeId);
  const currentNodeCount = currentNode.type === type ? 1 : 0;

  return (
    currentNodeCount + descendants.filter((node) => node.type === type).length
  );
}

export async function getDashboardSummary(
  scopeId: string,
  user: User,
): Promise<DashboardSummary> {
  return withMockApi(async () => {
    assertCanAccess(user, "view", "dashboard", scopeId);

    const scopeNode = findNodeById(scopeId);
    const scopedDevices = filterByScope(
      mockDevices,
      (device) => device.assignment?.path ?? [],
      scopeId,
      user,
    );
    const scopedAlerts = filterByScope(
      mockRecentAlerts,
      (alert) => alert.scopePath,
      scopeId,
      user,
    );

    const health = {
      totalDevices: scopedDevices.length,
      online: scopedDevices.filter((device) => device.status === "online").length,
      warning: scopedDevices.filter((device) => device.status === "warning").length,
      offline: scopedDevices.filter((device) => device.status === "offline").length,
      unknown: scopedDevices.filter((device) => device.status === "unknown").length,
    };

    const { forcePartialData } = getRuntimeFlags();
    const billingDecision = can(user, "view", "billing", {
      nodeId: scopeId,
      nodeType: scopeNode?.type ?? "venue",
      nodeName: scopeNode?.name ?? "Selected Scope",
      path: scopeNode?.path ?? [],
    });

    const currentSubscription = billingDecision.allowed
      ? await getCurrentSubscription(scopeId, user)
      : null;

    return {
      scopePath: scopeNode?.path ?? [],
      kpis: [
        {
          key: "sites",
          label: "Sites",
          value: getScopedCountByType(scopeId, "site"),
          delta: 0,
          deltaLabel: "0 this week",
          severity: "info",
        },
        {
          key: "buildings",
          label: "Buildings",
          value: getScopedCountByType(scopeId, "building"),
          delta: 0,
          deltaLabel: "0 this week",
          severity: "info",
        },
        {
          key: "floors",
          label: "Floors",
          value: getScopedCountByType(scopeId, "floor"),
          delta: 1,
          deltaLabel: "1 this week",
          severity: "success",
        },
        {
          key: "venues",
          label: "Venues",
          value: getScopedCountByType(scopeId, "venue"),
          delta: 1,
          deltaLabel: "1 this week",
          severity: "info",
        },
        {
          key: "devices",
          label: "Devices",
          value: scopedDevices.length,
          delta: 2,
          deltaLabel: "2 this week",
          severity: health.offline > 0 ? "warning" : "success",
        },
        {
          key: "alerts",
          label: "Alerts",
          value: scopedAlerts.length,
          delta: scopedAlerts.filter((alert) => alert.severity === "critical").length,
          deltaLabel: `${scopedAlerts.filter((alert) => alert.severity === "critical").length} critical`,
          severity: scopedAlerts.length > 0 ? "warning" : "success",
        },
      ],
      health,
      recentAlerts: forcePartialData ? scopedAlerts.slice(0, 2) : scopedAlerts,
      quickActions: [
        { key: "add_site", label: "Add Site" },
        { key: "add_device", label: "Add Device" },
        { key: "create_user", label: "Create User" },
        { key: "view_topology", label: "View Topology" },
      ],
      billingSummary: billingDecision.allowed && currentSubscription
        ? {
            currentPlanName: currentSubscription.planName,
            currentPlanType: currentSubscription.planType,
            subscriptionStatus: currentSubscription.status,
          }
        : undefined,
    };
  });
}
