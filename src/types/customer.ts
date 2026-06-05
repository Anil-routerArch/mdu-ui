import type { ID, ISODateTime } from "@/types/common";
import type { BillingPlanType, SubscriptionStatus } from "@/types/billing";
import type { ScopePathItem } from "@/types/hierarchy";

export type CustomerStatus =
  | "active"
  | "suspended"
  | "provisioning"
  | "inactive";

export type CustomerType = "customer" | "sub_operator";

export interface CustomerBillingSummary {
  currentPlanName: string | null;
  currentPlanType: BillingPlanType | null;
  subscriptionStatus: SubscriptionStatus | null;
  deviceCountUsed: number | null;
  deviceLimit: number | null;
}

export interface CustomerSummary {
  siteCount: number;
  venueCount: number;
  deviceCount: number;
  userCount: number;
}

export interface Customer {
  id: ID;
  name: string;
  type: CustomerType;
  status: CustomerStatus;
  parentId: ID;
  path: ScopePathItem[];
  firstAdminUserId?: ID;
  summary: CustomerSummary;
  billing: CustomerBillingSummary;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
