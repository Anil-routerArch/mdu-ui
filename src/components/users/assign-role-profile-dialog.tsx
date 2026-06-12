"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { getAssignableRoles, updateUser } from "@/lib/mock-api/users";
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
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.profile.role);
    }
  }, [user, open]);

  const rolesQuery = useQuery({
    queryKey: ["assignable-roles", currentUser.id],
    enabled: open,
    queryFn: () => getAssignableRoles(currentUser),
  });

  const mutation = useMutation({
    mutationFn: (role: UserRole) => updateUser(user!.id, { role }, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to assign role on OWSEC.");
    },
  });

  const handleAssign = () => {
    if (!selectedRole || !user) return;
    setError(null);
    mutation.mutate(selectedRole as UserRole);
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedRole("");
          setError(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Role / Profile - {user.email}</DialogTitle>
          <DialogDescription>
            Change user permissions and role profile within OWSEC.
          </DialogDescription>
        </DialogHeader>

        {rolesQuery.isLoading ? (
          <LoadingState title="Loading assignable roles" variant="section" rows={3} />
        ) : rolesQuery.isError ? (
          <ErrorState error={rolesQuery.error} onRetry={() => void rolesQuery.refetch()} />
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}

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
                disabled={mutation.isPending}
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
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!selectedRole || mutation.isPending}
          >
            {mutation.isPending ? "Assigning..." : "Assign Role / Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
