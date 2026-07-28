"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ConfirmationDialog } from "@/components/states";
import { deleteCustomer } from "@/lib/mock-api/customers";
import type { Customer } from "@/types/customer";

type DeleteCustomerDialogProps = {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function DeleteCustomerDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCustomerDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => deleteCustomer(customer!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", customer?.id] });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to delete entity from Provisioning service.");
    },
  });

  if (!customer) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete Entity: ${customer.name}`}
      description={
        error ? (
          <span className="text-rose-600 block mb-2">{error}</span>
        ) : (
          `Are you sure you want to permanently delete entity "${customer.name}"? This action cannot be undone.`
        )
      }
      confirmLabel="Delete Entity"
      variant="danger"
      impactItems={[
        "The entity will be permanently deleted from the Provisioning database",
        "All nested locations, venues, and device configurations will be lost",
        "Assigned infrastructure devices under this entity must be reassigned",
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
