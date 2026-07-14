"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X, ExternalLink } from "lucide-react";

import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { getAssignableRoles, createUser } from "@/lib/mock-api/users";
import { getOperators } from "@/lib/mock-api/operators";
import { AssignAccessForm } from "./assign-access-form";
import type { SelectedScope } from "@/types/hierarchy";
import type { UserRole } from "@/types/rbac";
import type { User } from "@/types/user";

type CreateUserFormProps = {
  open: boolean;
  selectedScope: SelectedScope;
  currentUser: User;
  onOpenChange: (open: boolean) => void;
};

export function CreateUserForm({
  open,
  selectedScope,
  currentUser,
  onOpenChange,
}: CreateUserFormProps) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"create" | "assign">("create");
  const [createdUser, setCreatedUser] = useState<{ id: string; email: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole | "">("");
  const [ownerOperatorId, setOwnerOperatorId] = useState("");
  const [changePassword, setChangePassword] = useState(true);
  const [emailValidation, setEmailValidation] = useState(true);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const rolesQuery = useQuery({
    queryKey: ["create-user-assignable-roles", currentUser.id],
    enabled: open && step === "create",
    queryFn: () => getAssignableRoles(currentUser),
  });

  const operatorsQuery = useQuery({
    queryKey: ["operators", currentUser.id],
    enabled: open && step === "create",
    queryFn: () => getOperators(),
  });

  const mutation = useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      role: UserRole;
      password?: string;
      changePassword?: boolean;
      emailValidation?: boolean;
      description?: string;
      note?: string;
      ownerOperatorId?: string;
    }) => createUser(data, currentUser),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      const canManageAccess = currentUser.profile.role === "root" || currentUser.profile.role === "admin";
      if (canManageAccess && newUser?.id) {
        setCreatedUser({ id: newUser.id, email: newUser.email });
        setStep("assign");
      } else {
        reset();
        onOpenChange(false);
      }
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create user on OWSEC.");
    },
  });

  const reset = () => {
    setStep("create");
    setCreatedUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setRole("");
    setOwnerOperatorId("");
    setChangePassword(true);
    setEmailValidation(true);
    setDescription("");
    setNote("");
    setError(null);
  };

  const handleCreate = () => {
    if (!name.trim() || !email.trim() || !role || !password.trim()) return;
    if (role !== "root" && !ownerOperatorId) {
      setError("Please select an operator for the user.");
      return;
    }
    setError(null);
    mutation.mutate({
      name: name.trim(),
      email: email.trim(),
      role: role as UserRole,
      password: password.trim(),
      changePassword,
      emailValidation,
      description: description.trim() || undefined,
      note: note.trim() || undefined,
      ownerOperatorId: role !== "root" ? ownerOperatorId : undefined,
    });
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
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto overflow-x-hidden" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {step === "create" ? "Create User" : "Assign Access Policy"}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {step === "create" && (
              <Button
                type="button"
                size="icon"
                className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                onClick={handleCreate}
                disabled={!name.trim() || !email.trim() || !role || !password.trim() || (role !== "root" && !ownerOperatorId) || mutation.isPending}
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={mutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {step === "create" ? (
          rolesQuery.isLoading || operatorsQuery.isLoading ? (
            <LoadingState title="Loading dependencies" variant="section" rows={4} />
          ) : rolesQuery.isError || operatorsQuery.isError ? (
            <ErrorState
              error={rolesQuery.error || operatorsQuery.error}
              onRetry={() => {
                void rolesQuery.refetch();
                void operatorsQuery.refetch();
              }}
            />
          ) : (
            <div className="space-y-4 pt-2">
              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role *</label>
                  <Select
                    value={role}
                    onValueChange={(value) => {
                      setRole(value as UserRole);
                      if (value === "root") {
                        setOwnerOperatorId("");
                      }
                    }}
                    disabled={mutation.isPending}
                  >
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
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Operator *</label>
                  <Select
                    value={ownerOperatorId}
                    onValueChange={setOwnerOperatorId}
                    disabled={mutation.isPending || role === "root"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorsQuery.data?.map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
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
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Force Password Change</label>
                  <div className="flex h-10 items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={changePassword}
                        onChange={(e) => setChangePassword(e.target.checked)}
                        className="peer sr-only"
                        disabled={mutation.isPending}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-rose-100 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-600 dark:peer-checked:bg-emerald-600 dark:peer-checked:border-emerald-700 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Validation</label>
                  <div className="flex h-10 items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={emailValidation}
                        onChange={(e) => setEmailValidation(e.target.checked)}
                        className="peer sr-only"
                        disabled={mutation.isPending}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-rose-100 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-600 dark:peer-checked:bg-emerald-600 dark:peer-checked:border-emerald-700 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <Input
                    placeholder="Optional description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    disabled={mutation.isPending}
                    className="placeholder:text-slate-400/50"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Note</label>
                  <Input
                    placeholder="Optional note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    disabled={mutation.isPending}
                    className="placeholder:text-slate-400/50"
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
          )
        ) : (
          <AssignAccessForm
            user={createdUser!}
            onBack={() => setStep("create")}
            onComplete={() => {
              reset();
              onOpenChange(false);
            }}
            initialEntityId={ownerOperatorId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
