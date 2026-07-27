"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Pencil, Trash2, Eye, ShieldCheck, AlertTriangle } from "lucide-react";

import { findNodeById } from "@/lib/mock-data/hierarchy";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import {
  getManagementPolicies,
  getEntities,
  getVenues,
  createManagementPolicy,
  updateManagementPolicy,
  deleteManagementPolicy,
  ManagementPolicyApiResponse,
  ManagementPolicyEntry,
  ManagementAccessPermission,
} from "@/lib/mock-api/management-access";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState, ErrorState, EmptyState, NoPermissionState } from "@/components/states";

const RESOURCES = ["entity", "venue", "configuration", "managementRole", "device"];
const ACCESS_LEVELS = ["NOACCESS", "READ", "CREATE", "MODIFY", "DELETE", "FULL"];

const resourceLabels: Record<string, string> = {
  entity: "Entity Settings",
  venue: "Venue Settings",
  configuration: "Configuration / Profiles",
  managementRole: "Roles & Policies",
  device: "Devices & Inventory",
};

type PolicyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  policy: ManagementPolicyApiResponse | null;
  entityId: string;
  venueId: string;
  onSuccess: () => void;
};


function PolicyFormDialog({
  open,
  onOpenChange,
  mode,
  policy,
  entityId: _entityId,
  venueId: _venueId,
  onSuccess,
}: PolicyFormDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(() => {
    if (mode === "create") return "";
    return policy?.name || "";
  });
  const [description, setDescription] = useState(() => {
    if (mode === "create") return "";
    return policy?.description || "";
  });
  const [preset, setPreset] = useState<"full" | "read" | "custom">((() => {
    if (mode === "create") return "full";
    const entries = policy?.entries || [];
    const isFull =
      entries.length === 1 &&
      entries[0].access?.includes("FULL") &&
      (entries[0].resources?.length === RESOURCES.length || entries[0].resources?.includes("*"));
    const isRead =
      entries.length === 1 &&
      entries[0].access?.includes("READ") &&
      (entries[0].resources?.length === RESOURCES.length || entries[0].resources?.includes("*"));

    if (isFull) return "full";
    if (isRead) return "read";
    return "custom";
  })());
  const [customAccess, setCustomAccess] = useState<Record<string, string>>((() => {
    const initialMapping: Record<string, string> = {
      entity: "READ",
      venue: "READ",
      configuration: "READ",
      managementRole: "READ",
      device: "READ",
    };
    if (mode === "create") return initialMapping;

    const entries = policy?.entries || [];
    const isFull =
      entries.length === 1 &&
      entries[0].access?.includes("FULL") &&
      (entries[0].resources?.length === RESOURCES.length || entries[0].resources?.includes("*"));
    const isRead =
      entries.length === 1 &&
      entries[0].access?.includes("READ") &&
      (entries[0].resources?.length === RESOURCES.length || entries[0].resources?.includes("*"));

    if (isFull) {
      initialMapping.entity = "FULL";
      initialMapping.venue = "FULL";
      initialMapping.configuration = "FULL";
      initialMapping.managementRole = "FULL";
      initialMapping.device = "FULL";
      return initialMapping;
    }
    if (isRead) return initialMapping;

    const mapping = {} as Record<string, string>;
    RESOURCES.forEach((r) => {
      mapping[r] = "NOACCESS";
    });
    entries.forEach((entry) => {
      const accessLvl = entry.access?.[0] || "NOACCESS";
      entry.resources?.forEach((res) => {
        if (RESOURCES.includes(res)) {
          mapping[res] = accessLvl;
        }
      });
    });
    return mapping;
  })());
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormError(null);
    }
    onOpenChange(isOpen);
  };

  const mutation = useMutation({
    mutationFn: async (payload: ManagementPolicyApiResponse) => {
      if (mode === "create") {
        return createManagementPolicy(payload);
      } else {
        return updateManagementPolicy(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies-list"] });
      onSuccess();
      handleOpenChange(false);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to save the management policy.");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      setFormError("Policy name is required.");
      return;
    }
    setFormError(null);

    let entries: ManagementPolicyEntry[] = [];
    if (preset === "full") {
      entries = [{ resources: RESOURCES, access: ["FULL" as ManagementAccessPermission] }];
    } else if (preset === "read") {
      entries = [{ resources: RESOURCES, access: ["READ" as ManagementAccessPermission] }];
    } else {
      const accessGroups: Record<string, string[]> = {};
      Object.entries(customAccess).forEach(([resource, access]) => {
        if (access !== "NOACCESS") {
          if (!accessGroups[access]) {
            accessGroups[access] = [];
          }
          accessGroups[access].push(resource);
        }
      });
      entries = Object.entries(accessGroups).map(([access, resources]) => ({
        resources,
        access: [access as ManagementAccessPermission],
      }));
    }

    const randomUUID = () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

    const payload: ManagementPolicyApiResponse = {
      id: mode === "create" ? randomUUID() : (policy?.id || ""),
      name: name.trim(),
      description: description.trim(),
      // prov-ui sends empty strings for entity/venue on create
      entity: mode === "create" ? "" : policy?.entity || "",
      venue: mode === "create" ? "" : policy?.venue || "",
      entries,
    };

    mutation.mutate(payload);
  };

  const isView = mode === "view";

  const getPermissionBadgeClass = (access: string) => {
    switch (access) {
      case "FULL":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
      case "MODIFY":
      case "CREATE":
        return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
      case "READ":
      case "LIST":
        return "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900";
      case "DELETE":
        return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {mode === "create"
              ? "Create Management Policy"
              : mode === "edit"
                ? "Edit Management Policy"
                : "View Management Policy"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {mode === "create"
              ? "Configure a new administrative access policy."
              : mode === "edit"
                ? "Modify your policy settings and access rules."
                : "Policy configuration overview."}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
            {formError}
          </div>
        )}

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Policy Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isView || mutation.isPending}
              placeholder="e.g. Operations Staff Access"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isView || mutation.isPending}
              placeholder="Provide a detailed description of the policy's target and purpose."
              className="resize-none h-20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Access Level Preset</label>
            <Select
              value={preset}
              onValueChange={(val: "full" | "read" | "custom") => setPreset(val)}
              disabled={isView || mutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select preset access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Access (All Permissions)</SelectItem>
                <SelectItem value="read">Read-Only (All View Permissions)</SelectItem>
                <SelectItem value="custom">Custom Permissions Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {preset === "custom" && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Resource Permissions Grid
              </p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {RESOURCES.map((res) => {
                  const access = customAccess[res] || "NOACCESS";
                  return (
                    <div key={res} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {resourceLabels[res] || res}
                      </span>
                      {isView ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPermissionBadgeClass(access)}`}>
                          {access}
                        </span>
                      ) : (
                        <Select
                          value={access}
                          onValueChange={(val: string) =>
                            setCustomAccess((prev) => ({ ...prev, [res]: val }))
                          }
                          disabled={mutation.isPending}
                        >
                          <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCESS_LEVELS.map((lvl) => (
                              <SelectItem key={lvl} value={lvl} className="text-xs">
                                {lvl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={mutation.isPending}
          >
            {isView ? "Close" : "Cancel"}
          </Button>
          {!isView && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
            >
              {mutation.isPending ? "Saving..." : "Save Policy"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DeletePolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: ManagementPolicyApiResponse | null;
  onSuccess: () => void;
};

function DeletePolicyDialog({ open, onOpenChange, policy, onSuccess }: DeletePolicyDialogProps) {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setDeleteError(null);
    }
    onOpenChange(isOpen);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!policy) return;
      return deleteManagementPolicy(policy.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies-list"] });
      onSuccess();
      handleOpenChange(false);
    },
    onError: (err: Error) => {
      setDeleteError(err.message || "Failed to delete the policy.");
    },
  });

  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            Delete Policy
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-2">
            Are you sure you want to permanently delete policy <strong>{policy.name}</strong>?
            This operation cannot be undone and will impact all users assigned to this policy.
          </DialogDescription>
        </DialogHeader>

        {deleteError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
            {deleteError}
          </div>
        )}

        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm transition-colors"
          >
            {mutation.isPending ? "Deleting..." : "Delete Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdministrationPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);

  // Dialog management
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPolicy, setSelectedPolicy] = useState<ManagementPolicyApiResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<ManagementPolicyApiResponse | null>(null);

  // Resolution of entity/venue scope IDs from selectedScope path
  const entityId = useMemo(() => {
    if (!selectedScope) return "";
    const selectedNode = findNodeById(selectedScope.nodeId);
    let eId = selectedNode?.metadata?.entityId || "";
    if (!eId && selectedScope.path) {
      for (let i = selectedScope.path.length - 1; i >= 0; i--) {
        const pathNode = findNodeById(selectedScope.path[i].id);
        if (pathNode?.metadata?.entityId) {
          eId = pathNode.metadata.entityId;
          break;
        }
      }
    }
    return eId;
  }, [selectedScope]);

  const venueId = useMemo(() => {
    if (!selectedScope) return "";
    if (selectedScope.nodeType === "venue") {
      return selectedScope.nodeId;
    }
    if (selectedScope.path) {
      for (let i = selectedScope.path.length - 1; i >= 0; i--) {
        if (selectedScope.path[i].type === "venue") {
          return selectedScope.path[i].id;
        }
      }
    }
    return "";
  }, [selectedScope]);

  // Root user check (prov-ui gating parity)
  const isRoot = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.profile.role === "root";
  }, [currentUser]);

  // Queries
  const policiesQuery = useQuery({
    queryKey: ["policies-list"],
    queryFn: () => getManagementPolicies(),
  });

  const entitiesQuery = useQuery({
    queryKey: ["entities-list"],
    queryFn: () => getEntities(),
  });

  const venuesQuery = useQuery({
    queryKey: ["venues-list"],
    queryFn: () => getVenues(),
  });

  const getEntityName = (id: string) => {
    const found = entitiesQuery.data?.find((e: { id: string; name: string }) => e.id === id);
    return found ? found.name : id;
  };

  const getVenueName = (id: string) => {
    if (!id) return "Entity-wide";
    const found = venuesQuery.data?.find((v: { id: string; name: string }) => v.id === id);
    return found ? found.name : id;
  };

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (!selectedScope) {
    return (
      <EmptyState
        title="No scope selected"
        description="Select a hierarchy scope to load administration data."
      />
    );
  }

  const queryError = policiesQuery.error ?? entitiesQuery.error ?? venuesQuery.error;
  const isLoading = policiesQuery.isLoading || entitiesQuery.isLoading || venuesQuery.isLoading;

  if (isLoading) {
    return <LoadingState title="Loading Management Policies" variant="page" rows={6} />;
  }

  if (queryError) {
    return <ErrorState error={queryError} onRetry={() => void policiesQuery.refetch()} />;
  }

  const policies = policiesQuery.data ?? [];

  return (
    <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Policies
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage system-wide administrative access policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void policiesQuery.refetch();
              void entitiesQuery.refetch();
              void venuesQuery.refetch();
            }}
            disabled={policiesQuery.isFetching}
            className="text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${policiesQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {isRoot && (
            <Button
              size="sm"
              onClick={() => {
                setFormMode("create");
                setSelectedPolicy(null);
                setFormOpen(true);
              }}
              style={{ backgroundColor: "var(--mdu-primary)", color: "#ffffff" }}
              className="shadow-sm font-medium transition-colors hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          )}
        </div>
      </div>

      {isRoot && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 text-sm text-blue-800 dark:text-blue-300">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="font-semibold">Root Administrator Controls Enabled:</span> You have full permissions to create, edit, or delete access policies for the selected scope.
          </div>
        </div>
      )}

      {policies.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950">
          <ShieldCheck className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-lg font-medium text-slate-950 dark:text-slate-50">No policies configured</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            No administrative policies exist for this scope. {isRoot && "Create one to get started."}
          </p>
          {isRoot && (
            <Button
              size="sm"
              onClick={() => {
                setFormMode("create");
                setSelectedPolicy(null);
                setFormOpen(true);
              }}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Policy
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-900/70">
              <TableRow className="border-slate-100 dark:border-slate-900">
                <TableHead className="w-1/4 font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                <TableHead className="w-1/5 font-semibold text-slate-700 dark:text-slate-300">Entity</TableHead>
                <TableHead className="w-1/5 font-semibold text-slate-700 dark:text-slate-300">Venue</TableHead>
                <TableHead className="w-2/5 font-semibold text-slate-700 dark:text-slate-300">Description</TableHead>
                <TableHead className="w-24 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow
                  key={policy.id}
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setFormMode(isRoot ? "edit" : "view");
                    setFormOpen(true);
                  }}
                  className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-900 transition-colors"
                >
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    {policy.name}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {getEntityName(policy.entity || "")}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {getVenueName(policy.venue || "")}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 line-clamp-1 py-4">
                    {policy.description || "—"}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {isRoot ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setFormMode("edit");
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
                            onClick={() => {
                              setPolicyToDelete(policy);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setFormMode("view");
                            setFormOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {formOpen && (
        <PolicyFormDialog
          key={`${formMode}-${selectedPolicy?.id || "new"}`}
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={formMode}
          policy={selectedPolicy}
          entityId={entityId}
          venueId={venueId}
          onSuccess={() => void policiesQuery.refetch()}
        />
      )}

      <DeletePolicyDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        policy={policyToDelete}
        onSuccess={() => void policiesQuery.refetch()}
      />
    </div>
  );
}
