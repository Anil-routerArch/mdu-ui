"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Edit3, Trash2, Plus, Info, Shield, User as UserIcon } from "lucide-react";

import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAssignableRoles, updateUser } from "@/lib/mock-api/users";
import {
  getManagementRolesForUser,
  deleteManagementPolicy,
  getManagementPolicyById,
  getEntities,
  ManagementRoleApiResponse,
} from "@/lib/mock-api/management-access";
import { AssignAccessForm } from "./assign-access-form";
import type { UserRole } from "@/types/rbac";
import type { User } from "@/types/user";

type UserPolicyDialogProps = {
  user: User | null;
  currentUser: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SubView = "list" | "view" | "add" | "edit" | "delete";

export function UserPolicyDialog({
  user,
  currentUser,
  open,
  onOpenChange,
}: UserPolicyDialogProps) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("profile-role");

  // Role profile states
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [roleError, setRoleError] = useState<string | null>(null);

  // Access policy states
  const [view, setView] = useState<SubView>("list");
  const [targetRole, setTargetRole] = useState<ManagementRoleApiResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user && open) {
      setSelectedRole(user.profile.role);
      setView("list");
      setTargetRole(null);
      setRoleError(null);
      setDeleteError(null);
    }
  }, [user, open]);

  const rolesQuery = useQuery({
    queryKey: ["assignable-roles", currentUser.id],
    enabled: open && activeTab === "profile-role",
    queryFn: () => getAssignableRoles(currentUser),
  });

  const mRolesQuery = useQuery({
    queryKey: ["user-management-roles", user?.id],
    enabled: open && Boolean(user?.id),
    queryFn: () => getManagementRolesForUser({ userId: user!.id }),
  });

  const entitiesQuery = useQuery({
    queryKey: ["entities-list"],
    queryFn: () => getEntities(),
    enabled: open && Boolean(user?.id),
  });

  const updateRoleMutation = useMutation({
    mutationFn: (role: UserRole) => updateUser(user!.id, { role }, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      setRoleError(err.message || "Failed to assign role on OWSEC.");
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (policyId: string) => deleteManagementPolicy({ policyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-management-roles", user?.id] });
      setView("list");
      setTargetRole(null);
    },
    onError: (err: any) => {
      setDeleteError(err.message || "Failed to delete access policy.");
    },
  });

  const handleUpdateRole = () => {
    if (!selectedRole || !user) return;
    setRoleError(null);
    updateRoleMutation.mutate(selectedRole as UserRole);
  };

  const handleDeletePolicy = () => {
    if (!targetRole) return;
    const policyId = targetRole.managementPolicyId || targetRole.managementPolicy || "";
    setDeleteError(null);
    deletePolicyMutation.mutate(policyId);
  };

  if (!user) return null;

  const entitiesList = entitiesQuery.data || [];
  const managementRoles = mRolesQuery.data || [];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedRole("");
          setRoleError(null);
          setView("list");
          setTargetRole(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            User Policy - <span className="text-slate-600 font-normal">{user.email}</span>
          </DialogTitle>
          <DialogDescription>
            Manage role permissions and provisioning access policies for {user.name}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
          <TabsList variant="line" className="w-full justify-start border-b border-slate-200 bg-transparent p-0">
            <TabsTrigger value="profile-role" disabled={view !== "list"}>
              <UserIcon className="h-3.5 w-3.5 mr-1.5" /> Profile Role
            </TabsTrigger>
            <TabsTrigger value="access-policies" disabled={view !== "list"}>
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Access Policies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile-role" className="pt-4 space-y-4">
            {rolesQuery.isLoading ? (
              <LoadingState title="Loading roles" variant="section" rows={3} />
            ) : rolesQuery.isError ? (
              <ErrorState error={rolesQuery.error} onRetry={() => void rolesQuery.refetch()} />
            ) : (
              <div className="space-y-4">
                {roleError && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                    {roleError}
                  </div>
                )}

                <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assigned Scope
                  </p>
                  <p className="mt-1">
                    {user.scopeAssignments[0]?.scopePath.map((item) => item.name).join(" / ") ?? "No scope"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Available Role / Profile *</label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => setSelectedRole(value as UserRole)}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an assignable role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesQuery.data?.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400">
                  Role/profile changes affect visible modules, actions, and scoped permission behavior.
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateRoleMutation.isPending}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpdateRole}
                    disabled={!selectedRole || updateRoleMutation.isPending}
                  >
                    Save Role / Profile
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="access-policies" className="pt-4 space-y-4">
            {view === "list" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Assign and manage access scopes for {user.name}.</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setTargetRole(null);
                      setView("add");
                    }}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Create New Assignment
                  </Button>
                </div>

                {mRolesQuery.isLoading || entitiesQuery.isLoading ? (
                  <LoadingState title="Loading assigned policies..." variant="section" rows={3} />
                ) : mRolesQuery.isError || entitiesQuery.isError ? (
                  <ErrorState
                    error={mRolesQuery.error || entitiesQuery.error}
                    onRetry={() => {
                      void mRolesQuery.refetch();
                      void entitiesQuery.refetch();
                    }}
                  />
                ) : managementRoles.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-6 border border-dashed rounded-xl dark:border-slate-800">
                    No access policies have been assigned to this user yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {managementRoles.map((role) => {
                      const ent = entitiesList.find((e: any) => e.id === role.entity);
                      const entityName = ent?.name || role.entity;
                      const scopeText = role.venue ? `Venue: ${role.venue}` : `Entity: ${entityName}`;

                      return (
                        <div
                          key={role.id}
                          className="flex flex-col gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/10 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {scopeText}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {role.venue ? `Entity Scope: ${entityName}` : "Entity Level Scope"} | Policy Name: {role.name}
                            </p>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTargetRole(role);
                                setView("view");
                              }}
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTargetRole(role);
                                setView("edit");
                              }}
                            >
                              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              onClick={() => {
                                setTargetRole(role);
                                setView("delete");
                              }}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {view === "view" && targetRole && (
              <AccessPolicySubView role={targetRole} onBack={() => setView("list")} />
            )}

            {view === "delete" && targetRole && (
              <div className="space-y-4">
                {deleteError && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                    {deleteError}
                  </div>
                )}
                <h3 className="text-base font-semibold text-rose-600">Delete Access Policy</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Are you sure you want to delete the access policy assignment for <strong>{targetRole.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Button type="button" variant="outline" onClick={() => setView("list")} disabled={deletePolicyMutation.isPending}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    onClick={handleDeletePolicy}
                    disabled={deletePolicyMutation.isPending}
                  >
                    Delete Policy
                  </Button>
                </div>
              </div>
            )}

            {view === "add" && (
              <AssignAccessForm
                user={user}
                onBack={() => setView("list")}
                onComplete={() => {
                  setView("list");
                  void mRolesQuery.refetch();
                }}
              />
            )}

            {view === "edit" && targetRole && (
              <AssignAccessForm
                user={user}
                editingRole={targetRole}
                onBack={() => setView("list")}
                onComplete={() => {
                  setView("list");
                  void mRolesQuery.refetch();
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AccessPolicySubView({ role, onBack }: { role: ManagementRoleApiResponse; onBack: () => void }) {
  const policyId = role.managementPolicyId || role.managementPolicy || "";
  const policyQuery = useQuery({
    queryKey: ["policy-view-dialog", policyId],
    queryFn: () => getManagementPolicyById({ policyId }),
    enabled: Boolean(policyId),
  });

  return (
    <div className="space-y-4 pt-2">
      {policyQuery.isLoading ? (
        <LoadingState title="Loading policy..." variant="section" rows={3} />
      ) : policyQuery.isError ? (
        <ErrorState error={policyQuery.error} onRetry={() => void policyQuery.refetch()} />
      ) : (
        <div className="space-y-4">
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
          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button type="button" onClick={onBack}>
              Back to List
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
