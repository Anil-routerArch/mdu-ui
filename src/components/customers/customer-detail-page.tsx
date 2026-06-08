"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerById, getCustomerSummary } from "@/lib/mock-api/customers";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { CustomerStatusBadge } from "./customer-status-badge";
import { CustomerWorkspace } from "./customer-workspace";

type CustomerDetailPageProps = {
  customerId: string;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  const customerQuery = useQuery({
    queryKey: ["customer", customerId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser),
    queryFn: () => getCustomerById(customerId, currentUser!),
  });

  const summaryQuery = useQuery({
    queryKey: ["customer-summary", customerId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser),
    queryFn: () => getCustomerSummary(customerId, currentUser!),
  });

  const permissionDecision = useMemo(() => {
    if (!currentUser || !customerQuery.data) {
      return null;
    }

    return can(currentUser, "view", "customers", {
      nodeId: customerQuery.data.id,
      nodeType: customerQuery.data.type,
      nodeName: customerQuery.data.name,
      path: customerQuery.data.path,
    });
  }, [currentUser, customerQuery.data]);

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (customerQuery.isLoading || summaryQuery.isLoading) {
    return <LoadingState title="Loading customer workspace" variant="page" rows={5} />;
  }

  const queryError = customerQuery.error ?? summaryQuery.error;

  if (queryError) {
    if (isMockApiError(queryError) && queryError.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void customerQuery.refetch()} />;
    }

    if (isMockApiError(queryError) && queryError.code === "NO_PERMISSION") {
      return <NoPermissionState description="This customer is outside your permitted scope." />;
    }

    return <ErrorState error={queryError} onRetry={() => void customerQuery.refetch()} />;
  }

  const customer = customerQuery.data;
  const summary = summaryQuery.data;

  if (!customer || !summary) {
    return (
      <ErrorState
        title="Customer not available"
        description="The requested customer could not be loaded."
      />
    );
  }

  if (permissionDecision && !permissionDecision.allowed) {
    return <NoPermissionState description="This customer is outside your permitted scope." />;
  }

  return (
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl text-slate-950">{customer.name}</CardTitle>
            <CustomerStatusBadge status={customer.status} />
          </div>
          <p className="text-sm text-slate-600">
            {customer.path.map((item) => item.name).join(" / ")}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Type</p>
            <p className="mt-1 font-semibold text-slate-950">
              {customer.type.replaceAll("_", " ")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Billing Summary
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {customer.billing.currentPlanName ?? "No active plan"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {customer.billing.subscriptionStatus ?? "No subscription"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Health Summary
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {summary.deviceCount} devices / {summary.userCount} users
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {summary.siteCount} sites / {summary.venueCount} venues
            </p>
          </div>
        </CardContent>
      </Card>

      <CustomerWorkspace customer={customer} summary={summary} user={currentUser} />
    </div>
  );
}
