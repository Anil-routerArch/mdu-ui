"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserById } from "@/lib/mock-api/users";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { AssignRoleProfileDialog } from "./assign-role-profile-dialog";
import { ResetPasswordConfirmation } from "./reset-password-confirmation";
import { SuspendUserConfirmation } from "./suspend-user-confirmation";
import { EditUserForm } from "./edit-user-form";
import { DeleteUserConfirmation } from "./delete-user-confirmation";
import { UserScopeAssignmentSummary } from "./user-scope-assignment-summary";
import { UserSessions } from "./user-sessions";
import { UserStatusBadge } from "./user-status-badge";

type UserDetailPageProps = {
  userId: string;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [assignOpen, setAssignOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const query = useQuery({
    queryKey: ["user", userId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser),
    queryFn: () => getUserById(userId, currentUser!),
  });

  const detailScope = query.data?.scopeAssignments[0]?.scopePath ?? [];
  const editDecision = currentUser
    ? can(currentUser, "edit", { module: "users", ownerScopePath: detailScope }, null)
    : null;
  const assignDecision = currentUser
    ? can(currentUser, "assign", { module: "users", ownerScopePath: detailScope }, null)
    : null;

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading user detail" variant="page" rows={5} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="This user is outside your permitted scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const user = query.data;

  if (!user) {
    return (
      <ErrorState
        title="User not available"
        description="The requested user could not be loaded."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl text-slate-950">{user.name}</CardTitle>
              <UserStatusBadge status={user.status} />
            </div>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="text-sm text-slate-500">
              {user.scopeAssignments[0]?.scopePath.map((item) => item.name).join(" / ") ??
                "No assigned scope"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {editDecision?.allowed ? (
              <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                Edit Details
              </Button>
            ) : null}
            {assignDecision?.allowed ? (
              <Button type="button" variant="outline" onClick={() => setAssignOpen(true)}>
                Assign Role / Profile
              </Button>
            ) : null}
            {editDecision?.allowed ? (
              <Button type="button" variant="outline" onClick={() => setResetOpen(true)}>
                Reset Password
              </Button>
            ) : null}
            {editDecision?.allowed ? (
              <Button type="button" variant="outline" onClick={() => setSuspendOpen(true)}>
                {user.status === "suspended" ? "Reactivate" : "Suspend"}
              </Button>
            ) : null}
            {editDecision?.allowed ? (
              <Button
                type="button"
                variant="outline"
                className="text-rose-600 hover:text-rose-700"
                onClick={() => setDeleteOpen(true)}
              >
                Delete User
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-slate-200 bg-transparent p-0"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scope-assignment">Scope Assignment</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div><span className="text-slate-500">Name:</span> {user.name}</div>
                <div><span className="text-slate-500">Email:</span> {user.email}</div>
                <div>
                  <span className="text-slate-500">Role / Profile:</span>{" "}
                  {user.profile.profileName ?? user.profile.role.replaceAll("_", " ")}
                </div>
                <div><span className="text-slate-500">Last Login:</span> {user.lastLoginAt ?? "Never"}</div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div><span className="text-slate-500">Status:</span> {user.status.replaceAll("_", " ")}</div>
                <div><span className="text-slate-500">Created:</span> {user.createdAt}</div>
                <div><span className="text-slate-500">Updated:</span> {user.updatedAt}</div>
                <div>
                  <span className="text-slate-500">Assignment Count:</span>{" "}
                  {user.profile.assignmentCount}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scope-assignment" className="pt-4">
          <UserScopeAssignmentSummary user={user} />
        </TabsContent>

        <TabsContent value="sessions" className="pt-4">
          <UserSessions userId={user.id} targetUser={user} currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="actions" className="pt-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-950">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {editDecision?.allowed ? (
                <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                  Edit Details
                </Button>
              ) : null}
              {assignDecision?.allowed ? (
                <Button type="button" variant="outline" onClick={() => setAssignOpen(true)}>
                  Assign Role / Profile
                </Button>
              ) : null}
              {editDecision?.allowed ? (
                <Button type="button" variant="outline" onClick={() => setResetOpen(true)}>
                  Reset Password
                </Button>
              ) : null}
              {editDecision?.allowed ? (
                <Button type="button" variant="outline" onClick={() => setSuspendOpen(true)}>
                  {user.status === "suspended" ? "Reactivate User" : "Suspend User"}
                </Button>
              ) : null}
              {editDecision?.allowed ? (
                <Button
                  type="button"
                  variant="outline"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete User Account
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editDecision?.allowed ? (
        <EditUserForm
          user={user}
          currentUser={currentUser}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}

      {editDecision?.allowed ? (
        <DeleteUserConfirmation
          user={user}
          currentUser={currentUser}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onSuccess={() => router.push("/users")}
        />
      ) : null}

      {assignDecision?.allowed ? (
        <AssignRoleProfileDialog
          user={user}
          currentUser={currentUser}
          open={assignOpen}
          onOpenChange={setAssignOpen}
        />
      ) : null}
      {editDecision?.allowed ? (
        <ResetPasswordConfirmation
          user={user}
          currentUser={currentUser}
          open={resetOpen}
          onOpenChange={setResetOpen}
        />
      ) : null}
      {editDecision?.allowed ? (
        <SuspendUserConfirmation
          user={user}
          currentUser={currentUser}
          open={suspendOpen}
          onOpenChange={setSuspendOpen}
        />
      ) : null}
    </div>
  );
}
