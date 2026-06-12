"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ConfirmationDialog } from "@/components/states";
import { deleteUser } from "@/lib/mock-api/users";
import type { User } from "@/types/user";

type DeleteUserConfirmationProps = {
  user: User | null;
  open: boolean;
  currentUser: User;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function DeleteUserConfirmation({
  user,
  open,
  currentUser,
  onOpenChange,
  onSuccess,
}: DeleteUserConfirmationProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => deleteUser(user!.id, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to delete user on OWSEC.");
    },
  });

  if (!user) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete ${user.name}`}
      description={
        error ? (
          <span className="text-rose-600 block mb-2">{error}</span>
        ) : (
          `Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.`
        )
      }
      confirmLabel="Delete User"
      variant="danger"
      impactItems={[
        "The user account record will be permanently deleted from OWSEC database",
        "All active authentication tokens, API keys, and configurations will be revoked",
        "Assigned scope histories and profile credentials will be cleared",
      ]}
      isSubmitting={mutation.isPending}
      onCancel={() => {
        setError(null);
        onOpenChange(false);
      }}
      onConfirm={() => {
        setError(null);
        mutation.mutate();
      }}
    />
  );
}
