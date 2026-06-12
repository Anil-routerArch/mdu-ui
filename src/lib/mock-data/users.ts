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
      profileId: "profile-root",
      profileName: "Root",
      role: "root",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-root",
        role: "root",
        profileId: "profile-root",
        profileName: "Root",
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
      profileId: "profile-admin-operator",
      profileName: "Admin",
      role: "admin",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-admin-operator",
        role: "admin",
        profileId: "profile-admin-operator",
        profileName: "Admin",
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
      profileId: "profile-admin-customer",
      profileName: "Admin",
      role: "admin",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-admin-customer",
        role: "admin",
        profileId: "profile-admin-customer",
        profileName: "Admin",
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
      profileId: "profile-noc",
      profileName: "NOC",
      role: "noc",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-noc",
        role: "noc",
        profileId: "profile-noc",
        profileName: "NOC",
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
      profileId: "profile-accounting",
      profileName: "Accounting",
      role: "accounting",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-accounting",
        role: "accounting",
        profileId: "profile-accounting",
        profileName: "Accounting",
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
      profileId: "profile-csr",
      profileName: "CSR",
      role: "csr",
      assignmentCount: 1,
    },
    scopeAssignments: [
      {
        id: "assignment-csr",
        role: "csr",
        profileId: "profile-csr",
        profileName: "CSR",
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
