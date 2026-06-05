"use client";

import { useMemo } from "react";
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
import { getUsers } from "@/lib/mock-api/users";
import { can } from "@/lib/rbac/can";
import type { Customer } from "@/types/customer";
import type { User } from "@/types/user";

type CustomerUsersTabProps = {
  customer: Customer;
  user: User;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function CustomerUsersTab({ customer, user }: CustomerUsersTabProps) {
  const usersDecision = useMemo(
    () =>
      can(user, "view", "users", {
        nodeId: customer.id,
        nodeType: customer.type,
        nodeName: customer.name,
        path: customer.path,
      }),
    [customer, user],
  );

  const query = useQuery({
    queryKey: ["customer-users", customer.id, user.id],
    enabled: usersDecision.allowed,
    queryFn: () => getUsers(customer.id, user),
  });

  if (!usersDecision.allowed) {
    return <NoPermissionState description="Users are not visible for this customer scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading scoped users" variant="table" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Users are not visible for this customer scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const users = query.data ?? [];

  if (!users.length) {
    return (
      <EmptyState
        title="No users in this scope"
        description="Scoped users for this customer will appear here when available."
      />
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">Scoped Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Scope</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium text-slate-900">{candidate.name}</TableCell>
                <TableCell className="text-slate-700">{candidate.email}</TableCell>
                <TableCell className="text-slate-700">
                  {candidate.profile.role.replaceAll("_", " ")}
                </TableCell>
                <TableCell className="text-slate-700">{candidate.status}</TableCell>
                <TableCell className="text-slate-700">
                  {candidate.scopeAssignments[0]?.scopePath.map((item) => item.name).join(" / ") ??
                    "No scope"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
