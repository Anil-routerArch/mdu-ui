"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Eye, Edit3, Trash2, Plus } from "lucide-react";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserById } from "@/lib/mock-api/users";
import {
  getManagementRolesForUser,
  deleteManagementPolicy,
  getManagementPolicyById,
  getEntities,
  ManagementRoleApiResponse,
} from "@/lib/mock-api/management-access";
import { AssignAccessForm } from "./assign-access-form";
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
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [assignOpen, setAssignOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Policy-specific states
  const [viewRole, setViewRole] = useState<ManagementRoleApiResponse | null>(null);
  const [editRole, setEditRole] = useState<ManagementRoleApiResponse | null>(null);
  const [deleteRole, setDeleteRole] = useState<ManagementRoleApiResponse | null>(null);
  const [addAccessOpen, setAddAccessOpen] = useState(false);

  const query = useQuery({
    queryKey: ["user", userId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser),
    queryFn: () => getUserById(userId, currentUser!),
  });

  const rolesQuery = useQuery({
    queryKey: ["user-management-roles", userId],
    enabled: Boolean(currentUser),
    queryFn: () => getManagementRolesForUser({ userId }),
  });

  const entitiesQuery = useQuery({
    queryKey: ["entities-list"],
    queryFn: () => getEntities(),
    enabled: Boolean(currentUser),
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

  const entitiesList = entitiesQuery.data || [];
  const managementRoles = rolesQuery.data || [];

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
          <TabsTrigger value="access-policies">Access Policies</TabsTrigger>
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

        <TabsContent value="access-policies" className="pt-4 space-y-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-950">Access Policies</CardTitle>
                <p className="text-sm text-slate-500">Assign and manage access scopes for {user.name}.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddAccessOpen(true)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Policy Assignment
              </Button>
            </CardHeader>
            <CardContent>
              {rolesQuery.isLoading || entitiesQuery.isLoading ? (
                <LoadingState title="Loading assigned policies..." variant="section" rows={3} />
              ) : rolesQuery.isError || entitiesQuery.isError ? (
                <ErrorState
                  error={rolesQuery.error || entitiesQuery.error}
                  onRetry={() => {
                    void rolesQuery.refetch();
                    void entitiesQuery.refetch();
                  }}
                />
              ) : managementRoles.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-6">
                  No access policies have been assigned to this user yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {managementRoles.map((role) => {
                    const ent = entitiesList.find((e: any) => e.id === role.entity);
                    const entityName = ent?.name || role.entity;
                    const scopeText = role.venue ? `Venue: ${role.venue}` : `Entity: ${entityName}`;

                    return (
                      <div
                        key={role.id}
                        className="flex flex-col gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/10 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {scopeText}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {role.venue ? `Entity Scope: ${entityName}` : "Entity Level Scope"} | Policy Name: {role.name}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setViewRole(role)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditRole(role)}
                          >
                            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            onClick={() => setDeleteRole(role)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Access policy view dialog */}
      <AccessPolicyViewModal
        role={viewRole}
        open={Boolean(viewRole)}
        onOpenChange={(op) => {
          if (!op) setViewRole(null);
        }}
      />

      {/* Access policy delete confirmation */}
      <AccessPolicyDeleteDialog
        role={deleteRole}
        open={Boolean(deleteRole)}
        onOpenChange={(op) => {
          if (!op) setDeleteRole(null);
        }}
        onSuccess={() => {
          void rolesQuery.refetch();
        }}
      />

      {/* Add policy assignment dialog */}
      <Dialog
        open={addAccessOpen}
        onOpenChange={(op) => {
          if (!op) setAddAccessOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Assign Access Policy</DialogTitle>
          </DialogHeader>
          <AssignAccessForm
            user={user}
            onBack={() => setAddAccessOpen(false)}
            onComplete={() => {
              setAddAccessOpen(false);
              void rolesQuery.refetch();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit policy assignment dialog */}
      <Dialog
        open={Boolean(editRole)}
        onOpenChange={(op) => {
          if (!op) setEditRole(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Edit Access Policy</DialogTitle>
          </DialogHeader>
          {editRole && (
            <AssignAccessForm
              user={user}
              editingRole={editRole}
              onBack={() => setEditRole(null)}
              onComplete={() => {
                setEditRole(null);
                void rolesQuery.refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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

function AccessPolicyViewModal({
  role,
  open,
  onOpenChange,
}: {
  role: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const policyId = role?.managementPolicyId || role?.managementPolicy || "";
  const policyQuery = useQuery({
    queryKey: ["policy-view", policyId],
    queryFn: () => getManagementPolicyById({ policyId }),
    enabled: open && Boolean(policyId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>View Access Policy</DialogTitle>
        </DialogHeader>
        {policyQuery.isLoading ? (
          <LoadingState title="Loading policy..." variant="section" rows={3} />
        ) : policyQuery.isError ? (
          <ErrorState error={policyQuery.error} onRetry={() => void policyQuery.refetch()} />
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <span className="text-slate-500 text-xs font-medium">Policy Name</span>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                {policyQuery.data?.name || "No name"}
              </p>
            </div>
            {policyQuery.data?.description && (
              <div>
                <span className="text-slate-500 text-xs font-medium">Description</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {policyQuery.data.description}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Resource Permissions
              </span>
              <div className="space-y-3">
                {policyQuery.data?.entries && policyQuery.data.entries.length > 0 ? (
                  policyQuery.data.entries.map((entry: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 space-y-1"
                    >
                      <p className="text-xs font-semibold text-slate-905 dark:text-slate-50">
                        Resource: {entry.resources?.join(", ") || "*"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Permissions: {entry.access?.join(", ") || "NOACCESS"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No permissions set.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AccessPolicyDeleteDialog({
  role,
  open,
  onOpenChange,
  onSuccess,
}: {
  role: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const policyId = role?.managementPolicyId || role?.managementPolicy || "";

  const mutation = useMutation({
    mutationFn: () => deleteManagementPolicy({ policyId }),
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to delete access policy.");
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-rose-600">Delete Access Policy</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Are you sure you want to delete the access policy assignment for <strong>{role?.name || "this role"}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => mutation.mutate()}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
