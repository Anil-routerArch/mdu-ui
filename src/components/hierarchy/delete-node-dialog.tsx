"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/states";
import type { HierarchyNode } from "@/types/hierarchy";

type DeleteNodeDialogProps = {
  open: boolean;
  node: HierarchyNode;
  configurationCount: number;
  deviceCount: number;
  onOpenChange: (open: boolean) => void;
};

export function DeleteNodeDialog({
  open,
  node,
  configurationCount,
  deviceCount,
  onOpenChange,
}: DeleteNodeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete ${node.name}`}
      description="This is a mock destructive flow only. No persistent delete happens in this phase."
      confirmLabel="Delete Node"
      cancelLabel="Cancel"
      variant="danger"
      isSubmitting={isSubmitting}
      impactItems={[
        `${node.metadata.childCount ?? node.children?.length ?? 0} child nodes may be affected`,
        `${deviceCount || node.metadata.deviceCount || 0} devices in this scope`,
        `${configurationCount} related configurations`,
      ]}
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
