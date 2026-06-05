"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/states";
import type { User } from "@/types/user";

type SuspendUserConfirmationProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SuspendUserConfirmation({
  user,
  open,
  onOpenChange,
}: SuspendUserConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Suspend ${user.name}`}
      description="This is a mock user suspension flow only. No persistent account change is performed."
      confirmLabel="Suspend User"
      variant="danger"
      impactItems={[
        "Active sessions may be revoked in the real workflow",
        "Operational access inside assigned scopes may be removed",
        "Role/profile assignments remain visible for audit purposes",
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
