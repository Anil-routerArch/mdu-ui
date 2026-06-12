"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ConfirmationDialog } from "@/components/states";
import { triggerResetPassword } from "@/lib/mock-api/users";
import type { User } from "@/types/user";

type ResetPasswordConfirmationProps = {
  user: User | null;
  open: boolean;
  currentUser: User;
  onOpenChange: (open: boolean) => void;
};

export function ResetPasswordConfirmation({
  user,
  open,
  currentUser,
  onOpenChange,
}: ResetPasswordConfirmationProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => triggerResetPassword(user!.id, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to trigger password reset on OWSEC.");
    },
  });

  if (!user) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Reset password for ${user.name}`}
      description={
        error ? (
          <span className="text-rose-600 block mb-2">{error}</span>
        ) : (
          `Are you sure you want to trigger a password reset for ${user.email}?`
        )
      }
      confirmLabel="Trigger Reset"
      impactItems={[
        "User will be prompted to complete a password reset on next login attempt",
        "A secure recovery/action link will be registered inside OWSEC service",
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
