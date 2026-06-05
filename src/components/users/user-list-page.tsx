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
import { getUsers } from "@/lib/mock-api/users";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { CreateUserForm } from "./create-user-form";
import { UserList } from "./user-list";

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function UserListPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [createOpen, setCreateOpen] = useState(false);

  const viewDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "users", selectedScope);
  }, [currentUser, selectedScope]);

  const createDecision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "create", "users", selectedScope);
  }, [currentUser, selectedScope]);

  const query = useQuery({
    queryKey: ["users", selectedScope?.nodeId ?? "none", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && selectedScope && viewDecision?.allowed),
    queryFn: () => getUsers(selectedScope!.nodeId, currentUser!),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!selectedScope) {
    return (
      <EmptyState
        title="No scope selected"
        description="Select a hierarchy scope to load scoped users."
      />
    );
  }

  if (!viewDecision?.allowed) {
    return <NoPermissionState description="You cannot view users in this scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading users" variant="page" rows={5} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="User data is not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const users = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Users</h1>
          <p className="text-sm text-slate-600">
            Scoped user access for {selectedScope.path.map((item) => item.name).join(" / ")}
          </p>
        </div>
        {createDecision?.allowed ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create User
          </Button>
        ) : null}
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No users in this scope"
          description="Users assigned to the selected scope will appear here."
          actionLabel={createDecision?.allowed ? "Create User" : undefined}
          onAction={createDecision?.allowed ? () => setCreateOpen(true) : undefined}
          canAct={Boolean(createDecision?.allowed)}
        />
      ) : (
        <UserList
          users={users}
          currentUser={currentUser}
          selectedScope={selectedScope}
        />
      )}

      {createDecision?.allowed ? (
        <CreateUserForm
          open={createOpen}
          selectedScope={selectedScope}
          currentUser={currentUser}
          onOpenChange={setCreateOpen}
        />
      ) : null}
    </div>
  );
}
