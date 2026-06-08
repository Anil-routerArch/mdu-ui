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
import { getCustomers } from "@/lib/mock-api/customers";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { CreateCustomerWizard } from "./create-customer-wizard";
import { CustomerList } from "./customer-list";

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function CustomerListPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [createOpen, setCreateOpen] = useState(false);

  const viewDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "customers", selectedScope);
  }, [currentUser, selectedScope]);

  const createDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "create", "customers", selectedScope);
  }, [currentUser, selectedScope]);

  const query = useQuery({
    queryKey: ["customers", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getCustomers(selectedScope!.nodeId, currentUser!),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!selectedScope) {
    return (
      <EmptyState
        title="No scope selected"
        description="Select a hierarchy scope to load customers and sub-operators."
      />
    );
  }

  if (!viewDecision?.allowed) {
    return <NoPermissionState description="You cannot view customers for this scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading customers" variant="page" rows={5} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Customer data is not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const customers = query.data ?? [];
  const scopeSummary = selectedScope.path.map((item) => item.name).join(" / ");

  return (
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Customers</h1>
          <p className="text-sm text-slate-600">
            Customer and sub-operator scopes for {scopeSummary}
          </p>
        </div>
        {createDecision?.allowed ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create Customer
          </Button>
        ) : null}
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers in this scope"
          description="Permitted customers and sub-operators will appear here."
          actionLabel={createDecision?.allowed ? "Create Customer" : undefined}
          onAction={createDecision?.allowed ? () => setCreateOpen(true) : undefined}
          canAct={Boolean(createDecision?.allowed)}
        />
      ) : (
        <CustomerList
          customers={customers}
          user={currentUser}
          selectedScope={selectedScope}
        />
      )}

      {createDecision?.allowed ? (
        <CreateCustomerWizard
          open={createOpen}
          selectedScope={selectedScope}
          user={currentUser}
          onOpenChange={setCreateOpen}
        />
      ) : null}
    </div>
  );
}
