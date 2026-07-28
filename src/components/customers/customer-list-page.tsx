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
import { CreateCustomerWizard } from "./create-customer-wizard";
import { CustomerList } from "./customer-list";

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function CustomerListPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [createOpen, setCreateOpen] = useState(false);

  const viewDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "customers", null);
  }, [currentUser]);

  const createDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "create", "customers", null);
  }, [currentUser]);

  const query = useQuery({
    queryKey: ["customers", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && viewDecision?.allowed),
    queryFn: () => getCustomers(null, currentUser!),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!viewDecision?.allowed) {
    return <NoPermissionState description="You cannot view customers." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading customers" variant="page" rows={5} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Customer data is not available." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const customers = query.data ?? [];

  return (
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Entities</h1>
          <p className="text-sm text-slate-600">
            Manage your entities and operator scopes.
          </p>
        </div>
        {createDecision?.allowed ? (
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            style={{ backgroundColor: "var(--mdu-primary)", color: "#ffffff" }}
            className="font-semibold shadow-sm transition-colors hover:opacity-90"
          >
            Create Entity
          </Button>
        ) : null}
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No entities found"
          description="Permitted entities and operators will appear here."
          actionLabel={createDecision?.allowed ? "Create Entity" : undefined}
          onAction={createDecision?.allowed ? () => setCreateOpen(true) : undefined}
          canAct={Boolean(createDecision?.allowed)}
        />
      ) : (
        <CustomerList
          customers={customers}
          user={currentUser}
          selectedScope={null}
        />
      )}

      {createDecision?.allowed ? (
        <CreateCustomerWizard
          open={createOpen}
          user={currentUser}
          onOpenChange={setCreateOpen}
        />
      ) : null}
    </div>
  );
}
