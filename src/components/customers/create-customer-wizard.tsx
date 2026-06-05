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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBillingPlans } from "@/lib/mock-api/billing";
import { can } from "@/lib/rbac/can";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";

type CreateCustomerWizardProps = {
  open: boolean;
  selectedScope: SelectedScope;
  user: User;
  onOpenChange: (open: boolean) => void;
};

type WizardStep = "details" | "admin" | "billing" | "review";

const steps: WizardStep[] = ["details", "admin", "billing", "review"];

export function CreateCustomerWizard({
  open,
  selectedScope,
  user,
  onOpenChange,
}: CreateCustomerWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [tenantType, setTenantType] = useState<"customer" | "sub_operator">("customer");
  const [notes, setNotes] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [planId, setPlanId] = useState("");

  const billingDecision = useMemo(
    () => can(user, "view", "billing", selectedScope).allowed,
    [selectedScope, user],
  );

  const billingPlansQuery = useQuery({
    queryKey: ["create-customer-billing-plans", selectedScope.nodeId, user.id],
    enabled: open && billingDecision,
    queryFn: () => getBillingPlans(selectedScope.nodeId, user),
  });

  const step = steps[stepIndex];

  const reset = () => {
    setStepIndex(0);
    setSubmitted(false);
    setName("");
    setTenantType("customer");
    setNotes("");
    setAdminName("");
    setAdminEmail("");
    setPlanId("");
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Customer / Sub-Operator</DialogTitle>
          <DialogDescription>
            Mock-only multi-step flow. No persistent tenant creation is performed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Parent Scope
            </p>
            <p className="mt-1">{selectedScope.path.map((item) => item.name).join(" / ")}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {steps.map((item, index) => (
              <div
                key={item}
                className={`rounded-full border px-3 py-1 text-xs capitalize ${
                  index === stepIndex
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {step === "details" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tenant Name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Type</label>
                <Select value={tenantType} onValueChange={(value) => setTenantType(value as "customer" | "sub_operator")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="sub_operator">Sub-Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
              </div>
            </div>
          ) : null}

          {step === "admin" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Admin Name</label>
                <Input value={adminName} onChange={(event) => setAdminName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Admin Email</label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                />
              </div>
            </div>
          ) : null}

          {step === "billing" ? (
            billingDecision ? (
              billingPlansQuery.isLoading ? (
                <LoadingState title="Loading billing plans" variant="section" rows={3} />
              ) : billingPlansQuery.isError ? (
                <ErrorState error={billingPlansQuery.error} onRetry={() => void billingPlansQuery.refetch()} />
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Optional Billing Plan
                    </label>
                    <Select value={planId} onValueChange={setPlanId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a plan or skip this step" />
                      </SelectTrigger>
                      <SelectContent>
                        {billingPlansQuery.data?.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} · {plan.type.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-700">
                Billing assignment is not visible for this role. Continue without a plan.
              </div>
            )
          ) : null}

          {step === "review" ? (
            <div className="space-y-4 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">Name:</span> {name || "Not set"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Type:</span>{" "}
                {tenantType.replaceAll("_", " ")}
              </p>
              <p>
                <span className="font-medium text-slate-900">First Admin:</span>{" "}
                {adminName || "Not set"} {adminEmail ? `(${adminEmail})` : ""}
              </p>
              <p>
                <span className="font-medium text-slate-900">Billing Plan:</span>{" "}
                {planId || "None selected"}
              </p>
            </div>
          ) : null}

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Mock customer creation prepared for <strong>{name || "Unnamed Tenant"}</strong>.
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {stepIndex > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStepIndex(stepIndex - 1)}>
              Back
            </Button>
          ) : null}
          {stepIndex < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStepIndex(stepIndex + 1)}
              disabled={step === "details" && !name.trim()}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={!name.trim() || !adminName.trim() || !adminEmail.trim()}
            >
              Review Create
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
