"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHierarchyTree } from "@/lib/mock-api/hierarchy";
import { getAssignableRoles } from "@/lib/mock-api/users";
import type { HierarchyNode, SelectedScope } from "@/types/hierarchy";
import type { UserRole } from "@/types/rbac";
import type { User } from "@/types/user";

type CreateUserFormProps = {
  open: boolean;
  selectedScope: SelectedScope;
  currentUser: User;
  onOpenChange: (open: boolean) => void;
};

function flattenNodes(nodes: HierarchyNode[]): HierarchyNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenNodes(node.children) : [])]);
}

export function CreateUserForm({
  open,
  selectedScope,
  currentUser,
  onOpenChange,
}: CreateUserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [scopeId, setScopeId] = useState(selectedScope.nodeId);
  const [submitted, setSubmitted] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ["create-user-assignable-roles", currentUser.id],
    enabled: open,
    queryFn: () => getAssignableRoles(currentUser),
  });

  const hierarchyQuery = useQuery({
    queryKey: ["create-user-hierarchy", currentUser.id],
    enabled: open,
    queryFn: () => getHierarchyTree(currentUser),
  });

  const targets = useMemo(
    () => (hierarchyQuery.data ? flattenNodes(hierarchyQuery.data.roots) : []),
    [hierarchyQuery.data],
  );

  const reset = () => {
    setName("");
    setEmail("");
    setRole("");
    setScopeId(selectedScope.nodeId);
    setSubmitted(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Mock-only user creation. No persistent user record is created in this phase.
          </DialogDescription>
        </DialogHeader>

        {rolesQuery.isLoading || hierarchyQuery.isLoading ? (
          <LoadingState title="Loading create-user dependencies" variant="section" rows={4} />
        ) : rolesQuery.isError || hierarchyQuery.isError ? (
          <ErrorState
            error={rolesQuery.error ?? hierarchyQuery.error}
            onRetry={() => {
              void rolesQuery.refetch();
              void hierarchyQuery.refetch();
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role / Profile</label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignable role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesQuery.data?.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Assigned Scope</label>
                <Select value={scopeId} onValueChange={setScopeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
            </div>

            {submitted ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Mock user draft prepared for <strong>{name || "Unnamed User"}</strong>.
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!name.trim() || !email.trim() || !role || !scopeId}
          >
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
