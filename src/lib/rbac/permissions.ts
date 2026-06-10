import type { ModuleKey, PermissionAction, RoleProfile, UserRole } from "@/types/rbac";

type RoleModuleAccess = {
  visible: boolean;
  readOnly?: boolean;
  actions: PermissionAction[];
};

type RolePermissionConfig = {
  allowedScopeRootTypes: Array<
    | "operator"
    | "customer"
    | "sub_operator"
    | "site"
    | "building"
    | "tower"
    | "floor"
    | "venue"
  >;
  modules: Record<ModuleKey, RoleModuleAccess>;
};

function createModuleAccess(
  visible: boolean,
  actions: PermissionAction[],
  readOnly = false,
): RoleModuleAccess {
  return {
    visible,
    readOnly,
    actions,
  };
}

const viewOnlyActions: PermissionAction[] = ["view"];
const operationalActions: PermissionAction[] = ["view", "diagnose", "execute"];
const managementActions: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "assign",
  "move",
  "execute",
  "approve",
  "diagnose",
];

export const rolePermissionMatrix: Record<UserRole, RolePermissionConfig> = {
  root_operator: {
    allowedScopeRootTypes: [
      "operator",
      "customer",
      "sub_operator",
      "site",
      "building",
      "tower",
      "floor",
      "venue",
    ],
    modules: {
      dashboard: createModuleAccess(true, managementActions),
      customers: createModuleAccess(true, managementActions),
      hierarchy: createModuleAccess(true, managementActions),
      devices: createModuleAccess(true, managementActions),
      configurations: createModuleAccess(true, managementActions),
      billing: createModuleAccess(true, managementActions),
      users: createModuleAccess(true, managementActions),
      administration: createModuleAccess(true, managementActions),
    },
  },
  operator_admin: {
    allowedScopeRootTypes: [
      "operator",
      "customer",
      "sub_operator",
      "site",
      "building",
      "tower",
      "floor",
      "venue",
    ],
    modules: {
      dashboard: createModuleAccess(true, ["view", "create", "edit", "diagnose"]),
      customers: createModuleAccess(true, ["view", "create", "edit", "assign"]),
      hierarchy: createModuleAccess(true, ["view", "create", "edit", "delete", "move"]),
      devices: createModuleAccess(true, ["view", "create", "edit", "assign", "move", "execute", "diagnose"]),
      configurations: createModuleAccess(true, ["view", "create", "edit", "assign"]),
      billing: createModuleAccess(true, ["view", "create", "edit", "assign", "approve"]),
      users: createModuleAccess(true, ["view", "create", "edit", "assign"]),
      administration: createModuleAccess(true, ["view"]),
    },
  },
  customer_admin: {
    allowedScopeRootTypes: [
      "customer",
      "sub_operator",
      "site",
      "building",
      "tower",
      "floor",
      "venue",
    ],
    modules: {
      dashboard: createModuleAccess(true, ["view"]),
      customers: createModuleAccess(true, ["view", "edit"]),
      hierarchy: createModuleAccess(true, ["view", "create", "edit", "move"]),
      devices: createModuleAccess(true, ["view", "create", "edit", "assign", "move", "execute", "diagnose"]),
      configurations: createModuleAccess(true, ["view", "create", "edit", "assign"]),
      billing: createModuleAccess(true, ["view", "approve"]),
      users: createModuleAccess(true, ["view", "create", "edit", "assign"]),
      administration: createModuleAccess(false, []),
    },
  },
  noc_support: {
    allowedScopeRootTypes: ["site", "building", "tower", "floor", "venue"],
    modules: {
      dashboard: createModuleAccess(true, ["view", "diagnose"]),
      customers: createModuleAccess(false, []),
      hierarchy: createModuleAccess(true, ["view", "diagnose"]),
      devices: createModuleAccess(true, operationalActions),
      configurations: createModuleAccess(true, ["view"]),
      billing: createModuleAccess(false, []),
      users: createModuleAccess(false, []),
      administration: createModuleAccess(false, []),
    },
  },
  installer: {
    allowedScopeRootTypes: ["site", "building", "tower", "floor", "venue"],
    modules: {
      dashboard: createModuleAccess(true, ["view"]),
      customers: createModuleAccess(false, []),
      hierarchy: createModuleAccess(true, ["view", "create", "edit", "move"]),
      devices: createModuleAccess(true, ["view", "create", "assign", "move", "execute", "diagnose"]),
      configurations: createModuleAccess(true, ["view", "assign"]),
      billing: createModuleAccess(false, []),
      users: createModuleAccess(false, []),
      administration: createModuleAccess(false, []),
    },
  },
  billing_admin: {
    allowedScopeRootTypes: ["operator", "customer", "sub_operator"],
    modules: {
      dashboard: createModuleAccess(true, ["view"]),
      customers: createModuleAccess(true, ["view"]),
      hierarchy: createModuleAccess(true, ["view"]),
      devices: createModuleAccess(false, []),
      configurations: createModuleAccess(false, []),
      billing: createModuleAccess(true, ["view", "create", "edit", "assign", "approve"]),
      users: createModuleAccess(false, []),
      administration: createModuleAccess(false, []),
    },
  },
  read_only: {
    allowedScopeRootTypes: [
      "customer",
      "sub_operator",
      "site",
      "building",
      "tower",
      "floor",
      "venue",
    ],
    modules: {
      dashboard: createModuleAccess(true, viewOnlyActions, true),
      customers: createModuleAccess(true, viewOnlyActions, true),
      hierarchy: createModuleAccess(true, viewOnlyActions, true),
      devices: createModuleAccess(true, viewOnlyActions, true),
      configurations: createModuleAccess(true, viewOnlyActions, true),
      billing: createModuleAccess(true, viewOnlyActions, true),
      users: createModuleAccess(true, viewOnlyActions, true),
      administration: createModuleAccess(false, []),
    },
  },
};

