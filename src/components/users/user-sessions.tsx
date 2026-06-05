"use client";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
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
import { getUserSessions } from "@/lib/mock-api/users";
import { can } from "@/lib/rbac/can";
import type { User } from "@/types/user";

type UserSessionsProps = {
  userId: string;
  targetUser: User;
  currentUser: User;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function UserSessions({
  userId,
  targetUser,
  currentUser,
}: UserSessionsProps) {
  const scope = targetUser.scopeAssignments[0]?.scopePath ?? [];
  const viewDecision = can(
    currentUser,
    "view",
    { module: "users", ownerScopePath: scope },
    null,
  );

  const manageDecision = can(
    currentUser,
    "edit",
    { module: "users", ownerScopePath: scope },
    null,
  );

  const query = useQuery({
    queryKey: ["user-sessions", userId, currentUser.id],
    enabled: viewDecision.allowed,
    queryFn: () => getUserSessions(userId, currentUser),
  });

  if (!viewDecision.allowed) {
    return <NoPermissionState description="Session visibility is not available for this user." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading user sessions" variant="table" rows={3} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Session visibility is not available for this user." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const sessions = query.data ?? [];

  if (!sessions.length) {
    return (
      <EmptyState
        title="No visible sessions"
        description="No active or recorded sessions are visible for this user."
      />
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session / Device</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">{session.userAgent}</p>
                    <p className="text-xs text-slate-500">{session.ipAddress}</p>
                  </div>
                </TableCell>
                <TableCell className="text-slate-700">{session.lastActiveAt}</TableCell>
                <TableCell className="text-slate-700">
                  {session.revokedAt ? "Revoked" : session.current ? "Current" : "Active"}
                </TableCell>
                <TableCell>
                  {manageDecision.allowed ? (
                    <Button type="button" variant="outline" size="sm">
                      Revoke
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
