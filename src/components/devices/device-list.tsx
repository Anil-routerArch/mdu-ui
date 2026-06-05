"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants/routes";
import { can } from "@/lib/rbac/can";
import type { Device, DeviceAction } from "@/types/device";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";
import { AssignDeviceDialog } from "./assign-device-dialog";
import { DeviceActionConfirmation } from "./device-action-confirmation";
import { DeviceStatusBadge } from "./device-status-badge";

type DeviceListProps = {
  devices: Device[];
  user: User;
  selectedScope: SelectedScope | null;
};

export function DeviceList({ devices, user, selectedScope }: DeviceListProps) {
  const [assignDevice, setAssignDevice] = useState<Device | null>(null);
  const [actionDevice, setActionDevice] = useState<Device | null>(null);
  const [action, setAction] = useState<DeviceAction | null>(null);

  const assignAllowed = useMemo(
    () => can(user, "assign", "devices", selectedScope).allowed,
    [selectedScope, user],
  );
  const executeAllowed = useMemo(
    () => can(user, "execute", "devices", selectedScope).allowed,
    [selectedScope, user],
  );

  if (!devices.length) {
    return (
      <EmptyState
        title="No infrastructure devices"
        description="Gateways, switches, and access points in the selected scope will appear here."
      />
    );
  }

  return (
    <>
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Device Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Firmware</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{device.name}</p>
                      <p className="text-xs text-slate-500">{device.serial}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-slate-700">
                    {device.type.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell>
                    <DeviceStatusBadge status={device.status} />
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {device.assignment?.nodeName ?? "Unassigned"}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {device.firmware.currentVersion}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {device.health.lastSeenAt ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={ROUTES.deviceDetail(device.id)}>View Detail</Link>
                      </Button>
                      {assignAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignDevice(device)}
                        >
                          Assign
                        </Button>
                      ) : null}
                      {executeAllowed ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActionDevice(device);
                              setAction("reboot");
                            }}
                          >
                            Reboot
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActionDevice(device);
                              setAction("upgrade_firmware");
                            }}
                          >
                            Upgrade
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActionDevice(device);
                              setAction("blink_led");
                            }}
                          >
                            Blink
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AssignDeviceDialog
        device={assignDevice}
        open={Boolean(assignDevice)}
        onOpenChange={(open) => {
          if (!open) {
            setAssignDevice(null);
          }
        }}
      />

      <DeviceActionConfirmation
        action={action}
        device={actionDevice}
        open={Boolean(action && actionDevice)}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
            setActionDevice(null);
          }
        }}
      />
    </>
  );
}
