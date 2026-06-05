"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBillingOverview } from "@/lib/mock-api/billing";
import { can } from "@/lib/rbac/can";
import type { Customer } from "@/types/customer";
import type { User } from "@/types/user";

type CustomerBillingTabProps = {
  customer: Customer;
  user: User;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function CustomerBillingTab({ customer, user }: CustomerBillingTabProps) {
  const billingDecision = useMemo(
    () =>
      can(user, "view", "billing", {
        nodeId: customer.id,
        nodeType: customer.type,
        nodeName: customer.name,
        path: customer.path,
      }),
    [customer, user],
  );

  const query = useQuery({
    queryKey: ["customer-billing", customer.id, user.id],
    enabled: billingDecision.allowed,
    queryFn: () => getBillingOverview(customer.id, user),
  });

  if (!billingDecision.allowed) {
    return (
      <NoPermissionState description="Billing data is not available for this customer scope." />
    );
  }

  if (query.isLoading) {
    return <LoadingState title="Loading billing summary" variant="section" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return (
        <NoPermissionState description="Billing data is not available for this customer scope." />
      );
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const billing = query.data;

  if (!billing?.currentSubscription) {
    return (
      <EmptyState
        title="No active subscription"
        description="This customer does not currently have an active billing subscription in the visible scope."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p className="text-lg font-semibold text-slate-950">
            {billing.currentSubscription.planName}
          </p>
          <p className="capitalize text-slate-600">
            {billing.currentSubscription.planType.replaceAll("_", " ")}
          </p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            {billing.currentSubscription.status}
          </Badge>
          <p>Starts: {billing.currentSubscription.startsAt}</p>
          <p>Renews: {billing.currentSubscription.renewsAt ?? "Not scheduled"}</p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Usage Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            Device Usage: {billing.currentSubscription.usage.deviceCountUsed ?? "N/A"}
            {billing.currentSubscription.usage.deviceLimit
              ? ` / ${billing.currentSubscription.usage.deviceLimit}`
              : ""}
          </p>
          <p>
            Available Plans Visible: {billing.availablePlans.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
