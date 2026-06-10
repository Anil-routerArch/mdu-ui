import { isNodeWithinSubtree } from "@/lib/mock-data/hierarchy";
import { rolePermissionMatrix } from "@/lib/rbac/permissions";
import type { SelectedScope, ScopePathItem } from "@/types/hierarchy";
import type {
  ModuleKey,
  PermissionAction,
  RbacDecision,
} from "@/types/rbac";
import type { User } from "@/types/user";

export type RbacResource =
  | ModuleKey
  | {
      module: ModuleKey;
      ownerScopePath?: ScopePathItem[];
    };

function normalizeResource(resource: RbacResource): {
  module: ModuleKey;
  ownerScopePath?: ScopePathItem[];
} {
  if (typeof resource === "string") {
    return { module: resource };
  }

  return resource;
}

function hasScopeAccess(user: User, selectedScope: SelectedScope | null): boolean {
  if (!selectedScope) {
    return true;
  }

  return user.scopeAssignments.some((assignment) => {
    const assignedScopeRoot = assignment.scopePath[assignment.scopePath.length - 1];

    if (!assignedScopeRoot) {
      return false;
    }

    return isNodeWithinSubtree(selectedScope.nodeId, assignedScopeRoot.id);
  });
}

function hasResourcePathAccess(
  user: User,
  ownerScopePath: ScopePathItem[] | undefined,
): boolean {
  if (!ownerScopePath?.length) {
    return true;
  }

  const targetNodeId = ownerScopePath[ownerScopePath.length - 1]?.id;

  if (!targetNodeId) {
    return true;
  }

  return user.scopeAssignments.some((assignment) => {
    const assignedScopeRoot = assignment.scopePath[assignment.scopePath.length - 1];

    if (!assignedScopeRoot) {
      return false;
    }

    return isNodeWithinSubtree(targetNodeId, assignedScopeRoot.id);
  });
}

export function can(
  user: User,
  action: PermissionAction,
  resource: RbacResource,
  scope: SelectedScope | null,
): RbacDecision {
  const role = user.profile.role;
  const config = rolePermissionMatrix[role];
  const normalizedResource = normalizeResource(resource);
  const moduleAccess = config.modules[normalizedResource.module];
  const hasAllowedAssignmentRoot = user.scopeAssignments.some((assignment) => {
    const assignedScopeRoot = assignment.scopePath[assignment.scopePath.length - 1];

    return assignedScopeRoot
      ? config.allowedScopeRootTypes.includes(assignedScopeRoot.type)
      : false;
  });

  if (!moduleAccess?.visible) {
    return {
      allowed: false,
      mode: "hidden",
      reason: "Module is not visible for this role.",
    };
  }

  if (!hasAllowedAssignmentRoot) {
    return {
      allowed: false,
      mode: "hidden",
      reason: "Assigned scope root is not valid for this role.",
    };
  }

  if (!hasScopeAccess(user, scope)) {
    return {
      allowed: false,
      mode: "hidden",
      reason: "Selected scope is outside the assigned subtree.",
    };
  }

  if (
    action === "create" &&
    normalizedResource.module === "customers" &&
    scope &&
    !["operator", "customer", "sub_operator"].includes(scope.nodeType)
  ) {
    return {
      allowed: false,
      mode: "hidden",
      reason: "Customers can only be created under operator, customer, or sub-operator scopes.",
    };
  }

  if (!hasResourcePathAccess(user, normalizedResource.ownerScopePath)) {
    return {
      allowed: false,
      mode: "hidden",
      reason: "Resource is outside the assigned subtree.",
    };
  }

  if (action === "view" && moduleAccess.actions.includes("view")) {
    return {
      allowed: true,
      mode: moduleAccess.readOnly ? "read_only" : "interactive",
    };
  }

  if (moduleAccess.readOnly) {
    return {
      allowed: false,
      mode: "read_only",
      reason: "Role is limited to read-only access.",
    };
  }

  if (!moduleAccess.actions.includes(action)) {
    return {
      allowed: false,
      mode: "hidden",
      reason: "Action is not permitted for this role.",
    };
  }

  return {
    allowed: true,
    mode: "interactive",
  };
}
