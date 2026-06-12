import type { ID } from "@/types/common";
import type { HierarchyNodeType } from "@/types/hierarchy";

export type UserRole =
  | "root"
  | "admin"
  | "csr"
  | "installer"
  | "noc"
  | "accounting"
  | "system";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "assign"
  | "move"
  | "execute"
  | "approve"
  | "diagnose";

export type ModuleKey =
  | "dashboard"
  | "customers"
  | "hierarchy"
  | "devices"
  | "configurations"
  | "billing"
  | "users"
  | "administration";

export type RbacMode = "hidden" | "read_only" | "interactive";

export interface RbacDecision {
  allowed: boolean;
  mode: RbacMode;
  reason?: string;
}

export interface PermissionRule {
  id: ID;
  module: ModuleKey;
  actions: PermissionAction[];
  effect: "allow" | "deny";
  scopeNodeTypes?: HierarchyNodeType[];
}

export interface RoleProfile {
  id: ID;
  name: string;
  role: UserRole;
  description?: string;
  rules: PermissionRule[];
}
