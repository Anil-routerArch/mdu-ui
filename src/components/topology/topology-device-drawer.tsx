"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/lib/constants/routes";
import type { Device } from "@/types/device";

type TopologyDeviceDrawerProps = {
  device: Device | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TopologyDeviceDrawer({
  device,
  open,
  onOpenChange,
}: TopologyDeviceDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{device?.name ?? "Device Details"}</SheetTitle>
          <SheetDescription>
            Contextual device information from the topology workspace.
          </SheetDescription>
        </SheetHeader>

        {device ? (
          <div className="space-y-4 px-4 pb-4 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
              <p className="font-medium text-slate-900">{device.name}</p>
              <p className="mt-1 capitalize text-slate-600">
                {device.type.replaceAll("_", " ")} · {device.model}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-1 capitalize text-slate-900">{device.status}</p>
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Firmware</p>
                <p className="mt-1 text-slate-900">{device.firmware.currentVersion}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Assignment</p>
              <p className="mt-1 text-slate-900">{device.assignment?.nodeName ?? "Unassigned"}</p>
              <p className="mt-1 text-xs text-slate-500">
                {device.assignment?.path.map((item) => item.name).join(" / ") ?? "No scope path"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Health Summary</p>
              <p className="mt-1 text-slate-900">{device.health.summary}</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                <li>CPU: {device.health.cpuUsagePercent ?? 0}%</li>
                <li>Memory: {device.health.memoryUsagePercent ?? 0}%</li>
                <li>Latency: {device.health.latencyMs ?? 0} ms</li>
              </ul>
            </div>
          </div>
        ) : null}

        <SheetFooter>
          {device ? (
            <Button asChild variant="outline">
              <Link href={ROUTES.deviceDetail(device.id)}>Open Device Route</Link>
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
