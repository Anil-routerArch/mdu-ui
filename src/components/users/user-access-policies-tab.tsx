"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Info, X, Check, Search, Edit3 } from "lucide-react";

import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getManagementRolesForUser,
  getEntities,
  getVenues,
  getManagementPolicies,
  createManagementRole,
  updateManagementRole,
  deleteManagementRole,
  ManagementRoleApiResponse,
} from "@/lib/mock-api/management-access";
import type { User } from "@/types/user";

type UserAccessPoliciesTabProps = {
  user: User;
  currentUser: User;
};

// Safe ID Generator to guarantee unique values without external deps
const generateId = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function UserAccessPoliciesTab({
  user,
  currentUser,
}: UserAccessPoliciesTabProps) {
  const queryClient = useQueryClient();
  const isRoot = currentUser.profile.role === "root";

  // State variables
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Inline editing state
  const [roleToEdit, setRoleToEdit] = useState<ManagementRoleApiResponse | null>(null);
  const [editPolicyId, setEditPolicyId] = useState("");

  // Queries
  const mRolesQuery = useQuery({
    queryKey: ["user-management-roles", user.id],
    queryFn: () => getManagementRolesForUser({ userId: user.id }),
  });

  const entitiesQuery = useQuery({
    queryKey: ["entities-list"],
    queryFn: () => getEntities(),
  });

  const venuesQuery = useQuery({
    queryKey: ["venues-list"],
    queryFn: () => getVenues(),
  });

  const policiesQuery = useQuery({
    queryKey: ["policies-list"],
    queryFn: () => getManagementPolicies(),
  });

  const userRoles = mRolesQuery.data || [];
  const entitiesList = entitiesQuery.data || [];
  const venuesList = venuesQuery.data || [];
  const policiesList = policiesQuery.data || [];

  // Default selection when policies are loaded
  useEffect(() => {
    if (policiesList.length > 0 && !selectedPolicyId) {
      setSelectedPolicyId(policiesList[0].id);
    }
  }, [policiesList, selectedPolicyId]);

  // If no roles exist for user, default to showing the add form
  useEffect(() => {
    if (mRolesQuery.isSuccess && userRoles.length === 0) {
      setShowAddForm(true);
    }
  }, [mRolesQuery.isSuccess, userRoles.length]);

  // Helpers
  const getEntityName = (id?: string) => {
    if (!id) return "";
    const found = entitiesList.find((e: any) => e.id === id);
    return found ? found.name : id;
  };

  const getVenueName = (id?: string) => {
    if (!id) return "Entity-wide";
    const found = venuesList.find((v: any) => v.id === id);
    return found ? found.name : id;
  };

  const getPolicyName = (id?: string) => {
    if (!id) return "";
    const found = policiesList.find((p: any) => p.id === id);
    return found ? found.name : id;
  };

  const filteredVenues = useMemo(() => {
    return venuesList.filter((v: any) => v.entity === selectedEntityId);
  }, [venuesList, selectedEntityId]);

  // Filter existing assignments for search
  const filteredRoles = useMemo(() => {
    return userRoles.filter((role) => {
      const entityName = getEntityName(role.entity).toLowerCase();
      const venueName = getVenueName(role.venue).toLowerCase();
      const policyName = getPolicyName(role.managementPolicyId || role.managementPolicy || "").toLowerCase();
      const q = searchQuery.toLowerCase();
      return entityName.includes(q) || venueName.includes(q) || policyName.includes(q);
    });
  }, [userRoles, entitiesList, venuesList, policiesList, searchQuery]);

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: (newRole: any) => createManagementRole(newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-management-roles", user.id] });
      setSelectedEntityId("");
      setSelectedVenueId("");
      if (policiesList.length > 0) {
        setSelectedPolicyId(policiesList[0].id);
      }
      setShowAddForm(userRoles.length === 0);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to assign policy scope.");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (updatedRole: any) => updateManagementRole(updatedRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-management-roles", user.id] });
      setRoleToEdit(null);
      setEditPolicyId("");
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to update access policy.");
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => deleteManagementRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-management-roles", user.id] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to remove access policy.");
    },
  });

  const handleCreate = () => {
    if (!selectedEntityId) {
      setError("Please select an entity.");
      return;
    }
    if (!selectedPolicyId) {
      setError("Please select a policy.");
      return;
    }

    setError(null);
    const newRole = {
      id: generateId(),
      name: `Policy-${generateId().substring(0, 8)}`,
      description: "User role assignment",
      managementPolicy: selectedPolicyId,
      users: [user.id],
      entity: selectedEntityId,
      venue: selectedVenueId === "entity-wide" ? "" : selectedVenueId || "",
    };

    createRoleMutation.mutate(newRole);
  };

  const handleEditSave = () => {
    if (!roleToEdit) return;
    if (!editPolicyId) {
      setError("Please select a policy.");
      return;
    }

    setError(null);
    const updatedRole = {
      ...roleToEdit,
      managementPolicy: editPolicyId,
    };

    updateRoleMutation.mutate(updatedRole);
  };

  const handleDeleteClick = (role: ManagementRoleApiResponse) => {
    const entName = getEntityName(role.entity);
    const venName = getVenueName(role.venue);
    if (!window.confirm(`Are you sure you want to revoke access scope mapping for ${entName} (${venName})?`)) {
      return;
    }
    deleteRoleMutation.mutate(role.id);
  };

  return (
    <div className="space-y-4 mt-2">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Scoped Management Policy Assignments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each row represents a policy assignment for this user under a specific entity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-40 sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs placeholder:text-slate-400"
              />
            </div>
            {isRoot && !showAddForm && (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowAddForm(true)}
                style={{ backgroundColor: "var(--mdu-primary)", color: "#ffffff" }}
                className="h-8 text-xs font-semibold flex items-center gap-1 hover:opacity-90 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Assign Policy Scope
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Entity</TableHead>
                <TableHead className="w-[25%]">Venue</TableHead>
                <TableHead className="w-[30%]">Assigned Policy</TableHead>
                <TableHead className="text-right w-[15%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mRolesQuery.isLoading || entitiesQuery.isLoading || venuesQuery.isLoading || policiesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <LoadingState title="Loading assignments..." variant="section" rows={2} />
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-slate-500 py-6 italic">
                    No active access policies assigned to this user.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {getEntityName(role.entity)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {getVenueName(role.venue)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {roleToEdit?.id === role.id ? (
                        <Select
                          value={editPolicyId}
                          onValueChange={setEditPolicyId}
                        >
                          <SelectTrigger className="h-8 max-w-xs text-xs">
                            <SelectValue placeholder="Select policy" />
                          </SelectTrigger>
                          <SelectContent>
                            {policiesList.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        getPolicyName(role.managementPolicyId || role.managementPolicy || "")
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {roleToEdit?.id === role.id ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              className="h-7 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                              onClick={handleEditSave}
                              disabled={updateRoleMutation.isPending}
                            >
                              <Check className="h-3.5 w-3.5 mr-0.5" /> Save
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              className="h-7 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-500/10"
                              onClick={() => {
                                setRoleToEdit(null);
                                setEditPolicyId("");
                              }}
                            >
                              <X className="h-3.5 w-3.5 mr-0.5" /> Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            {isRoot && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="h-7 text-xs font-semibold text-blue-600 dark:text-blue-400"
                                onClick={() => {
                                  setRoleToEdit(role);
                                  setEditPolicyId(role.managementPolicyId || role.managementPolicy || "");
                                }}
                              >
                                <Edit3 className="h-3.5 w-3.5 mr-0.5" /> Edit
                              </Button>
                            )}
                            {isRoot && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="h-7 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                                onClick={() => handleDeleteClick(role)}
                                disabled={deleteRoleMutation.isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-0.5" /> Revoke
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Assign Scope Form section at the bottom, matching layout */}
      {isRoot && showAddForm && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Assign New Entity or Venue Scope
            </h3>
            {userRoles.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
              >
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3 items-end">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Entity *</label>
              <Select
                value={selectedEntityId}
                onValueChange={(val) => {
                  setSelectedEntityId(val);
                  setSelectedVenueId("");
                }}
                disabled={createRoleMutation.isPending}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Entity" />
                </SelectTrigger>
                <SelectContent>
                  {entitiesList.map((ent: any) => (
                    <SelectItem key={ent.id} value={ent.id}>
                      {ent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Venues</label>
              <Select
                value={selectedVenueId}
                onValueChange={setSelectedVenueId}
                disabled={createRoleMutation.isPending || !selectedEntityId}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Entity-wide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entity-wide">Entity-wide</SelectItem>
                  {filteredVenues.map((ven: any) => (
                    <SelectItem key={ven.id} value={ven.id}>
                      {ven.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Policy *</label>
              <Select
                value={selectedPolicyId}
                onValueChange={setSelectedPolicyId}
                disabled={createRoleMutation.isPending}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Policy" />
                </SelectTrigger>
                <SelectContent>
                  {policiesList.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      {policy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {userRoles.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
                disabled={createRoleMutation.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleCreate}
              disabled={createRoleMutation.isPending}
              style={{ backgroundColor: "var(--mdu-primary)", color: "#ffffff" }}
              className="px-4 font-semibold shadow-sm transition-colors hover:opacity-90"
            >
              {createRoleMutation.isPending ? "Assigning..." : "Save Scope Assignment"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
