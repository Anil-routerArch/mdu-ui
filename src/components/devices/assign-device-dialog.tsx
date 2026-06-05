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
import type { Device } from "@/types/device";

type AssignDeviceDialogProps = {
  device: Device | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignDeviceDialog({
  device,
  open,
  onOpenChange,
}: AssignDeviceDialogProps) {
  const [targetScope, setTargetScope] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!device) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setTargetScope("");
          setSubmitted(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Device</DialogTitle>
          <DialogDescription>
            Mock assignment flow only. No persistent device move or assignment is performed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current Assignment</p>
            <p className="mt-1 text-slate-900">{device.assignment?.nodeName ?? "Unassigned"}</p>
            <p className="mt-1 text-xs text-slate-500">
              {device.assignment?.path.map((item) => item.name).join(" / ") ?? "No scope path"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Target Node / Scope</label>
            <Input
              value={targetScope}
              onChange={(event) => setTargetScope(event.target.value)}
              placeholder="Enter target node or scope label"
            />
          </div>

          <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-sm text-amber-900">
            Assignment changes may affect topology placement, connectivity context, and inherited configurations.
          </div>

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Mock assignment prepared for <strong>{device.name}</strong> to <strong>{targetScope}</strong>.
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!targetScope.trim()}
          >
            Assign Device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
