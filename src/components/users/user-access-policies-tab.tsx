"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Edit3, Trash2, Plus, Info, X, Check, ChevronDown, Search } from "lucide-react";

import { LoadingState, ErrorState } from "@/components/states";
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
  deleteManagementPolicy,
  getManagementPolicyById,
  getEntities,
  getVenues,
  assignUserAccess,
  getManagementRoleForUserEntity,
  ManagementRoleApiResponse,
  ManagementScope,
  ManagementRoleTemplate,
  ManagementAccessPermission,
  ManagementResourceAccess,
} from "@/lib/mock-api/management-access";
import type { User } from "@/types/user";

type UserAccessPoliciesTabProps = {
  user: User;
  currentUser: User;
};

const resourceOptions = [
  { label: "Entity", value: "entity" },
  { label: "Venue", value: "venue" },
  { label: "Operator", value: "operator" },
  { label: "Inventory", value: "inventory" },
  { label: "Configuration", value: "configuration" },
  { label: "Management Policy", value: "managementPolicy" },
  { label: "Management Role", value: "managementRole" },
];

const permissionOptions: { label: string; value: ManagementAccessPermission }[] = [
  { label: "READ", value: "READ" },
  { label: "MODIFY", value: "MODIFY" },
  { label: "DELETE", value: "DELETE" },
  { label: "LIST", value: "LIST" },
  { label: "CREATE", value: "CREATE" },
  { label: "FULL", value: "FULL" },
];

const resourceDescriptions: Record<string, string> = {
  entity: "Access to entity configuration and settings",
  venue: "Access to venues under the entity",
  operator: "Access to operator accounts and details",
  inventory: "Access to devices and inventory",
  configuration: "Access to configuration files and profiles",
  managementPolicy: "Access to management policies",
  managementRole: "Access to management roles",
};

// Resource count sub-component
function ResourceCount({ role }: { role: ManagementRoleApiResponse }) {
  const policyId = role.managementPolicyId || role.managementPolicy || "";
  const { data: policy, isLoading } = useQuery({
    queryKey: ["policy-resource-count", policyId],
    queryFn: () => getManagementPolicyById({ policyId }),
    enabled: Boolean(policyId),
    staleTime: 60000,
  });

  if (isLoading) return <span className="text-slate-400">Loading...</span>;
  if (!policy) return <span className="text-slate-500">0 resources</span>;

  const resources = new Set<string>();
  for (const entry of policy.entries || []) {
    for (const res of entry.resources || []) {
      resources.add(res);
    }
  }
  const count = resources.size;
  return <span>{count} {count === 1 ? "resource" : "resources"}</span>;
}

