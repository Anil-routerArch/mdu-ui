import {
  assertCanAccess,
  filterByScope,
} from "@/lib/mock-api/client";
import { getScopePath, findNodeById } from "@/lib/mock-data/hierarchy";
import type { UserRole } from "@/types/rbac";
import type { User, UserSession } from "@/types/user";

const OWSEC_URL = process.env.NEXT_PUBLIC_OWSEC_URL || "https://openwifi3.routerarchitects.com:16001";

function getHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("mdu_access_token") ||
    sessionStorage.getItem("mdu_access_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

function getRoleDisplayName(role: UserRole): string {
  const r = role.toLowerCase();
  if (r === "noc") return "NOC";
  if (r === "csr") return "CSR";
  return r.charAt(0).toUpperCase() + r.slice(1);
}

function mapBackendRole(backendRole: string): UserRole {
  const role = backendRole.toLowerCase();
  if (role === "root") return "root";
  if (role === "admin") return "admin";
  if (role === "noc") return "noc";
  if (role === "installer") return "installer";
  if (role === "accounting") return "accounting";
  if (role === "csr") return "csr";
  if (role === "system") return "system";
  return "csr";
}

function mapClientRoleToBackend(clientRole: UserRole): string {
  return clientRole;
}

function getFallbackScopeForRole(role: UserRole): string {
  if (role === "noc") {
    return "site-sunrise-towers";
  }
  if (role === "installer") {
    return "floor-12";
  }
  return "op-operator-a";
}

function parseSafeDate(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  try {
    // If it is already a string that looks like an ISO date, try parsing it directly
    if (typeof timestamp === "string" && timestamp.includes("-") && timestamp.includes("T")) {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        const year = d.getUTCFullYear();
        if (year >= 2000 && year <= 2100) {
          return d.toISOString();
        }
      }
    }

    let ts = Number(timestamp);
    if (isNaN(ts) || ts <= 0) {
      return new Date().toISOString();
    }
    
    // Convert seconds-based epoch to milliseconds
    if (ts < 5000000000) {
      ts = ts * 1000;
    }
    
    // Prevent RangeError by checking if timestamp exceeds maximum safe JS date limit
    if (ts > 8640000000000000) {
      return new Date().toISOString(); // fallback to current time for uninitialized memory values
    }
    
    const d = new Date(ts);
    if (isNaN(d.getTime())) {
      return new Date().toISOString();
    }

    // Filter out uninitialized/garbage memory dates (e.g. Year 6291 or 4.3 million)
    const year = d.getUTCFullYear();
    if (year < 2000 || year > 2100) {
      return new Date().toISOString();
    }

    return d.toISOString();
  } catch (err) {
    return new Date().toISOString();
  }
}

function mapBackendUserToClient(uUser: any): User {
  const mappedRole = mapBackendRole(uUser.userRole || "");
  let scopeId = uUser.description;
  if (!scopeId || !findNodeById(scopeId)) {
    scopeId = getFallbackScopeForRole(mappedRole);
  }
  const scopePath = getScopePath(scopeId);

  return {
    id: uUser.id,
    name: uUser.name || uUser.email || "Unnamed User",
    email: uUser.email,
    status: uUser.suspended ? "suspended" : (uUser.waitingForEmailCheck ? "invited" : "active"),
    description: uUser.description || "",
    profile: {
      profileId: `profile-mapped-${mappedRole}`,
      profileName: getRoleDisplayName(mappedRole),
      role: mappedRole,
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: `assignment-mapped-${mappedRole}`,
        role: mappedRole,
        profileId: `profile-mapped-${mappedRole}`,
        profileName: getRoleDisplayName(mappedRole),
        scopePath: scopePath,
        assignedAt: parseSafeDate(uUser.creationDate),
      }
    ],
    lastLoginAt: uUser.lastLogin ? parseSafeDate(uUser.lastLogin) : null,
    createdAt: parseSafeDate(uUser.creationDate),
    updatedAt: parseSafeDate(uUser.modified),
  };
}

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
};

const assignableRolesByRole: Record<UserRole, UserRole[]> = {
  root: ["root", "admin", "csr", "installer", "noc", "accounting", "system"],
  system: ["root", "admin", "csr", "installer", "noc", "accounting", "system"],
  admin: ["admin", "csr", "installer", "noc", "accounting"],
  noc: [],
  installer: [],
  accounting: ["csr"],
  csr: [],
};

