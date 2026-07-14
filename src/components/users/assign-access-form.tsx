"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Info, ChevronDown, Check, X } from "lucide-react";

import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assignUserAccess,
  getEntities,
  getVenues,
  getManagementPolicyById,
  getManagementRoleForUserEntity,
  ManagementScope,
  ManagementRoleTemplate,
  ManagementAccessPermission,
  ManagementResourceAccess,
  ManagementRoleApiResponse,
  getTemplateAccess,
} from "@/lib/mock-api/management-access";

type AssignAccessFormProps = {
  user: {
    id: string;
    email: string;
  };
  onBack: () => void;
  onComplete: () => void;
  initialEntityId?: string;
  editingRole?: ManagementRoleApiResponse | null;
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

export function AssignAccessForm({
  user,
  onBack,
  onComplete,
  initialEntityId,
  editingRole,
}: AssignAccessFormProps) {
  const isEditMode = Boolean(editingRole);

  const [scope, setScope] = useState<ManagementScope>("entity");
  const [entityId, setEntityId] = useState(initialEntityId || "");
  const [venueId, setVenueId] = useState("");
  const [roleTemplate, setRoleTemplate] = useState<ManagementRoleTemplate>("Admin");
  const [policyName, setPolicyName] = useState("");
  const [policyDescription, setPolicyDescription] = useState("");
  const [resourcePermissions, setResourcePermissions] = useState<ManagementResourceAccess[]>([]);
  const [error, setError] = useState<string | null>(null);

  const entitiesQuery = useQuery({
    queryKey: ["entities-list"],
    queryFn: () => getEntities(),
  });

  const venuesQuery = useQuery({
    queryKey: ["venues-list"],
    queryFn: () => getVenues(),
    enabled: scope === "venue",
  });

  // Query policy details if editing
  const editingPolicyId = editingRole?.managementPolicyId || editingRole?.managementPolicy || "";
  const policyQuery = useQuery({
    queryKey: ["policy-detail", editingPolicyId],
    queryFn: () => getManagementPolicyById({ policyId: editingPolicyId }),
    enabled: isEditMode && Boolean(editingPolicyId),
  });

  // Auto-fetch policy on user/entity selection for creation flow
  const existingPolicyQuery = useQuery({
    queryKey: ["user-entity-policy", user.id, entityId, scope, venueId],
    enabled: !isEditMode && Boolean(entityId),
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

  // Set initial state for Edit Mode once policy details are loaded
  useEffect(() => {
    if (isEditMode && editingRole && policyQuery.data) {
      const policy = policyQuery.data;
      setScope(editingRole.venue ? "venue" : "entity");
      setEntityId(editingRole.entity || "");
      setVenueId(editingRole.venue || "");
      
      let resolvedTemplate: ManagementRoleTemplate = "Admin";
      if (editingRole.name.includes("Installer")) resolvedTemplate = "Installer";
      else if (editingRole.name.includes("Support")) resolvedTemplate = "Support";
      else if (editingRole.name.includes("Custom")) resolvedTemplate = "Custom";
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
  }, [isEditMode, editingRole, policyQuery.data]);

  // Handle existing policy auto-loading during creation mode
  useEffect(() => {
    if (!isEditMode) {
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
        // Keep resourcePermissions empty as requested
        setResourcePermissions([]);
      }
    }
  }, [existingPolicyQuery.data, existingPolicyQuery.isSuccess, isEditMode]);

  // Pre-fill policy name based on role template & user email (only if creating a new assignment and no existing policy is loaded)
  useEffect(() => {
    if (!isEditMode && !existingPolicyQuery.data) {
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
  }, [roleTemplate, user.email, isEditMode, existingPolicyQuery.data]);

  const mutation = useMutation({
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
      onComplete();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to assign access policy.");
    },
  });

  const handleAddResource = () => {
    setResourcePermissions((prev) => [...prev, { resource: "", access: [] }]);
  };

  const handleRemoveResource = (index: number) => {
    setResourcePermissions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResourceChange = (index: number, resource: string) => {
    setResourcePermissions((prev) =>
      prev.map((rp, i) => (i === index ? { ...rp, resource } : rp))
    );
  };

  const handlePermissionToggle = (
    index: number,
    permission: ManagementAccessPermission,
    checked: boolean
  ) => {
    setResourcePermissions((prev) =>
      prev.map((rp, i) => {
        if (i !== index) return rp;
        let nextAccess = [...rp.access];
        if (checked) {
          if (permission === "FULL") {
            nextAccess = ["FULL"];
          } else {
            nextAccess = nextAccess.filter((p) => p !== "FULL");
            if (!nextAccess.includes(permission)) {
              nextAccess.push(permission);
            }
          }
        } else {
          nextAccess = nextAccess.filter((p) => p !== permission);
        }
        return { ...rp, access: nextAccess };
      })
    );
  };

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
    mutation.mutate({
      scope,
      entityId,
      venueId: scope === "venue" ? venueId : undefined,
      roleTemplate,
      policyName: policyName.trim(),
      policyDescription: policyDescription.trim(),
      resourcePermissions,
    });
  };

  if (entitiesQuery.isLoading || (isEditMode && policyQuery.isLoading)) {
    return <LoadingState title="Loading details..." variant="section" rows={3} />;
  }

  if (entitiesQuery.isError || (isEditMode && policyQuery.isError)) {
    return (
      <ErrorState
        error={entitiesQuery.error || policyQuery.error}
        onRetry={() => {
          void entitiesQuery.refetch();
          void policyQuery.refetch();
        }}
      />
    );
  }

  const entitiesList = entitiesQuery.data || [];
  const venuesList = venuesQuery.data || [];

  return (
    <div className="space-y-4 pt-2">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Info Alert Box matching owprov-ui style */}
      {!isEditMode && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-600 dark:text-blue-400">
          <Info className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold">User created</h4>
            <p className="mt-0.5">
              Configure the management policy for <span className="font-semibold">{user.email}</span> before closing this flow.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Scope *</label>
          {isEditMode ? (
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
              disabled={mutation.isPending}
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Entity *</label>
          {isEditMode ? (
            <Input
              value={
                entitiesList.find((e: any) => e.id === entityId)?.name ||
                (editingRole && editingRole.name ? editingRole.name.split(" - ")[0] : "") ||
                entityId
              }
              disabled
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-80"
            />
          ) : (
            <Select value={entityId} onValueChange={setEntityId} disabled={mutation.isPending}>
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Venue *</label>
            {isEditMode ? (
              <Input
                value={venuesList.find((v: any) => v.id === venueId)?.name || venueId}
                disabled
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-80"
              />
            ) : (
              <Select value={venueId} onValueChange={setVenueId} disabled={mutation.isPending}>
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role Template *</label>
          <Select
            value={roleTemplate}
            onValueChange={(val) => setRoleTemplate(val as ManagementRoleTemplate)}
            disabled={mutation.isPending}
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Policy Name *</label>
          <Input
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            disabled={mutation.isPending}
            placeholder="Enter Policy Name"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Policy Description</label>
          <Input
            value={policyDescription}
            onChange={(e) => setPolicyDescription(e.target.value)}
            disabled={mutation.isPending}
            placeholder="Optional description"
          />
        </div>
      </div>

      {/* Resource Permissions section always rendered */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Resource Permissions
          </h3>
          <p className="text-xs text-slate-500">
            Configure access per resource. Existing policies are loaded automatically.
          </p>
        </div>

        {resourcePermissions.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No resource permissions defined. Click Add Resource to add one.</p>
        ) : (
          <div className="space-y-3">
            {resourcePermissions.map((rp, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 p-3 rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2 flex-1">
                  <span className="text-xs text-slate-400 font-medium block sm:hidden">Resource *</span>
                  <Select
                    value={rp.resource}
                    onValueChange={(val) => handleResourceChange(idx, val)}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger className="w-full sm:w-48">
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

                <div className="flex-1 space-y-2">
                  <span className="text-xs text-slate-400 font-medium block sm:hidden">Policy *</span>
                  <InlineMultiSelect
                    options={permissionOptions}
                    selected={rp.access}
                    onChange={(nextSelected) => {
                      setResourcePermissions((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, access: nextSelected } : item))
                      );
                    }}
                    disabled={mutation.isPending}
                  />
                </div>

                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5"
                    onClick={() => handleRemoveResource(idx)}
                    disabled={mutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={handleAddResource}
          disabled={mutation.isPending}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Resource
        </Button>
      </div>

      {/* Info status text block at the bottom */}
      <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
        <p>User: <span className="font-semibold">{user.email}</span></p>
        <p>Access is loaded automatically for the selected entity and venue.</p>
        {!isEditMode && entityId && (
          <p className="mt-1">
            {existingPolicyQuery.isLoading ? (
              <span className="text-blue-500">Checking existing policies...</span>
            ) : existingPolicyQuery.data ? (
              <span className="text-emerald-600 font-medium">Policy found for this user. Submit will update it.</span>
            ) : (
              <span className="text-amber-600 font-medium">No policy found for this user. Submit will create one.</span>
            )}
          </p>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={mutation.isPending}>
          Back to List
        </Button>
        <Button type="button" onClick={handleSave} disabled={mutation.isPending}>
          {isEditMode ? "Update Access" : "Assign Access"}
        </Button>
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

// Premium inline multi-select mimicking standard select controls in Next.js/React
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
        className={`flex min-h-10 w-full flex-wrap items-center justify-between gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm ring-offset-white cursor-pointer select-none dark:border-slate-800 dark:bg-slate-950 ${
          disabled ? "opacity-50 pointer-events-none" : "hover:border-slate-300"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5">
          {selected.length === 0 ? (
            <span className="text-slate-500">Select Policy</span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                {item}
                <button
                  type="button"
                  className="rounded hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5"
                  onClick={(e) => handleRemoveOption(item, e)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-sm shadow-md dark:border-slate-800 dark:bg-slate-950 ${
            openUpwards ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {options.map((opt) => {
            const isChecked = selected.includes(opt.value);
            return (
              <div
                key={opt.value}
                className="flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 select-none text-slate-900 dark:text-slate-100"
                onClick={() => handleToggleOption(opt.value)}
              >
                <span>{opt.label}</span>
                {isChecked && <Check className="h-4 w-4 text-blue-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
