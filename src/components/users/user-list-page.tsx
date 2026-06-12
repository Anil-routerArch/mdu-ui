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
  const [createOpen, setCreateOpen] = useState(false);

  const userScopeId = useMemo(() => {
    if (!currentUser) return "none";
    return currentUser.scopeAssignments[0]?.scopePath.at(-1)?.id || "none";
  }, [currentUser]);

  const userScopeObj = useMemo(() => {
    if (!currentUser) return null;
    const path = currentUser.scopeAssignments[0]?.scopePath || [];
    const node = path.at(-1);
    return {
      nodeId: userScopeId,
      nodeType: node?.type || "operator",
      nodeName: node?.name || "Scope",
      path: path,
    };
  }, [currentUser, userScopeId]);

  const viewDecision = useMemo(() => {
    if (!currentUser || !userScopeObj) {
      return null;
    }

    return can(currentUser, "view", "users", userScopeObj);
  }, [currentUser, userScopeObj]);

  const createDecision = useMemo(() => {
    if (!currentUser || !userScopeObj) {
      return null;
    }

    return can(currentUser, "create", "users", userScopeObj);
  }, [currentUser, userScopeObj]);

  const query = useQuery({
    queryKey: ["users", userScopeId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && viewDecision?.allowed),
    queryFn: () => getUsers(userScopeId, currentUser!),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
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
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Users</h1>
          <p className="text-sm text-slate-600">
            Scoped user access for {userScopeObj?.path.map((item) => item.name).join(" / ") ?? "Assigned Scope"}
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
          selectedScope={userScopeObj}
        />
      )}

      {createDecision?.allowed && userScopeObj ? (
        <CreateUserForm
          open={createOpen}
          selectedScope={userScopeObj}
          currentUser={currentUser}
          onOpenChange={setCreateOpen}
        />
      ) : null}
    </div>
  );
}
