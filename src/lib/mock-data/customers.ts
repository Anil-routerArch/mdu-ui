import { getScopePath, hierarchyExampleIds } from "@/lib/mock-data/hierarchy";
import type { Customer } from "@/types/customer";

const now = "2026-06-05T10:24:00Z";

function createCustomer(customer: Customer): Customer {
  return customer;
}

export const mockCustomers: Customer[] = [
  createCustomer({
    id: hierarchyExampleIds.CUSTOMER_B_ID,
    name: "Customer B",
    type: "customer",
    status: "active",
    parentId: hierarchyExampleIds.ROOT_OPERATOR_ID,
    path: getScopePath(hierarchyExampleIds.CUSTOMER_B_ID),
    firstAdminUserId: "user-customer-admin",
    summary: {
      siteCount: 1,
      venueCount: 3,
      deviceCount: 4,
      userCount: 2,
    },
    billing: {
      currentPlanName: "Enterprise Fixed 250",
      currentPlanType: "fixed_device",
      subscriptionStatus: "active",
      deviceCountUsed: 4,
      deviceLimit: 250,
    },
    createdAt: now,
    updatedAt: now,
  }),
  createCustomer({
    id: hierarchyExampleIds.SUB_OPERATOR_EAST_ID,
    name: "Sub-Operator East",
    type: "sub_operator",
    status: "active",
    parentId: hierarchyExampleIds.CUSTOMER_B_ID,
    path: getScopePath(hierarchyExampleIds.SUB_OPERATOR_EAST_ID),
    firstAdminUserId: "user-customer-admin",
    summary: {
      siteCount: 1,
      venueCount: 3,
      deviceCount: 4,
      userCount: 1,
    },
    billing: {
      currentPlanName: "Enterprise Fixed 250",
      currentPlanType: "fixed_device",
      subscriptionStatus: "active",
      deviceCountUsed: 4,
      deviceLimit: 250,
    },
    createdAt: now,
    updatedAt: now,
  }),
  createCustomer({
    id: hierarchyExampleIds.CUSTOMER_DIRECT_ID,
    name: "Customer Direct C",
    type: "customer",
    status: "inactive",
    parentId: hierarchyExampleIds.ROOT_OPERATOR_ID,
    path: getScopePath(hierarchyExampleIds.CUSTOMER_DIRECT_ID),
    firstAdminUserId: "user-read-only",
    summary: {
      siteCount: 1,
      venueCount: 1,
      deviceCount: 1,
      userCount: 1,
    },
    billing: {
      currentPlanName: null,
      currentPlanType: null,
      subscriptionStatus: null,
      deviceCountUsed: null,
      deviceLimit: null,
    },
    createdAt: now,
    updatedAt: now,
  }),
];
