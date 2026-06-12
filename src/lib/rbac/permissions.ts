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
  root: {
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
  system: {
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
  admin: {
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
  noc: {
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
  accounting: {
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
  csr: {
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
  root: {
    id: "profile-root",
    name: "Root",
    role: "root",
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
  system: {
    id: "profile-system",
    name: "System",
    role: "system",
    description: "Full system-level operations and configurations.",
    rules: [
      {
        id: "rule-system-all",
        module: "administration",
        actions: managementActions,
        effect: "allow",
      },
    ],
  },
  admin: {
    id: "profile-admin",
    name: "Admin",
    role: "admin",
    description: "Manages permitted operator/customer subtree, devices, and users.",
    rules: [
      {
        id: "rule-admin-customers",
        module: "customers",
        actions: ["view", "create", "edit", "assign"],
        effect: "allow",
      },
    ],
  },
  noc: {
    id: "profile-noc",
    name: "NOC",
    role: "noc",
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
  accounting: {
    id: "profile-accounting",
    name: "Accounting",
    role: "accounting",
    description: "Billing plans and subscription visibility without full admin access.",
    rules: [
      {
        id: "rule-accounting-plans",
        module: "billing",
        actions: ["view", "create", "edit", "assign", "approve"],
        effect: "allow",
      },
    ],
  },
  csr: {
    id: "profile-csr",
    name: "CSR",
    role: "csr",
    description: "View-only access within an assigned subtree.",
    rules: [
      {
        id: "rule-csr-dashboard",
        module: "dashboard",
        actions: ["view"],
        effect: "allow",
      },
    ],
  },
};
