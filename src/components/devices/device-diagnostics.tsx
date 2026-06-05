"use client";

import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeviceDiagnostics } from "@/lib/mock-api/devices";
import type { User } from "@/types/user";
import { DeviceStatusBadge } from "./device-status-badge";

type DeviceDiagnosticsProps = {
  deviceId: string;
  user: User;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function DeviceDiagnostics({ deviceId, user }: DeviceDiagnosticsProps) {
  const query = useQuery({
    queryKey: ["device-diagnostics", deviceId, user.id],
    queryFn: () => getDeviceDiagnostics(deviceId, user),
  });

  if (query.isLoading) {
    return <LoadingState title="Loading diagnostics" variant="section" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Diagnostics are not available for this device." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  if (!query.data?.length) {
    return (
      <EmptyState
        title="No diagnostics available"
        description="Diagnostic events, uplink information, and error summaries will appear here."
      />
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.data.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium text-slate-900">{event.code}</p>
                <p className="text-sm text-slate-600">{event.message}</p>
              </div>
              <div className="space-y-2 text-right">
                <DeviceStatusBadge
                  status={event.severity === "critical" ? "critical" : event.severity === "warning" ? "warning" : "online"}
                />
                <p className="text-xs text-slate-500">{event.occurredAt}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
