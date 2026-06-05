"use client";

import { useState } from "react";

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
import type { BillingPlanType } from "@/types/billing";

type CreateBillingPlanWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type WizardStep = "type" | "details" | "pricing" | "review";

const steps: WizardStep[] = ["type", "details", "pricing", "review"];

export function CreateBillingPlanWizard({
  open,
  onOpenChange,
}: CreateBillingPlanWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState<BillingPlanType>("fixed_device");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cycle, setCycle] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [price, setPrice] = useState("0");
  const [deviceLimit, setDeviceLimit] = useState("250");
  const [pricePerConnection, setPricePerConnection] = useState("2.5");

  const step = steps[stepIndex];

  const reset = () => {
    setStepIndex(0);
    setSubmitted(false);
    setType("fixed_device");
    setName("");
    setDescription("");
    setCycle("monthly");
    setPrice("0");
    setDeviceLimit("250");
    setPricePerConnection("2.5");
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
          <DialogTitle>Create Billing Plan</DialogTitle>
          <DialogDescription>
            Mock-only multi-step plan creation. No persistent billing plan is created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          {step === "type" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Plan Type</label>
              <Select value={type} onValueChange={(value) => setType(value as BillingPlanType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_device">Fixed Device</SelectItem>
                  <SelectItem value="connection_based">Connection Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {step === "details" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Plan Name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Billing Cycle</label>
                <Select value={cycle} onValueChange={(value) => setCycle(value as "monthly" | "quarterly" | "annual")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
            </div>
          ) : null}

          {step === "pricing" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Price</label>
                <Input value={price} onChange={(event) => setPrice(event.target.value)} />
              </div>
              {type === "fixed_device" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Device Limit</label>
                  <Input
                    value={deviceLimit}
                    onChange={(event) => setDeviceLimit(event.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Price Per Connection
                  </label>
                  <Input
                    value={pricePerConnection}
                    onChange={(event) => setPricePerConnection(event.target.value)}
                  />
                </div>
              )}
            </div>
          ) : null}

          {step === "review" ? (
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-700 space-y-2">
              <p><span className="font-medium text-slate-900">Type:</span> {type.replaceAll("_", " ")}</p>
              <p><span className="font-medium text-slate-900">Name:</span> {name || "Not set"}</p>
              <p><span className="font-medium text-slate-900">Cycle:</span> {cycle}</p>
              <p><span className="font-medium text-slate-900">Price:</span> ${price}</p>
              <p>
                <span className="font-medium text-slate-900">Limits:</span>{" "}
                {type === "fixed_device"
                  ? `${deviceLimit} devices`
                  : `$${pricePerConnection} per connection`}
              </p>
            </div>
          ) : null}

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Mock billing plan draft prepared for <strong>{name || "Unnamed Plan"}</strong>.
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
            <Button type="button" onClick={() => setSubmitted(true)} disabled={!name.trim()}>
              Review Create
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
