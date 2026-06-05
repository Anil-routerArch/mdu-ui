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
import { getConfigurations } from "@/lib/mock-api/configurations";
import { can } from "@/lib/rbac/can";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";

type NodeConfigurationsTabProps = {
  scopeId: string;
  user: User;
  selectedScope: SelectedScope | null;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function NodeConfigurationsTab({
  scopeId,
  user,
  selectedScope,
}: NodeConfigurationsTabProps) {
  const viewDecision = can(user, "view", "configurations", selectedScope);
  const assignDecision = can(user, "assign", "configurations", selectedScope);
  const query = useQuery({
    queryKey: ["hierarchy", "node-configurations", scopeId, user.id],
    enabled: viewDecision.allowed,
    queryFn: () => getConfigurations(scopeId, user),
  });

  if (!viewDecision.allowed) {
    return <NoPermissionState description="You cannot view configurations for this scope." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading configurations" variant="table" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return <NoPermissionState description="Configuration details are not available in this scope." />;
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  if (!query.data?.length) {
    return (
      <EmptyState
        title="No configurations"
        description="Assigned or inherited configuration sets for this node will appear here."
      />
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base text-slate-950">Scoped Configurations</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Configuration sets relevant to the selected hierarchy node.
          </CardDescription>
        </div>
        {assignDecision.allowed ? (
          <Button type="button" variant="outline" size="sm">
            Assign Configuration
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.map((configuration) => (
              <TableRow key={configuration.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">{configuration.name}</p>
                    <p className="text-xs text-slate-500">
                      {configuration.description ?? "No description"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-slate-700">
                  v{configuration.currentVersion.version}
                </TableCell>
                <TableCell className="capitalize text-slate-700">
                  {configuration.status}
                </TableCell>
                <TableCell className="text-slate-700">
                  {configuration.assignmentCount}
                </TableCell>
                <TableCell className="text-slate-700">{configuration.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
