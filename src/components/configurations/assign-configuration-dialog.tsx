"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { getHierarchyTree } from "@/lib/mock-api/hierarchy";
import type { ConfigurationSet } from "@/types/config";
import type { HierarchyNode } from "@/types/hierarchy";
import type { User } from "@/types/user";

type AssignConfigurationDialogProps = {
  configuration: ConfigurationSet | null;
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

function flattenNodes(nodes: HierarchyNode[]): HierarchyNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenNodes(node.children) : [])]);
}

export function AssignConfigurationDialog({
  configuration,
  user,
  open,
  onOpenChange,
}: AssignConfigurationDialogProps) {
  const [targetNodeId, setTargetNodeId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const hierarchyQuery = useQuery({
    queryKey: ["assign-configuration-targets", user.id],
    enabled: open,
    queryFn: () => getHierarchyTree(user),
  });

  const targets = useMemo(
    () => (hierarchyQuery.data ? flattenNodes(hierarchyQuery.data.roots) : []),
    [hierarchyQuery.data],
  );

  const selectedTarget = targets.find((target) => target.id === targetNodeId);

  if (!configuration) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setTargetNodeId("");
          setSubmitted(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Configuration</DialogTitle>
          <DialogDescription>
            Mock-only assignment flow. Only permitted hierarchy targets are listed.
          </DialogDescription>
        </DialogHeader>

        {hierarchyQuery.isLoading ? (
          <LoadingState title="Loading targets" variant="section" rows={3} />
        ) : hierarchyQuery.isError ? (
          isMockApiError(hierarchyQuery.error) &&
          hierarchyQuery.error.code === "BACKEND_UNAVAILABLE" ? (
            <BackendUnavailableState onRetry={() => void hierarchyQuery.refetch()} />
          ) : isMockApiError(hierarchyQuery.error) &&
            hierarchyQuery.error.code === "NO_PERMISSION" ? (
            <NoPermissionState description="Assignment targets are not available in this scope." />
          ) : (
            <ErrorState
              error={hierarchyQuery.error}
              onRetry={() => void hierarchyQuery.refetch()}
            />
          )
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Assignment Summary
              </p>
              <p className="mt-1 font-medium text-slate-900">{configuration.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                Current assignment count: {configuration.assignmentCount}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Target Scope / Node</label>
              <Select value={targetNodeId} onValueChange={setTargetNodeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a permitted target" />
                </SelectTrigger>
                <SelectContent>
                  {targets.map((target) => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.path.map((item) => item.name).join(" / ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-sm text-amber-900">
              Compatibility and operational impact must be validated before assignment in the
              real workflow. This mock flow only previews the requested change.
            </div>

            {submitted ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Mock assignment prepared for <strong>{configuration.name}</strong>
                {selectedTarget ? ` to ${selectedTarget.name}.` : "."}
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => setSubmitted(true)} disabled={!targetNodeId}>
            Assign Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
