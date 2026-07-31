"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { createDevice } from "@/lib/mock-api/devices";
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
  const queryClient = useQueryClient();
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType>("gateway");
  const [error, setError] = useState<string | null>(null);

  const scopeSummary = useMemo(
    () => selectedScope.path.map((item) => item.name).join(" / "),
    [selectedScope.path],
  );

  const mutation = useMutation({
    mutationFn: () =>
      createDevice(
        {
          serialNumber,
          deviceType,
          scopeId: selectedScope.nodeId,
          scopeType: selectedScope.nodeType,
        },
        {} as any
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      onOpenChange(false);
      reset();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to enroll device in Provisioning service.");
    },
  });

  const reset = () => {
    setSerialNumber("");
    setDeviceType("gateway");
    setError(null);
  };

  const handleAdd = () => {
    if (!serialNumber.trim()) return;
    setError(null);
    mutation.mutate();
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
            Enroll a new physical infrastructure device into the provisioning inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Target Scope</p>
            <p className="mt-1">{scopeSummary}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">MAC / Serial Number *</label>
            <Input
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              placeholder="e.g. 00:11:22:33:44:55 or 001122334455"
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Device Type</label>
            <Select
              value={deviceType}
              onValueChange={(value) => setDeviceType(value as DeviceType)}
              disabled={mutation.isPending}
            >
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!serialNumber.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