export async function getUsers(scopeId: string, user: User): Promise<User[]> {
  assertCanAccess(user, "view", "users", scopeId);

  const res = await fetch(`${OWSEC_URL}/api/v1/users`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users from server.");
  }

  const data = await res.json();
  const uUsers = data.users || [];
  const clientUsers = uUsers.map(mapBackendUserToClient);

  return filterByScope(
    clientUsers,
    (candidate) => candidate.scopeAssignments[0]?.scopePath ?? [],
    scopeId,
    user,
  );
}

export async function getUserById(
  userId: string,
  currentUser: User,
): Promise<User> {
  const res = await fetch(`${OWSEC_URL}/api/v1/user/${userId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user details from server.");
  }

  const uUser = await res.json();
  const user = mapBackendUserToClient(uUser);

  assertCanAccess(
    currentUser,
    "view",
    "users",
    user.scopeAssignments[0]?.scopePath[user.scopeAssignments[0]?.scopePath.length - 1]?.id ?? null,
  );

  return user;
}

export async function getAssignableRoles(currentUser: User): Promise<UserRole[]> {
  return assignableRolesByRole[currentUser.profile.role] ?? [];
}

export async function getUserSessions(
  userId: string,
  currentUser: User,
): Promise<UserSession[]> {
  // Keep local mock user sessions for display in tabs
  await getUserById(userId, currentUser);
  return mockSessionsByUserId[userId] ?? [
    {
      id: `session-mock-${userId}-1`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      ipAddress: "127.0.0.1",
      userAgent: "Browser Client",
      current: true,
      revokedAt: null,
    }
  ];
}

export async function createUser(
  payload: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    changePassword?: boolean;
    emailValidation?: boolean;
    description?: string;
    note?: string;
  },
  currentUser: User,
): Promise<User> {
  const userScopeId = currentUser.scopeAssignments[0]?.scopePath.at(-1)?.id || "none";
  assertCanAccess(currentUser, "create", "users", userScopeId);

  const backendRole = mapClientRoleToBackend(payload.role);
  const emailVal = payload.emailValidation !== false; // default to true
  const changePass = payload.changePassword !== false; // default to true

  const queryParam = emailVal ? "?email_verification=true" : "";
  const res = await fetch(`${OWSEC_URL}/api/v1/user/0${queryParam}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      currentPassword: payload.password || "Iotina@123", // default initial password if not specified
      userRole: backendRole,
      emailValidation: emailVal,
      changePassword: changePass,
      ...(payload.description ? { description: payload.description } : {}),
      ...(payload.note ? { notes: [{ note: payload.note }] } : {}),
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to create user on server.");
  }

  const uUser = await res.json();
  return mapBackendUserToClient(uUser);
}

export async function updateUser(
  userId: string,
  payload: {
    name?: string;
    description?: string;
    role?: UserRole;
    suspended?: boolean;
    password?: string;
    notes?: { note: string }[];
  },
  currentUser: User,
): Promise<User> {
  const existing = await getUserById(userId, currentUser);
  const targetScopeId = existing.scopeAssignments[0]?.scopePath[existing.scopeAssignments[0]?.scopePath.length - 1]?.id;
  assertCanAccess(currentUser, "edit", "users", targetScopeId);

  const body: any = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.role !== undefined) body.userRole = mapClientRoleToBackend(payload.role);
  if (payload.suspended !== undefined) body.suspended = payload.suspended;
  if (payload.password !== undefined) body.currentPassword = payload.password;
  if (payload.notes !== undefined) body.notes = payload.notes;

  const res = await fetch(`${OWSEC_URL}/api/v1/user/${userId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to update user on server.");
  }

  const uUser = await res.json();
  return mapBackendUserToClient(uUser);
}

export async function deleteUser(
  userId: string,
  currentUser: User,
): Promise<boolean> {
  const existing = await getUserById(userId, currentUser);
  const targetScopeId = existing.scopeAssignments[0]?.scopePath[existing.scopeAssignments[0]?.scopePath.length - 1]?.id;
  assertCanAccess(currentUser, "edit", "users", targetScopeId);

  const res = await fetch(`${OWSEC_URL}/api/v1/user/${userId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to delete user on server.");
  }

  return true;
}

export async function triggerResetPassword(
  userId: string,
  currentUser: User,
): Promise<boolean> {
  const existing = await getUserById(userId, currentUser);
  const targetScopeId = existing.scopeAssignments[0]?.scopePath[existing.scopeAssignments[0]?.scopePath.length - 1]?.id;
  assertCanAccess(currentUser, "edit", "users", targetScopeId);

  const res = await fetch(`${OWSEC_URL}/api/v1/user/${userId}?forgotPassword=true`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to trigger password reset.");
  }

  return true;
}
