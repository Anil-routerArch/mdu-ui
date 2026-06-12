"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  getAvailablePlans,
  getBillingOverview,
  getBillingPlans,
  getCurrentSubscription,
  getSubscriptionVisibility,
  simulatePlanSelection,
} from "@/lib/mock-api/billing";
import { mockBillingConflicts } from "@/lib/mock-data/billing";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { CreateBillingPlanWizard } from "./create-billing-plan-wizard";
import { AvailablePlans } from "./available-plans";
import { BillingOverview } from "./billing-overview";
import { BillingPlanList } from "./billing-plan-list";
import { CurrentSubscriptionDetail } from "./current-subscription-detail";
import { SubscriptionVisibilityDashboard } from "./subscription-visibility-dashboard";

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

function isManagerRole(role: string | undefined) {
  return role === "admin" || role === "accounting" || role === "root" || role === "system";
}

export function BillingPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [createOpen, setCreateOpen] = useState(false);

  const isCustomerAdmin = useMemo(() => {
    if (!currentUser) return false;
    const role = currentUser.profile.role;
    return role === "admin" && currentUser.scopeAssignments[0]?.scopePath.at(-1)?.type !== "operator";
  }, [currentUser]);

  const isReadOnly = useMemo(() => {
    return currentUser?.profile.role === "csr";
  }, [currentUser]);

  const viewDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "billing", selectedScope);
  }, [currentUser, selectedScope]);

  const createDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "create", "billing", selectedScope);
  }, [currentUser, selectedScope]);

  const editDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "edit", "billing", selectedScope);
  }, [currentUser, selectedScope]);

  const assignDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "assign", "billing", selectedScope);
  }, [currentUser, selectedScope]);

  const approveDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "approve", "billing", selectedScope);
  }, [currentUser, selectedScope]);

  const overviewQuery = useQuery({
    queryKey: ["billing-overview", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getBillingOverview(selectedScope!.nodeId, currentUser!),
  });

  const plansQuery = useQuery({
    queryKey: ["billing-plans", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(
      currentUser && selectedScope && viewDecision?.allowed && isManagerRole(currentUser.profile.role),
    ),
    queryFn: () => getBillingPlans(selectedScope!.nodeId, currentUser!),
  });

  const availablePlansQuery = useQuery({
    queryKey: ["billing-available-plans", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(
      currentUser &&
        selectedScope &&
        viewDecision?.allowed &&
        (isCustomerAdmin || isReadOnly),
    ),
    queryFn: () => getAvailablePlans(selectedScope!.nodeId, currentUser!),
  });

  const currentSubscriptionQuery = useQuery({
    queryKey: ["billing-current-subscription", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getCurrentSubscription(selectedScope!.nodeId, currentUser!),
  });

  const subscriptionVisibilityQuery = useQuery({
    queryKey: ["billing-subscription-visibility", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(
      currentUser && selectedScope && viewDecision?.allowed && isManagerRole(currentUser.profile.role),
    ),
    queryFn: () => getSubscriptionVisibility(selectedScope!.nodeId, currentUser!),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!selectedScope) {
    return (
      <EmptyState
        title="No scope selected"
        description="Select a hierarchy scope to load billing data."
      />
    );
  }

  if (!viewDecision?.allowed) {
    return <NoPermissionState description="You cannot view billing in this scope." />;
  }

  const primaryError =
    overviewQuery.error ??
    plansQuery.error ??
    availablePlansQuery.error ??
    currentSubscriptionQuery.error ??
    subscriptionVisibilityQuery.error;

  if (
    overviewQuery.isLoading ||
    plansQuery.isLoading ||
    availablePlansQuery.isLoading ||
    currentSubscriptionQuery.isLoading ||
    subscriptionVisibilityQuery.isLoading
  ) {
    return <LoadingState title="Loading billing" variant="page" rows={6} />;
  }

  if (primaryError) {
    if (isMockApiError(primaryError) && primaryError.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void overviewQuery.refetch()} />;
    }

    if (isMockApiError(primaryError) && primaryError.code === "NO_PERMISSION") {
      return <NoPermissionState description="Billing data is not available in this scope." />;
    }

    return <ErrorState error={primaryError} onRetry={() => void overviewQuery.refetch()} />;
  }

  const overview = overviewQuery.data;
  const plans = plansQuery.data ?? [];
  const availablePlans = availablePlansQuery.data ?? [];
  const currentSubscription = currentSubscriptionQuery.data ?? null;
  const subscriptions = subscriptionVisibilityQuery.data ?? [];
  const canSelectPlan = Boolean(
    isCustomerAdmin && approveDecision?.allowed && !isReadOnly,
  );

  if (!overview) {
    return (
      <ErrorState
        title="Billing data unavailable"
        description="Billing overview did not return any data for this scope."
      />
    );
  }

  if (
    !plans.length &&
    !availablePlans.length &&
    !currentSubscription &&
    subscriptions.length === 0
  ) {
    return (
      <EmptyState
        title="No billing data"
        description="No billing plans, subscriptions, or available billing records are visible in this scope."
      />
    );
  }

  return (
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--mdu-text)]">Billing</h1>
          <p className="text-sm text-[var(--mdu-text-muted)]">
            Role-aware billing workflows for {selectedScope.path.map((item) => item.name).join(" / ")}
          </p>
        </div>
        {createDecision?.allowed && isManagerRole(currentUser.profile.role) ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create Billing Plan
          </Button>
        ) : null}
      </div>

      <div className="space-y-6">
        <BillingOverview
          selectedScope={selectedScope}
          plans={overview.plans}
          currentSubscription={overview.currentSubscription}
          subscriptions={subscriptions}
          conflicts={mockBillingConflicts}
        />

        {isManagerRole(currentUser.profile.role) ? (
          <>
            <BillingPlanList
              plans={plans}
              subscriptions={subscriptions}
              selectedScope={selectedScope}
              user={currentUser}
              canEdit={Boolean(editDecision?.allowed)}
              canAssign={Boolean(assignDecision?.allowed)}
            />
            {subscriptions.length > 0 ? (
              <SubscriptionVisibilityDashboard subscriptions={subscriptions} />
            ) : (
              <CurrentSubscriptionDetail subscription={currentSubscription} />
            )}
          </>
        ) : (
          <div className="space-y-6">
            <CurrentSubscriptionDetail
              subscription={currentSubscription}
              canSelectPlan={canSelectPlan}
            />
            <AvailablePlans
              plans={availablePlans}
              currentSubscription={currentSubscription}
              canSelect={canSelectPlan}
              onSelectPlan={async (plan) => {
                const result = await simulatePlanSelection(
                  plan.id,
                  selectedScope.nodeId,
                  currentUser,
                );

                if (result.status === "conflict") {
                  return { conflict: result.conflict };
                }

                void currentSubscriptionQuery.refetch();
                void availablePlansQuery.refetch();

                return { conflict: null };
              }}
            />
          </div>
        )}
      </div>

      {createDecision?.allowed && isManagerRole(currentUser.profile.role) ? (
        <CreateBillingPlanWizard open={createOpen} onOpenChange={setCreateOpen} />
      ) : null}
    </div>
  );
}
