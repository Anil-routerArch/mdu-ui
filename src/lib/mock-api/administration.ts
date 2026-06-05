import {
  assertCanAccess,
  createMockApiError,
  withMockApi,
} from "@/lib/mock-api/client";
import { roleProfiles } from "@/lib/rbac/permissions";
import type { RoleProfile } from "@/types/rbac";
import type { User } from "@/types/user";

export interface AdminOverview {
  availableSections: string[];
  role: User["profile"]["role"];
}

export interface AuditLogEvent {
  id: string;
  actor: string;
  action: string;
  resource: string;
  scopeId: string;
  occurredAt: string;
  result: "success" | "failure";
}

const mockAuditLogs: AuditLogEvent[] = [
  {
    id: "audit-1",
    actor: "Olivia Operator",
    action: "create_customer",
    resource: "Customer B",
    scopeId: "op-operator-a",
    occurredAt: "2026-06-05T08:45:00Z",
    result: "success",
  },
  {
    id: "audit-2",
    actor: "Bianca Billing",
    action: "assign_plan",
    resource: "Enterprise Fixed 250",
    scopeId: "cust-customer-b",
    occurredAt: "2026-06-05T09:15:00Z",
    result: "success",
  },
];

function assertAdminAccess(user: User): void {
  assertCanAccess(user, "view", "administration", user.scopeAssignments[0]?.scopePath[0]?.id ?? null);
}

export async function getAdminOverview(user: User): Promise<AdminOverview> {
  return withMockApi(() => {
    assertAdminAccess(user);
    return {
      availableSections: ["roles_and_policies", "audit_logs", "operator_settings"],
      role: user.profile.role,
    };
  });
}

export async function getRolesAndPolicies(user: User): Promise<RoleProfile[]> {
  return withMockApi(() => {
    assertAdminAccess(user);
    return Object.values(roleProfiles);
  });
}

export async function getAuditLogs(
  scopeId: string,
  user: User,
): Promise<AuditLogEvent[]> {
  return withMockApi(() => {
    assertAdminAccess(user);
    return mockAuditLogs.filter((event) => event.scopeId === scopeId || scopeId === "op-operator-a");
  });
}

export async function getAuditEventById(
  eventId: string,
  user: User,
): Promise<AuditLogEvent> {
  return withMockApi(() => {
    assertAdminAccess(user);
    const event = mockAuditLogs.find((item) => item.id === eventId);

    if (!event) {
      throw createMockApiError("NOT_FOUND", "Audit event not found.", { status: 404 });
    }

    return event;
  });
}
