import { hierarchyExampleIds, getScopePath } from "@/lib/mock-data/hierarchy";
import type { User } from "@/types/user";

const now = "2026-06-05T10:24:00Z";

function createUser(user: User): User {
  return user;
}

export const mockUsers: User[] = [
  createUser({
    id: "user-root-operator",
    name: "Rita Root",
    email: "rita.root@mdu.test",
    status: "active",
    profile: {
      profileId: "profile-root-operator",
      profileName: "Root Operator",
      role: "root_operator",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-root-operator",
        role: "root_operator",
        profileId: "profile-root-operator",
        profileName: "Root Operator",
        scopePath: getScopePath(hierarchyExampleIds.ROOT_OPERATOR_ID),
        assignedAt: now,
      },
    ],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  }),
  createUser({
    id: "user-operator-admin",
    name: "Olivia Operator",
    email: "olivia.operator@mdu.test",
    status: "active",
    profile: {
      profileId: "profile-operator-admin",
      profileName: "Operator Admin",
      role: "operator_admin",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-operator-admin",
        role: "operator_admin",
        profileId: "profile-operator-admin",
        profileName: "Operator Admin",
        scopePath: getScopePath(hierarchyExampleIds.ROOT_OPERATOR_ID),
        assignedAt: now,
      },
    ],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  }),
  createUser({
    id: "user-customer-admin",
    name: "Carla Customer",
    email: "carla.customer@mdu.test",
    status: "active",
    profile: {
      profileId: "profile-customer-admin",
      profileName: "Customer Admin",
      role: "customer_admin",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-customer-admin",
        role: "customer_admin",
        profileId: "profile-customer-admin",
        profileName: "Customer Admin",
        scopePath: getScopePath(hierarchyExampleIds.CUSTOMER_B_ID),
        assignedAt: now,
      },
    ],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  }),
  createUser({
    id: "user-noc-support",
    name: "Nina NOC",
    email: "nina.noc@mdu.test",
    status: "active",
    profile: {
      profileId: "profile-noc-support",
      profileName: "NOC Support",
      role: "noc_support",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-noc-support",
        role: "noc_support",
        profileId: "profile-noc-support",
        profileName: "NOC Support",
        scopePath: getScopePath(hierarchyExampleIds.SUNRISE_TOWERS_ID),
        assignedAt: now,
      },
    ],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  }),
  createUser({
    id: "user-installer",
    name: "Ian Installer",
    email: "ian.installer@mdu.test",
    status: "active",
    profile: {
      profileId: "profile-installer",
      profileName: "Installer",
      role: "installer",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-installer",
        role: "installer",
        profileId: "profile-installer",
        profileName: "Installer",
        scopePath: getScopePath(hierarchyExampleIds.FLOOR_12_ID),
        assignedAt: now,
      },
    ],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  }),
  createUser({
    id: "user-billing-admin",
    name: "Bianca Billing",
    email: "bianca.billing@mdu.test",
    status: "active",
    profile: {
      profileId: "profile-billing-admin",
      profileName: "Billing Admin",
      role: "billing_admin",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-billing-admin",
        role: "billing_admin",
        profileId: "profile-billing-admin",
        profileName: "Billing Admin",
        scopePath: getScopePath(hierarchyExampleIds.ROOT_OPERATOR_ID),
        assignedAt: now,
      },
    ],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  }),
  createUser({
    id: "user-read-only",
    name: "Ronan Readonly",
    email: "ronan.readonly@mdu.test",
    status: "active",
    profile: {
      profileId: "profile-read-only",
      profileName: "Read Only",
      role: "read_only",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-read-only",
        role: "read_only",
        profileId: "profile-read-only",
        profileName: "Read Only",
        scopePath: getScopePath(hierarchyExampleIds.CUSTOMER_DIRECT_ID),
        assignedAt: now,
      },
    ],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  }),
];

export const mockUsersById = Object.fromEntries(
  mockUsers.map((user) => [user.id, user]),
) as Record<string, User>;
