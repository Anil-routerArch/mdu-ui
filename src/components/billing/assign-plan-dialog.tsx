"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { getCustomers } from "@/lib/mock-api/customers";
import type { BillingPlan } from "@/types/billing";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";

type AssignPlanDialogProps = {
  open: boolean;
  plan: BillingPlan | null;
  selectedScope: SelectedScope;
  user: User;
  onOpenChange: (open: boolean) => void;
};

export function AssignPlanDialog({
  open,
  plan,
  selectedScope,
  user,
  onOpenChange,
}: AssignPlanDialogProps) {
  const [targetCustomerId, setTargetCustomerId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const customersQuery = useQuery({
    queryKey: ["assign-plan-customers", selectedScope.nodeId, user.id],
    enabled: open,
    queryFn: () => getCustomers(selectedScope.nodeId, user),
  });

  const directChildren = useMemo(() => {
    const scopeDepth = selectedScope.path.length;
    return (customersQuery.data ?? []).filter(
      (customer) => customer.path.length === scopeDepth + 1,
    );
  }, [customersQuery.data, selectedScope.path.length]);

  const targetCustomer = directChildren.find((customer) => customer.id === targetCustomerId);

  if (!plan) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setTargetCustomerId("");
          setSubmitted(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Plan to Customer</DialogTitle>
          <DialogDescription>
            Mock-only assignment flow. Only permitted direct child customers are listed.
          </DialogDescription>
        </DialogHeader>

        {customersQuery.isLoading ? (
          <LoadingState title="Loading customers" variant="section" rows={3} />
        ) : customersQuery.isError ? (
          <ErrorState error={customersQuery.error} onRetry={() => void customersQuery.refetch()} />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Selected Plan
              </p>
              <p className="mt-1 font-medium text-slate-900">{plan.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                Sibling customers and unauthorized subscriptions remain hidden.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Direct Child Customer</label>
              <Select value={targetCustomerId} onValueChange={setTargetCustomerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select direct child customer" />
                </SelectTrigger>
                <SelectContent>
                  {directChildren.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-sm text-amber-900">
              Parent operators can assign plans only to permitted direct child customers or sub-operators.
            </div>

            {submitted ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Mock assignment prepared for <strong>{plan.name}</strong>
                {targetCustomer ? ` to ${targetCustomer.name}.` : "."}
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!targetCustomerId}
          >
            Assign Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
