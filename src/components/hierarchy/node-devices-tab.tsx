"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants/routes";
import { getDevices } from "@/lib/mock-api/devices";
import { can } from "@/lib/rbac/can";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";

type NodeDevicesTabProps = {
  scopeId: string;
  user: User;
  selectedScope: SelectedScope | null;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function NodeDevicesTab({
  scopeId,
  user,
  selectedScope,
}: NodeDevicesTabProps) {
  const decision = can(user, "view", "devices", selectedScope);
  const query = useQuery({
    queryKey: ["hierarchy", "node-devices", scopeId, user.id],
    enabled: decision.allowed,
    queryFn: () => getDevices(scopeId, user),
  });

  if (!decision.allowed) {
    return <NoPermissionState description="You cannot view devices for this scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading devices" variant="table" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Device details are not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  if (!query.data?.length) {
    return (
      <EmptyState
        title="No infrastructure devices"
        description="Gateways, switches, and access points for this hierarchy node will appear here."
      />
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base text-slate-950">Scoped Devices</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Infrastructure devices within the selected hierarchy scope.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.devices}>Open Devices Module</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Firmware</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.map((device) => (
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
                <TableCell className="capitalize text-slate-700">
                  {device.status}
                </TableCell>
                <TableCell className="text-slate-700">
                  {device.assignment?.nodeName ?? "Unassigned"}
                </TableCell>
                <TableCell className="text-slate-700">
                  {device.firmware.currentVersion}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