export function UserAccessPoliciesTab({
  user,
  currentUser,
}: UserAccessPoliciesTabProps) {
  const queryClient = useQueryClient();

  // Core dialog state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"view" | "edit" | "add" | null>(null);

  // Form inputs
  const [scope, setScope] = useState<ManagementScope>("entity");
  const [entityId, setEntityId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [roleTemplate, setRoleTemplate] = useState<ManagementRoleTemplate>("Admin");
  const [policyName, setPolicyName] = useState("");
  const [policyDescription, setPolicyDescription] = useState("");
  const [resourcePermissions, setResourcePermissions] = useState<ManagementResourceAccess[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    enabled: scope === "venue",
  });

  // Load selected role details for View / Edit mode
  const selectedRole = mRolesQuery.data?.find((r) => r.id === selectedRoleId) || null;
  const selectedPolicyId = selectedRole?.managementPolicyId || selectedRole?.managementPolicy || "";

  const policyQuery = useQuery({
    queryKey: ["policy-detail-tab", selectedPolicyId],
    queryFn: () => getManagementPolicyById({ policyId: selectedPolicyId }),
    enabled: Boolean(selectedPolicyId) && (formMode === "view" || formMode === "edit"),
  });

  // Auto-fetch policy on user/entity selection for creation flow
  const existingPolicyQuery = useQuery({
    queryKey: ["user-entity-policy-tab", user.id, entityId, scope, venueId],
    enabled: formMode === "add" && Boolean(entityId),
    queryFn: async () => {
      const roles = await getManagementRoleForUserEntity({
        entityId,
        userId: user.id,
        venueId: scope === "venue" ? venueId : undefined,
      });
      if (roles.length > 0) {
        const pId = roles[0].managementPolicyId || roles[0].managementPolicy || "";
        if (pId) {
          return getManagementPolicyById({ policyId: pId });
        }
      }
      return null;
    },
  });

  // Sync details when editing a policy
  useEffect(() => {
    if (selectedRole && policyQuery.data && (formMode === "edit" || formMode === "view")) {
      const policy = policyQuery.data;
      setScope(selectedRole.venue ? "venue" : "entity");
      setEntityId(selectedRole.entity || "");
      setVenueId(selectedRole.venue || "");
      
      let resolvedTemplate: ManagementRoleTemplate = "Admin";
      if (selectedRole.name.includes("Installer")) resolvedTemplate = "Installer";
      else if (selectedRole.name.includes("Support")) resolvedTemplate = "Support";
      else if (selectedRole.name.includes("Custom")) resolvedTemplate = "Custom";
      setRoleTemplate(resolvedTemplate);

      setPolicyName(policy.name || "");
      setPolicyDescription(policy.description || "");

      const permissions: ManagementResourceAccess[] = [];
      for (const entry of policy.entries || []) {
        for (const res of entry.resources || []) {
          permissions.push({
            resource: res,
            access: entry.access || [],
          });
        }
      }
      setResourcePermissions(permissions);
    }
  }, [selectedRole, policyQuery.data, formMode]);

  // Sync details for existing policies when adding a new one
  useEffect(() => {
    if (formMode === "add") {
      if (existingPolicyQuery.data) {
        const policy = existingPolicyQuery.data;
        setPolicyName(policy.name || "");
        setPolicyDescription(policy.description || "");

        const permissions: ManagementResourceAccess[] = [];
        for (const entry of policy.entries || []) {
          for (const res of entry.resources || []) {
            permissions.push({
              resource: res,
              access: entry.access || [],
            });
          }
        }
        setResourcePermissions(permissions);
      } else if (existingPolicyQuery.isSuccess && !existingPolicyQuery.data) {
        setResourcePermissions([]);
      }
    }
  }, [existingPolicyQuery.data, existingPolicyQuery.isSuccess, formMode]);

  // Pre-fill policy name on create flow
  useEffect(() => {
    if (formMode === "add" && !existingPolicyQuery.data && user) {
      const prefix =
        roleTemplate === "Admin"
          ? "Entity Admin"
          : roleTemplate === "Installer"
          ? "Entity Installer"
          : roleTemplate === "Support"
          ? "Entity Support"
          : "Entity Custom";

      setPolicyName(`${prefix} - ${user.email}`);
    }
  }, [roleTemplate, user, formMode, existingPolicyQuery.data]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: {
      scope: ManagementScope;
      entityId: string;
      venueId?: string;
      roleTemplate: ManagementRoleTemplate;
      policyName: string;
      policyDescription: string;
      resourcePermissions: ManagementResourceAccess[];
    }) =>
      assignUserAccess({
        access: [],
        entityId: data.entityId,
        resources: data.resourcePermissions.map((rp) => rp.resource),
        roleTemplate: data.roleTemplate,
        scope: data.scope,
        userEmail: user.email,
        userId: user.id,
        venueId: data.venueId || undefined,
        resourcePermissions: data.resourcePermissions,
        policyName: data.policyName,
        policyDescription: data.policyDescription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-management-roles", user.id] });
      setSelectedRoleId(null);
      setFormMode(null);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to save access policy.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (policyId: string) => deleteManagementPolicy({ policyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-management-roles", user.id] });
      setSelectedRoleId(null);
      setFormMode(null);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to delete access policy.");
    },
  });

  const handleSave = () => {
    if (!entityId) {
      setError("Please select an entity.");
      return;
    }
    if (scope === "venue" && !venueId) {
      setError("Please select a venue.");
      return;
    }
    if (!policyName.trim()) {
      setError("Policy name is required.");
      return;
    }

    if (resourcePermissions.length === 0) {
      setError("Please add at least one resource permission.");
      return;
    }

    for (const rp of resourcePermissions) {
      if (!rp.resource) {
        setError("Resource type must be selected for all permission rows.");
        return;
      }
      if (rp.access.length === 0) {
        setError(`Please select at least one permission level for resource "${rp.resource}".`);
        return;
      }
    }

    setError(null);
    saveMutation.mutate({
      scope,
      entityId,
      venueId: scope === "venue" ? venueId : undefined,
      roleTemplate,
      policyName: policyName.trim(),
      policyDescription: policyDescription.trim(),
      resourcePermissions,
    });
  };

  const handleDelete = (role: ManagementRoleApiResponse) => {
    if (!window.confirm(`Are you sure you want to delete the access policy mapping for ${role.name}?`)) {
      return;
    }
    const policyId = role.managementPolicyId || role.managementPolicy || "";
    deleteMutation.mutate(policyId);
  };

  const entitiesList = entitiesQuery.data || [];
  const venuesList = venuesQuery.data || [];
  const managementRoles = mRolesQuery.data || [];

  // Filter existing assignments
  const filteredRoles = managementRoles.filter((role) => {
    const ent = entitiesList.find((e: any) => e.id === role.entity);
    const entityName = ent?.name || role.entity;
    const nameMatch = entityName.toLowerCase().includes(searchQuery.toLowerCase());
    const policyMatch = role.name.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || policyMatch;
  });

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Split-screen layout matching mockup */}
      <div className="grid gap-6 lg:grid-cols-12 items-start mt-2">
        {/* Left panel: Assignments table and Configuration form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Existing Entity Access Assignments Section */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Existing Entity Access Assignments
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
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1"
                  onClick={() => {
                    setSelectedRoleId("new");
                    setFormMode("add");
                    setScope("entity");
                    setEntityId("");
                    setVenueId("");
                    setRoleTemplate("Admin");
                    setPolicyDescription("");
                    setResourcePermissions([]);
                    setError(null);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Create New Assignment
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Role Template</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mRolesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <LoadingState title="Loading assignments..." variant="section" rows={3} />
                      </TableCell>
                    </TableRow>
                  ) : filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-xs text-slate-500 py-6 italic">
                        No assignments found matching the search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => {
                      const ent = entitiesList.find((e: any) => e.id === role.entity);
                      const entityName = ent?.name || role.entity;
                      const isSelected = selectedRoleId === role.id;

                      let resolvedTemplate = "Admin";
                      if (role.name.includes("Installer")) resolvedTemplate = "Installer";
                      else if (role.name.includes("Support")) resolvedTemplate = "Support";
                      else if (role.name.includes("Custom")) resolvedTemplate = "Custom";

                      return (
                        <TableRow
                          key={role.id}
                          className={`cursor-pointer transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-900/50 ${
                            isSelected
                              ? "bg-blue-500/5 dark:bg-blue-500/10 border-l-2 border-l-blue-600 dark:border-l-blue-500"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedRoleId(role.id);
                            setFormMode("view");
                          }}
                        >
                          <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                            {entityName}
                            {isSelected && (
                              <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                {formMode === "edit" ? "Editing" : "Viewing"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                            {role.venue ? "Venue" : "Entity"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                            {resolvedTemplate}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                            <ResourceCount role={role} />
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                              Active
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="h-7 text-xs font-semibold text-blue-600 dark:text-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRoleId(role.id);
                                  setFormMode("view");
                                }}
                              >
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="h-7 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRoleId(role.id);
                                  setFormMode("edit");
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="h-7 text-xs font-semibold text-rose-500 hover:text-rose-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(role);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Policy Configuration Card */}
          {formMode ? (
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-4 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Policy Configuration
                  {formMode === "view" && <span className="ml-1.5 font-normal text-xs text-slate-500">(Read Only)</span>}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setSelectedRoleId(null);
                    setFormMode(null);
                  }}
                >
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              </div>

              {policyQuery.isLoading && (formMode === "edit" || formMode === "view") ? (
                <LoadingState title="Loading config details..." variant="section" rows={3} />
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Scope *</label>
                      {formMode === "edit" || formMode === "view" ? (
                        <Input
                          value={scope.charAt(0).toUpperCase() + scope.slice(1)}
                          disabled
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-80"
                        />
                      ) : (
                        <Select
                          value={scope}
                          onValueChange={(val) => {
                            setScope(val as ManagementScope);
                            setVenueId("");
                          }}
                          disabled={saveMutation.isPending}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entity">Entity</SelectItem>
                            <SelectItem value="venue">Venue</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Entity *</label>
                      {formMode === "edit" || formMode === "view" ? (
                        <Input
                          value={
                            entitiesList.find((e: any) => e.id === entityId)?.name ||
                            (selectedRole?.name ? selectedRole.name.split(" - ")[0] : "") ||
                            entityId
                          }
                          disabled
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-80"
                        />
                      ) : (
                        <Select value={entityId} onValueChange={setEntityId} disabled={saveMutation.isPending}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select entity" />
                          </SelectTrigger>
                          <SelectContent>
                            {entitiesList.map((ent: any) => (
                              <SelectItem key={ent.id} value={ent.id}>
                                {ent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {scope === "venue" && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Venue *</label>
                        {formMode === "edit" || formMode === "view" ? (
                          <Input
                            value={venuesList.find((v: any) => v.id === venueId)?.name || venueId}
                            disabled
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-80"
                          />
                        ) : (
                          <Select value={venueId} onValueChange={setVenueId} disabled={saveMutation.isPending}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select venue" />
                            </SelectTrigger>
                            <SelectContent>
                              {venuesList.map((ven: any) => (
                                  <SelectItem key={ven.id} value={ven.id}>
                                    {ven.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Role Template *</label>
                      <Select
                        value={roleTemplate}
                        onValueChange={(val) => setRoleTemplate(val as ManagementRoleTemplate)}
                        disabled={saveMutation.isPending || formMode === "view"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Installer">Installer</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Policy Name *</label>
                      <Input
                        value={policyName}
                        onChange={(e) => setPolicyName(e.target.value)}
                        disabled={saveMutation.isPending || formMode === "view"}
                        placeholder="Enter Policy Name"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Policy Description</label>
                      <Input
                        value={policyDescription}
                        onChange={(e) => setPolicyDescription(e.target.value)}
                        disabled={saveMutation.isPending || formMode === "view"}
                        placeholder="Optional description"
                      />
                    </div>
                  </div>

                  {/* Resource Permissions section */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
                    <div className="space-y-1 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          Resource Permissions
                        </h3>
                        <p className="text-xs text-slate-500">
                          Define access level per resource under the selected entity.
                        </p>
                      </div>
                      {formMode !== "view" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setResourcePermissions((prev) => [...prev, { resource: "", access: [] }]);
                          }}
                          disabled={saveMutation.isPending}
                        >
                          <Plus className="mr-1.5 h-4 w-4" /> Add Resource
                        </Button>
                      )}
                    </div>

                    {resourcePermissions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2 text-center border border-dashed rounded-lg p-4">
                        No resource permissions defined. Click Add Resource to add one.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="hidden sm:grid sm:grid-cols-12 text-xs font-semibold text-slate-500 px-3 pb-1 border-b">
                          <div className="col-span-3">Resource</div>
                          <div className="col-span-5">Description</div>
                          <div className="col-span-3">Policy</div>
                          <div className="col-span-1 text-right">Actions</div>
                        </div>

                        {resourcePermissions.map((rp, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-3 p-3 rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 sm:grid sm:grid-cols-12 sm:items-center sm:gap-2 px-3"
                          >
                            <div className="space-y-2 sm:col-span-3">
                              <span className="text-xs text-slate-400 font-medium block sm:hidden">Resource *</span>
                              <Select
                                value={rp.resource}
                                onValueChange={(val) => {
                                  setResourcePermissions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, resource: val } : item))
                                  );
                                }}
                                disabled={saveMutation.isPending || formMode === "view"}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select resource" />
                                </SelectTrigger>
                                <SelectContent>
                                  {resourceOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="text-xs text-slate-500 sm:col-span-5 px-1 truncate">
                              {resourceDescriptions[rp.resource] || "Custom resource configuration"}
                            </div>

                            <div className="space-y-2 sm:col-span-3">
                              <span className="text-xs text-slate-400 font-medium block sm:hidden">Policy *</span>
                              <InlineMultiSelect
                                options={permissionOptions}
                                selected={rp.access}
                                onChange={(nextSelected) => {
                                  setResourcePermissions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, access: nextSelected } : item))
                                  );
                                }}
                                disabled={saveMutation.isPending || formMode === "view"}
                              />
                            </div>

                            <div className="sm:col-span-1 text-right">
                              {formMode !== "view" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  className="text-rose-500 hover:text-rose-600"
                                  onClick={() => {
                                    setResourcePermissions((prev) => prev.filter((_, i) => i !== idx));
                                  }}
                                  disabled={saveMutation.isPending}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit form buttons */}
                  {formMode !== "view" && (
                    <div className="flex justify-end gap-2 border-t pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedRoleId(null);
                          setFormMode(null);
                        }}
                        disabled={saveMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleSave} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? "Saving..." : "Save Access Policy"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-500 text-xs bg-white">
              Select an assignment above to view or edit details, or click Create New Assignment to configure a new scope.
            </div>
          )}
        </div>

        {/* Right panel: Policy Overview Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-4 space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-2">
              Policy Overview
            </h3>

            {/* User details */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">User</span>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50">{user.name}</h4>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
              <div>
                <span className="text-slate-400 block">Total assignments</span>
                <span className="font-bold text-slate-850 dark:text-slate-50">{managementRoles.length}</span>
              </div>
              {formMode && (
                <div>
                  <span className="text-slate-400 block">Selected scope</span>
                  <span className="font-bold text-slate-850 dark:text-slate-50">{scope === "venue" ? "Venue" : "Entity"}</span>
                </div>
              )}
            </div>

            {/* Selected Entity Details */}
            {formMode && (
              <div className="space-y-2 text-xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Selected Assignment</span>
                <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-lg space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400">Selected Entity: </span>
                    <span className="font-bold">
                      {entitiesList.find((e: any) => e.id === entityId)?.name || entityId || "Not selected"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Scope Level: </span>
                    <span className="font-bold capitalize">{scope}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Role template: </span>
                    <span className="font-bold capitalize">{roleTemplate}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Other Assigned Entities */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Other Assigned Entities ({Math.max(0, managementRoles.length - (selectedRole ? 1 : 0))})
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {managementRoles.length <= 1 && !selectedRole ? (
                  <p className="text-[10px] text-slate-500 italic">No other entity mappings found.</p>
                ) : (
                  managementRoles
                    .filter((r) => r.id !== selectedRoleId)
                    .map((role) => {
                      const ent = entitiesList.find((e: any) => e.id === role.entity);
                      const entityName = ent?.name || role.entity;
                      let resolvedTemplate = "Admin";
                      if (role.name.includes("Installer")) resolvedTemplate = "Installer";
                      else if (role.name.includes("Support")) resolvedTemplate = "Support";
                      else if (role.name.includes("Custom")) resolvedTemplate = "Custom";

                      return (
                        <div
                          key={role.id}
                          className="flex items-center justify-between p-2 rounded border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="font-medium truncate max-w-[120px]">{entityName}</span>
                          <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            {resolvedTemplate}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Guidance Alert */}
            <div className="flex items-start gap-2.5 rounded-lg bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-600 dark:text-blue-400">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Users can hold different access policies across multiple entities. Review existing assignments to avoid duplication or privilege overlap.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

type InlineMultiSelectProps = {
  options: { label: string; value: ManagementAccessPermission }[];
  selected: ManagementAccessPermission[];
  onChange: (next: ManagementAccessPermission[]) => void;
  disabled?: boolean;
};

function InlineMultiSelect({ options, selected, onChange, disabled }: InlineMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 200);
    }
  }, [isOpen]);

  const handleToggleOption = (value: ManagementAccessPermission) => {
    let next: ManagementAccessPermission[];
    if (value === "FULL") {
      next = selected.includes("FULL") ? [] : ["FULL"];
    } else {
      next = selected.filter((p) => p !== "FULL");
      if (next.includes(value)) {
        next = next.filter((p) => p !== value);
      } else {
        next.push(value);
      }
    }
    onChange(next);
  };

  const handleRemoveOption = (value: ManagementAccessPermission, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((p) => p !== value));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={`flex min-h-8 w-full flex-wrap items-center justify-between gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs ring-offset-white cursor-pointer select-none dark:border-slate-800 dark:bg-slate-950 ${
          disabled ? "opacity-50 pointer-events-none" : "hover:border-slate-300"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 ? (
            <span className="text-slate-400">Select Policy</span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                {item}
                <button
                  type="button"
                  className="rounded hover:bg-slate-200 dark:hover:bg-slate-700 p-0.2"
                  onClick={(e) => handleRemoveOption(item, e)}
                  disabled={disabled}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-xs shadow-md dark:border-slate-800 dark:bg-slate-950 ${
            openUpwards ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {options.map((opt) => {
            const isChecked = selected.includes(opt.value);
            return (
              <div
                key={opt.value}
                className="flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 select-none text-slate-900 dark:text-slate-100"
                onClick={() => handleToggleOption(opt.value)}
              >
                <span>{opt.label}</span>
                {isChecked && <Check className="h-3.5 w-3.5 text-blue-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
