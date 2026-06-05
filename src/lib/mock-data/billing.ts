import { getScopePath, hierarchyExampleIds } from "@/lib/mock-data/hierarchy";
import type { BillingConflict, BillingPlan, Subscription } from "@/types/billing";

const now = "2026-06-05T10:24:00Z";

function createPlan(plan: BillingPlan): BillingPlan {
  return plan;
}

function createSubscription(subscription: Subscription): Subscription {
  return subscription;
}

function createConflict(conflict: BillingConflict): BillingConflict {
  return conflict;
}

export const mockBillingPlans: BillingPlan[] = [
  createPlan({
    id: "plan-fixed-250",
    name: "Enterprise Fixed 250",
    type: "fixed_device",
    status: "active",
    description: "Fixed device allowance for mid-size deployments",
    billingCycle: "monthly",
    price: 899,
    currency: "USD",
    deviceLimit: 250,
    pricePerConnection: null,
    offeredByScope: getScopePath(hierarchyExampleIds.ROOT_OPERATOR_ID),
    createdAt: now,
    updatedAt: now,
  }),
  createPlan({
    id: "plan-conn-standard",
    name: "Connection Standard",
    type: "connection_based",
    status: "active",
    description: "Pay per connected device",
    billingCycle: "monthly",
    price: 199,
    currency: "USD",
    deviceLimit: null,
    pricePerConnection: 2.5,
    offeredByScope: getScopePath(hierarchyExampleIds.ROOT_OPERATOR_ID),
    createdAt: now,
    updatedAt: now,
  }),
  createPlan({
    id: "plan-fixed-100",
    name: "Starter Fixed 100",
    type: "fixed_device",
    status: "inactive",
    description: "Legacy starter plan",
    billingCycle: "monthly",
    price: 399,
    currency: "USD",
    deviceLimit: 100,
    pricePerConnection: null,
    offeredByScope: getScopePath(hierarchyExampleIds.ROOT_OPERATOR_ID),
    createdAt: now,
    updatedAt: now,
  }),
];

export const mockSubscriptions: Subscription[] = [
  createSubscription({
    id: "sub-customer-b",
    customerId: hierarchyExampleIds.CUSTOMER_B_ID,
    planId: "plan-fixed-250",
    planName: "Enterprise Fixed 250",
    planType: "fixed_device",
    status: "active",
    scopePath: getScopePath(hierarchyExampleIds.CUSTOMER_B_ID),
    startsAt: "2026-05-01T00:00:00Z",
    renewsAt: "2026-07-01T00:00:00Z",
    expiresAt: null,
    usage: {
      deviceCountUsed: 4,
      deviceLimit: 250,
      connectedDeviceCount: null,
      billableConnectionCount: null,
    },
  }),
  createSubscription({
    id: "sub-subop-east",
    customerId: hierarchyExampleIds.SUB_OPERATOR_EAST_ID,
    planId: "plan-fixed-250",
    planName: "Enterprise Fixed 250",
    planType: "fixed_device",
    status: "active",
    scopePath: getScopePath(hierarchyExampleIds.SUB_OPERATOR_EAST_ID),
    startsAt: "2026-05-15T00:00:00Z",
    renewsAt: "2026-07-15T00:00:00Z",
    expiresAt: null,
    usage: {
      deviceCountUsed: 4,
      deviceLimit: 250,
      connectedDeviceCount: null,
      billableConnectionCount: null,
    },
  }),
];

export const mockBillingConflicts: BillingConflict[] = [
  createConflict({
    code: "single_active_subscription_conflict",
    message: "An active subscription already exists for this customer scope.",
    existingSubscriptionId: "sub-customer-b",
    attemptedPlanId: "plan-conn-standard",
  }),
];
