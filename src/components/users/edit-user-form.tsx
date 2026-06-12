"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X, ExternalLink } from "lucide-react";

import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { getAssignableRoles, updateUser } from "@/lib/mock-api/users";
import type { HierarchyNode, SelectedScope } from "@/types/hierarchy";
import type { UserRole } from "@/types/rbac";
import type { User } from "@/types/user";

type EditUserFormProps = {
  user: User | null;
  open: boolean;
  currentUser: User;
  onOpenChange: (open: boolean) => void;
};

function flattenNodes(nodes: HierarchyNode[]): HierarchyNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenNodes(node.children) : [])]);
}

export function EditUserForm({
  user,
  open,
  currentUser,
  onOpenChange,
}: EditUserFormProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync state with user details when modal opens
  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.profile.role);
      setDescription(user.description || "");
      setPassword("");
      setShowPassword(false);
      setNote("");
    }
  }, [user, open]);

  const rolesQuery = useQuery({
    queryKey: ["edit-user-assignable-roles", currentUser.id],
    enabled: open,
    queryFn: () => getAssignableRoles(currentUser),
  });

  const mutation = useMutation({
    mutationFn: (data: {
      name: string;
      role: UserRole;
      description?: string;
      password?: string;
      notes?: { note: string }[];
    }) => updateUser(user!.id, data, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to update user details on OWSEC.");
    },
  });

  const handleUpdate = () => {
    if (!name.trim() || !role || !user) return;
    setError(null);
    mutation.mutate({
      name,
      role: role as UserRole,
      description: description.trim() || undefined,
      password: password.trim() || undefined,
      notes: note.trim() ? [{ note: note.trim() }] : undefined,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">Edit User - {user.email}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              onClick={handleUpdate}
              disabled={!name.trim() || !role || mutation.isPending}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
              onClick={() => {
                onOpenChange(false);
              }}
              disabled={mutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {rolesQuery.isLoading ? (
          <LoadingState title="Loading assignable options" variant="section" rows={4} />
        ) : rolesQuery.isError ? (
          <ErrorState
            error={rolesQuery.error}
            onRetry={() => {
              void rolesQuery.refetch();
            }}
          />
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} disabled={mutation.isPending} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role / Profile</label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={mutation.isPending}>
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

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave empty to keep current password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={mutation.isPending}
                    className="pr-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <Input
                  placeholder="Optional description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={mutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Note</label>
                <Input
                  placeholder="Optional note update"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://openwifi.community"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
              >
                Password Policy <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
