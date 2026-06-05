"use client";

import { useMemo, useState } from "react";

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
import type { DeviceType } from "@/types/device";
import type { SelectedScope } from "@/types/hierarchy";

const deviceTypes: DeviceType[] = ["gateway", "switch", "access_point"];

type AddDeviceDialogProps = {
  open: boolean;
  selectedScope: SelectedScope;
  onOpenChange: (open: boolean) => void;
};

export function AddDeviceDialog({
  open,
  selectedScope,
  onOpenChange,
}: AddDeviceDialogProps) {
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType>("gateway");
  const [submitted, setSubmitted] = useState(false);

  const scopeSummary = useMemo(
    () => selectedScope.path.map((item) => item.name).join(" / "),
    [selectedScope.path],
  );

  const reset = () => {
    setSerialNumber("");
    setDeviceType("gateway");
    setSubmitted(false);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Device</DialogTitle>
          <DialogDescription>
            Mock infrastructure device enrollment. No persistence is performed yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Target Scope</p>
            <p className="mt-1">{scopeSummary}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Serial Number</label>
            <Input
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              placeholder="GW-123-ABC"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Device Type</label>
            <Select value={deviceType} onValueChange={(value) => setDeviceType(value as DeviceType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Mock add-device request captured for <strong>{serialNumber}</strong> as a{" "}
              <strong>{deviceType.replaceAll("_", " ")}</strong>.
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
            disabled={!serialNumber.trim()}
          >
            Add Device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
