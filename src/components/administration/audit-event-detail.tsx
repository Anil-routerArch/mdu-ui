"use client";

import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuditEventById } from "@/lib/mock-api/administration";
import type { User } from "@/types/user";
import { AdminStatusBadge } from "./admin-status-badge";

type AuditEventDetailProps = {
  eventId: string | null;
  currentUser: User;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function AuditEventDetail({ eventId, currentUser }: AuditEventDetailProps) {
  const query = useQuery({
    queryKey: ["audit-event", eventId ?? "none", currentUser.id],
    enabled: Boolean(eventId),
    queryFn: () => getAuditEventById(eventId!, currentUser),
  });

  if (!eventId) {
    return null;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading audit event" variant="section" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Audit event detail is not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const event = query.data;

  if (!event) {
    return (
      <ErrorState
        title="Audit event not available"
        description="The selected audit event could not be loaded."
      />
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base text-slate-950">Audit Event Detail</CardTitle>
        <AdminStatusBadge status={event.result} />
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2 text-sm text-slate-700">
        <div className="space-y-3">
          <div><span className="text-slate-500">Actor:</span> {event.actor}</div>
          <div><span className="text-slate-500">Action:</span> {event.action.replaceAll("_", " ")}</div>
          <div><span className="text-slate-500">Resource:</span> {event.resource}</div>
        </div>
        <div className="space-y-3">
          <div><span className="text-slate-500">Scope:</span> {event.scopeId}</div>
          <div><span className="text-slate-500">Result:</span> {event.result}</div>
          <div><span className="text-slate-500">Timestamp:</span> {event.occurredAt}</div>
        </div>
      </CardContent>
    </Card>
  );
}
