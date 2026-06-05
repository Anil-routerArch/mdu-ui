import {
  assertCanAccess,
  createMockApiError,
  filterByScope,
  withMockApi,
} from "@/lib/mock-api/client";
import { mockUsers } from "@/lib/mock-data/users";
import type { UserRole } from "@/types/rbac";
import type { User, UserSession } from "@/types/user";

const mockSessionsByUserId: Record<string, UserSession[]> = {
  "user-operator-admin": [
    {
      id: "session-operator-admin-1",
      createdAt: "2026-06-05T08:00:00Z",
      lastActiveAt: "2026-06-05T10:20:00Z",
      ipAddress: "10.0.0.20",
      userAgent: "Chrome on macOS",
      current: true,
      revokedAt: null,
    },
  ],
  "user-customer-admin": [
    {
      id: "session-customer-admin-1",
      createdAt: "2026-06-05T07:30:00Z",
      lastActiveAt: "2026-06-05T10:05:00Z",
      ipAddress: "10.0.0.21",
      userAgent: "Edge on Windows",
      current: true,
      revokedAt: null,
    },
  ],
};

const assignableRolesByRole: Record<UserRole, UserRole[]> = {
  root_operator: [
    "root_operator",
    "operator_admin",
    "customer_admin",
    "noc_support",
    "installer",
    "billing_admin",
    "read_only",
  ],
  operator_admin: [
    "customer_admin",
    "noc_support",
    "installer",
    "billing_admin",
    "read_only",
  ],
  customer_admin: ["noc_support", "installer", "read_only"],
  noc_support: [],
  installer: [],
  billing_admin: ["read_only"],
  read_only: [],
};

export async function getUsers(scopeId: string, user: User): Promise<User[]> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "users", scopeId);
    return filterByScope(
      mockUsers,
      (candidate) => candidate.scopeAssignments[0]?.scopePath ?? [],
      scopeId,
      user,
    );
  });
}

export async function getUserById(
  userId: string,
  currentUser: User,
): Promise<User> {
  return withMockApi(() => {
    const user = mockUsers.find((item) => item.id === userId);

    if (!user) {
      throw createMockApiError("NOT_FOUND", "User not found.", { status: 404 });
    }

    assertCanAccess(
      currentUser,
      "view",
      "users",
      user.scopeAssignments[0]?.scopePath[0]?.id ?? null,
    );

    if (
      filterByScope(
        [user],
        (candidate) => candidate.scopeAssignments[0]?.scopePath ?? [],
        null,
        currentUser,
      ).length === 0
    ) {
      throw createMockApiError("NO_PERMISSION", "User is outside allowed scope.", {
        status: 403,
      });
    }

    return user;
  });
}

export async function getAssignableRoles(currentUser: User): Promise<UserRole[]> {
  return withMockApi(() => assignableRolesByRole[currentUser.profile.role] ?? []);
}

export async function getUserSessions(
  userId: string,
  currentUser: User,
): Promise<UserSession[]> {
  return withMockApi(async () => {
    await getUserById(userId, currentUser);
    return mockSessionsByUserId[userId] ?? [];
  });
}
