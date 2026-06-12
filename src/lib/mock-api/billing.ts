import {
  assertCanAccess,
  createMockApiError,
  filterByScope,
  maybeReturnEmpty,
  withMockApi,
} from "@/lib/mock-api/client";
import {
  mockBillingConflicts,
  mockBillingPlans,
  mockSubscriptions,
} from "@/lib/mock-data/billing";
import type { BillingConflict, BillingPlan, Subscription } from "@/types/billing";
import type { User } from "@/types/user";

export interface BillingOverview {
  plans: BillingPlan[];
  currentSubscription: Subscription | null;
  availablePlans: BillingPlan[];
}

function isCustomerScopedRole(user: User): boolean {
  const role = user.profile.role;
  return role === "csr" || (role === "admin" && user.scopeAssignments[0]?.scopePath.at(-1)?.type !== "operator");
}

function getVisibleSubscriptions(scopeId: string | null, user: User): Subscription[] {
  return filterByScope(
    mockSubscriptions,
    (subscription) => subscription.scopePath,
    scopeId,
    user,
  );
}

export async function getBillingOverview(
  scopeId: string,
  user: User,
): Promise<BillingOverview> {
  return withMockApi(async () => ({
    plans: await getBillingPlans(scopeId, user),
    currentSubscription: await getCurrentSubscription(scopeId, user),
    availablePlans: await getAvailablePlans(scopeId, user),
  }));
}

export async function getBillingPlans(
  scopeId: string,
  user: User,
): Promise<BillingPlan[]> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "billing", scopeId);

    const role = user.profile.role;
    if (role === "accounting" || role === "admin" || role === "root" || role === "system") {
      return maybeReturnEmpty(
        filterByScope(mockBillingPlans, (plan) => plan.offeredByScope, null, user),
        [],
      );
    }

    return maybeReturnEmpty([], []);
  });
}

export async function getAvailablePlans(
  scopeId: string,
  user: User,
): Promise<BillingPlan[]> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "billing", scopeId);

    if (!isCustomerScopedRole(user)) {
      return [];
    }

    return maybeReturnEmpty(
      mockBillingPlans.filter((plan) => plan.status === "active"),
      [],
    );
  });
}

export async function getCurrentSubscription(
  scopeId: string,
  user: User,
): Promise<Subscription | null> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "billing", scopeId);
    const subscriptions = getVisibleSubscriptions(scopeId, user);
    return maybeReturnEmpty(subscriptions[0] ?? null, null);
  });
}

export async function getSubscriptionVisibility(
  scopeId: string,
  user: User,
): Promise<Subscription[]> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "billing", scopeId);

    const role = user.profile.role;
    if (role === "accounting" || role === "admin" || role === "root" || role === "system") {
      return maybeReturnEmpty(getVisibleSubscriptions(scopeId, user), []);
    }

    return maybeReturnEmpty(getVisibleSubscriptions(scopeId, user).slice(0, 1), []);
  });
}

export async function simulatePlanSelection(
  planId: string,
  scopeId: string,
  user: User,
): Promise<
  | { status: "selected"; plan: BillingPlan }
  | { status: "conflict"; conflict: BillingConflict }
> {
  return withMockApi(async () => {
    assertCanAccess(user, "approve", "billing", scopeId);

    const plan = mockBillingPlans.find((item) => item.id === planId);

    if (!plan || plan.status !== "active") {
      throw createMockApiError("NOT_FOUND", "Billing plan not available.", {
        status: 404,
      });
    }

    const existingSubscription = await getCurrentSubscription(scopeId, user);

    if (existingSubscription?.status === "active") {
      return {
        status: "conflict",
        conflict:
          mockBillingConflicts[0] ??
          {
            code: "single_active_subscription_conflict",
            message: "An active subscription already exists.",
            existingSubscriptionId: existingSubscription.id,
            attemptedPlanId: planId,
          },
      };
    }

    return {
      status: "selected",
      plan,
    };
  });
}
