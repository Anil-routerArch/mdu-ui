"use client";

import { useState } from "react";
import Link from "next/link";

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
import type { ConfigurationSet } from "@/types/config";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";
import { AssignConfigurationDialog } from "./assign-configuration-dialog";
import { ConfigurationStatusBadge } from "./configuration-status-badge";

type ConfigurationListProps = {
  configurations: ConfigurationSet[];
  user: User;
  selectedScope: SelectedScope | null;
};

export function ConfigurationList({
  configurations,
  user,
  selectedScope,
}: ConfigurationListProps) {
  const [assignConfiguration, setAssignConfiguration] = useState<ConfigurationSet | null>(null);

  const editAllowed = can(user, "edit", "configurations", selectedScope).allowed;
  const assignAllowed = can(user, "assign", "configurations", selectedScope).allowed;

  return (
    <>
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Config Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configurations.map((configuration) => (
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
                  <TableCell>
                    <ConfigurationStatusBadge status={configuration.status} />
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {configuration.assignmentCount} assignments
                  </TableCell>
                  <TableCell className="text-slate-700">{configuration.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={ROUTES.configurationDetail(configuration.id)}>View Detail</Link>
                      </Button>
                      {editAllowed ? (
                        <Button type="button" variant="outline" size="sm">
                          Edit
                        </Button>
                      ) : null}
                      {assignAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignConfiguration(configuration)}
                        >
                          Assign
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {assignAllowed ? (
        <AssignConfigurationDialog
          configuration={assignConfiguration}
          user={user}
          open={Boolean(assignConfiguration)}
          onOpenChange={(open) => {
            if (!open) {
              setAssignConfiguration(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
