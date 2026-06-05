import type { ID, ISODateTime } from "@/types/common";
import type { ScopePathItem } from "@/types/hierarchy";

export type BillingPlanType = "fixed_device" | "connection_based";

export type BillingPlanStatus = "draft" | "active" | "inactive" | "archived";

export interface BillingPlan {
  id: ID;
  name: string;
  type: BillingPlanType;
  status: BillingPlanStatus;
  description?: string;
  billingCycle: "monthly" | "quarterly" | "annual";
  price: number;
  currency: string;
  deviceLimit: number | null;
  pricePerConnection: number | null;
  offeredByScope: ScopePathItem[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "suspended"
  | "expired"
  | "cancelled";

export interface BillingUsage {
  deviceCountUsed: number | null;
  deviceLimit: number | null;
  connectedDeviceCount: number | null;
  billableConnectionCount: number | null;
}

export interface Subscription {
  id: ID;
  customerId: ID;
  planId: ID;
  planName: string;
  planType: BillingPlanType;
  status: SubscriptionStatus;
  scopePath: ScopePathItem[];
  startsAt: ISODateTime;
  renewsAt: ISODateTime | null;
  expiresAt: ISODateTime | null;
  usage: BillingUsage;
}

export interface BillingConflict {
  code:
    | "single_active_subscription_conflict"
    | "inactive_plan"
    | "plan_not_eligible";
  message: string;
  existingSubscriptionId?: ID;
  attemptedPlanId?: ID;
}
