"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAssignableRoles } from "@/lib/mock-api/users";
import type { UserRole } from "@/types/rbac";
import type { User } from "@/types/user";

type AssignRoleProfileDialogProps = {
  user: User | null;
  currentUser: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignRoleProfileDialog({
  user,
  currentUser,
  open,
  onOpenChange,
}: AssignRoleProfileDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [submitted, setSubmitted] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ["assignable-roles", currentUser.id],
    enabled: open,
    queryFn: () => getAssignableRoles(currentUser),
  });

  if (!user) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedRole("");
          setSubmitted(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Role / Profile</DialogTitle>
          <DialogDescription>
            Mock-only role assignment flow. Higher authority than the actor is never exposed.
          </DialogDescription>
        </DialogHeader>

        {rolesQuery.isLoading ? (
          <LoadingState title="Loading assignable roles" variant="section" rows={3} />
        ) : rolesQuery.isError ? (
          <ErrorState error={rolesQuery.error} onRetry={() => void rolesQuery.refetch()} />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Assigned Scope
              </p>
              <p className="mt-1">{user.scopeAssignments[0]?.scopePath.map((item) => item.name).join(" / ") ?? "No scope"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Available Role / Profile</label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as UserRole)}
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

            <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-sm text-amber-900">
              Role/profile changes affect visible modules, actions, and scoped permission behavior.
            </div>

            {submitted ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Mock role assignment prepared for <strong>{user.name}</strong>
                {selectedRole ? ` as ${selectedRole.replaceAll("_", " ")}.` : "."}
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
            disabled={!selectedRole}
          >
            Assign Role / Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
