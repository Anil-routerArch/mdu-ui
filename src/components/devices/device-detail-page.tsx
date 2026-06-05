"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { ConnectivityView } from "@/components/topology/connectivity-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDeviceById } from "@/lib/mock-api/devices";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import type { DeviceAction } from "@/types/device";
import { AssignDeviceDialog } from "./assign-device-dialog";
import { DeviceActionConfirmation } from "./device-action-confirmation";
import { DeviceDiagnostics } from "./device-diagnostics";
import { DeviceStatusBadge } from "./device-status-badge";

type DeviceDetailPageProps = {
  deviceId: string;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function DeviceDetailPage({ deviceId }: DeviceDetailPageProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [action, setAction] = useState<DeviceAction | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const query = useQuery({
    queryKey: ["device", deviceId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser),
    queryFn: () => getDeviceById(deviceId, currentUser!),
  });

  const executeAllowed = useMemo(() => {
    if (!currentUser) {
      return false;
    }

    return can(currentUser, "execute", "devices", selectedScope).allowed;
  }, [currentUser, selectedScope]);

  const assignAllowed = useMemo(() => {
    if (!currentUser) {
      return false;
    }

    return can(currentUser, "assign", "devices", selectedScope).allowed;
  }, [currentUser, selectedScope]);

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading device" variant="page" rows={5} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="This device is outside your permitted scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const device = query.data;

  if (!device) {
    return <ErrorState title="Device not available" description="The requested device could not be loaded." />;
  }

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl text-slate-950">{device.name}</CardTitle>
              <DeviceStatusBadge status={device.status} />
              <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700">
                {device.type.replaceAll("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{device.assignment?.path.map((item) => item.name).join(" / ") ?? "No assignment"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignAllowed ? (
              <Button type="button" variant="outline" onClick={() => setAssignOpen(true)}>
                Assign Device
              </Button>
            ) : null}
            {executeAllowed ? (
              <>
                <Button type="button" variant="outline" onClick={() => setAction("reboot")}>
                  Reboot
                </Button>
                <Button type="button" variant="outline" onClick={() => setAction("upgrade_firmware")}>
                  Upgrade
                </Button>
                <Button type="button" variant="outline" onClick={() => setAction("blink_led")}>
                  Blink
                </Button>
              </>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div><span className="text-slate-500">Serial:</span> {device.serial}</div>
                <div><span className="text-slate-500">Model:</span> {device.model}</div>
                <div><span className="text-slate-500">MAC:</span> {device.macAddress}</div>
                <div><span className="text-slate-500">Last Seen:</span> {device.health.lastSeenAt ?? "Unknown"}</div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Firmware & Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div><span className="text-slate-500">Current Version:</span> {device.firmware.currentVersion}</div>
                <div><span className="text-slate-500">Available Version:</span> {device.firmware.availableVersion ?? "None"}</div>
                <div><span className="text-slate-500">Upgrade Status:</span> {device.firmware.upgradeStatus.replaceAll("_", " ")}</div>
                <div><span className="text-slate-500">Health:</span> {device.health.summary}</div>
                <div><span className="text-slate-500">CPU / Memory:</span> {device.health.cpuUsagePercent ?? 0}% / {device.health.memoryUsagePercent ?? 0}%</div>
                <div><span className="text-slate-500">Latency:</span> {device.health.latencyMs ?? 0} ms</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnostics" className="pt-4">
          <DeviceDiagnostics deviceId={device.id} user={currentUser} />
        </TabsContent>

        <TabsContent value="connectivity" className="pt-4">
          <ConnectivityView scopeId={device.assignment?.nodeId ?? selectedScope?.nodeId ?? device.id} />
        </TabsContent>

        <TabsContent value="assignments" className="pt-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-950">Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div><span className="text-slate-500">Current Assignment:</span> {device.assignment?.nodeName ?? "Unassigned"}</div>
              <div><span className="text-slate-500">Scope Path:</span> {device.assignment?.path.map((item) => item.name).join(" / ") ?? "No scope path"}</div>
              <div><span className="text-slate-500">Assigned At:</span> {device.assignment?.assignedAt ?? "Unknown"}</div>
              {assignAllowed ? (
                <Button type="button" variant="outline" onClick={() => setAssignOpen(true)}>
                  Reassign Device
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {assignAllowed ? (
        <AssignDeviceDialog
          device={device}
          open={assignOpen}
          onOpenChange={setAssignOpen}
        />
      ) : null}

      {executeAllowed ? (
        <DeviceActionConfirmation
          action={action}
          device={device}
          open={Boolean(action)}
          onOpenChange={(open) => {
            if (!open) {
              setAction(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