export const roleProfiles: Record<UserRole, RoleProfile> = {
  root_operator: {
    id: "profile-root-operator",
    name: "Root Operator",
    role: "root_operator",
    description: "Broad platform access across the full hierarchy.",
    rules: [
      {
        id: "rule-root-all",
        module: "administration",
        actions: managementActions,
        effect: "allow",
      },
    ],
  },
  operator_admin: {
    id: "profile-operator-admin",
    name: "Operator Admin",
    role: "operator_admin",
    description: "Manages permitted operator subtree, customers, devices, and users.",
    rules: [
      {
        id: "rule-operator-customers",
        module: "customers",
        actions: ["view", "create", "edit", "assign"],
        effect: "allow",
      },
    ],
  },
  customer_admin: {
    id: "profile-customer-admin",
    name: "Customer Admin",
    role: "customer_admin",
    description: "Manages a customer-owned subtree including users, devices, and billing selection.",
    rules: [
      {
        id: "rule-customer-billing-view",
        module: "billing",
        actions: ["view", "approve"],
        effect: "allow",
      },
    ],
  },
  noc_support: {
    id: "profile-noc-support",
    name: "NOC Support",
    role: "noc_support",
    description: "Operational monitoring and diagnostics without billing or admin privileges.",
    rules: [
      {
        id: "rule-noc-devices",
        module: "devices",
        actions: operationalActions,
        effect: "allow",
      },
    ],
  },
  installer: {
    id: "profile-installer",
    name: "Installer",
    role: "installer",
    description: "Deployment and assignment focused access within permitted deployment scope.",
    rules: [
      {
        id: "rule-installer-devices",
        module: "devices",
        actions: ["view", "create", "assign", "move", "execute", "diagnose"],
        effect: "allow",
      },
    ],
  },
  billing_admin: {
    id: "profile-billing-admin",
    name: "Billing Admin",
    role: "billing_admin",
    description: "Billing plans and subscription visibility without full admin access.",
    rules: [
      {
        id: "rule-billing-plans",
        module: "billing",
        actions: ["view", "create", "edit", "assign", "approve"],
        effect: "allow",
      },
    ],
  },
  read_only: {
    id: "profile-read-only",
    name: "Read Only",
    role: "read_only",
    description: "View-only access within an assigned subtree.",
    rules: [
      {
        id: "rule-readonly-dashboard",
        module: "dashboard",
        actions: ["view"],
        effect: "allow",
      },
    ],
  },
};
