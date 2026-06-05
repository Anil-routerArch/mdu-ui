"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/states";
import type { User } from "@/types/user";

type ResetPasswordConfirmationProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ResetPasswordConfirmation({
  user,
  open,
  onOpenChange,
}: ResetPasswordConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Reset password for ${user.name}`}
      description="This is a mock OWSEC password reset trigger only. No real authentication call is made."
      confirmLabel="Trigger Reset"
      impactItems={[
        "User will be prompted to complete a password reset in the real workflow",
        "Existing login sessions may be affected depending on policy",
      ]}
      isSubmitting={isSubmitting}
      onCancel={() => {
        setIsSubmitting(false);
        onOpenChange(false);
      }}
      onConfirm={() => {
        setIsSubmitting(true);
        window.setTimeout(() => {
          setIsSubmitting(false);
          onOpenChange(false);
        }, 600);
      }}
    />
  );
}
