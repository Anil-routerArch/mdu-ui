"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuditLogs } from "@/lib/mock-api/administration";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";
import { AdminStatusBadge } from "./admin-status-badge";
import { AuditEventDetail } from "./audit-event-detail";

type AuditLogsProps = {
  selectedScope: SelectedScope;
  currentUser: User;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function AuditLogs({ selectedScope, currentUser }: AuditLogsProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["audit-logs", selectedScope.nodeId, currentUser.id],
    queryFn: () => getAuditLogs(selectedScope.nodeId, currentUser),
  });

  if (query.isLoading) {
    return <LoadingState title="Loading audit logs" variant="table" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Audit logs are not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const auditLogs = query.data ?? [];

  if (!auditLogs.length) {
    return (
      <EmptyState
        title="No audit logs"
        description="No scoped audit events are visible for the selected administration scope."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((event) => (
                <TableRow
                  key={event.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <TableCell className="text-slate-700">{event.occurredAt}</TableCell>
                  <TableCell className="font-medium text-slate-900">{event.actor}</TableCell>
                  <TableCell className="text-slate-700">{event.action.replaceAll("_", " ")}</TableCell>
                  <TableCell className="text-slate-700">{event.resource}</TableCell>
                  <TableCell className="text-slate-700">{event.scopeId}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={event.result} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AuditEventDetail eventId={selectedEventId} currentUser={currentUser} />
    </div>
  );
}
