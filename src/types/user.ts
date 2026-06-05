import type { ID, ISODateTime } from "@/types/common";
import type { ScopePathItem } from "@/types/hierarchy";
import type { UserRole } from "@/types/rbac";

export type UserStatus =
  | "active"
  | "invited"
  | "suspended"
  | "password_reset_required";

export interface UserScopeAssignment {
  id: ID;
  role: UserRole;
  profileId: ID | null;
  profileName: string | null;
  scopePath: ScopePathItem[];
  assignedAt: ISODateTime;
}

export interface UserSession {
  id: ID;
  createdAt: ISODateTime;
  lastActiveAt: ISODateTime;
  ipAddress: string;
  userAgent: string;
  current: boolean;
  revokedAt: ISODateTime | null;
}

export interface UserProfileSummary {
  profileId: ID | null;
  profileName: string | null;
  role: UserRole;
  assignmentCount: number;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  status: UserStatus;
  profile: UserProfileSummary;
  scopeAssignments: UserScopeAssignment[];
  lastLoginAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
