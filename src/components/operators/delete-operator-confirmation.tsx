"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ConfirmationDialog } from "@/components/states";
import { deleteOperator } from "@/lib/mock-api/operators";
import type { Operator } from "@/types/operator";

type DeleteOperatorConfirmationProps = {
  operator: Operator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function DeleteOperatorConfirmation({
  operator,
  open,
  onOpenChange,
  onSuccess,
}: DeleteOperatorConfirmationProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => deleteOperator(operator!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      queryClient.invalidateQueries({ queryKey: ["operator", operator?.id] });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to delete operator from Provisioning service.");
    },
  });

  if (!operator) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete Operator: ${operator.name}`}
      description={
        error ? (
          <span className="text-rose-600 block mb-2">{error}</span>
        ) : (
          `Are you sure you want to permanently delete operator "${operator.name}"? This action cannot be undone.`
        )
      }
      confirmLabel="Delete Operator"
      variant="danger"
      impactItems={[
        "The operator record will be permanently deleted from the Provisioning database",
        "All configuration overrides, default parameters, and metadata will be lost",
        "Associated subscriber information and assignments may be disrupted",
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
