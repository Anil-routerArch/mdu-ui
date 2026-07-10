"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Eye } from "lucide-react";

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
import type { Operator } from "@/types/operator";
import type { User } from "@/types/user";
import type { SelectedScope } from "@/types/hierarchy";
import { EditOperatorForm } from "./edit-operator-form";
import { DeleteOperatorConfirmation } from "./delete-operator-confirmation";

type OperatorListProps = {
  operators: Operator[];
  currentUser: User;
  selectedScope: SelectedScope | null;
};

function formatSafeDate(timestamp: number): string {
  if (!timestamp) return "Never";
  let ms = timestamp;
  if (timestamp < 9466848000) {
    ms = timestamp * 1000;
  }
  if (ms < 946684800000 || ms > 4102444800000) {
    return "Never";
  }
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "Never";
  }
}

export function OperatorList({ operators, currentUser, selectedScope }: OperatorListProps) {
  const [editOperator, setEditOperator] = useState<Operator | null>(null);
  const [deleteOperator, setDeleteOperator] = useState<Operator | null>(null);

  const editAllowed = useMemo(
    () => can(currentUser, "edit", "operators", selectedScope).allowed,
    [currentUser, selectedScope]
  );
  const deleteAllowed = useMemo(
    () => can(currentUser, "delete", "operators", selectedScope).allowed,
    [currentUser, selectedScope]
  );

  return (
    <>
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Active Operators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operator Name</TableHead>
                <TableHead>Registration ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell className="font-medium text-slate-900">{operator.name}</TableCell>
                  <TableCell className="text-slate-700">{operator.registrationId}</TableCell>
                  <TableCell className="text-slate-600 max-w-[200px] truncate">
                    {operator.description || "-"}
                  </TableCell>
                  <TableCell className="text-slate-600">{formatSafeDate(operator.modified)}</TableCell>
                  <TableCell>
                    {operator.defaultOperator ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        Default
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={ROUTES.operatorDetail(operator.id)}>
                          <Eye className="mr-1 h-3.5 w-3.5" /> View Detail
                        </Link>
                      </Button>
                      {editAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditOperator(operator)}
                        >
                          <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                      ) : null}
                      {deleteAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => setDeleteOperator(operator)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
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

      <EditOperatorForm
        operator={editOperator}
        open={Boolean(editOperator)}
        onOpenChange={(open) => {
          if (!open) setEditOperator(null);
        }}
      />

      <DeleteOperatorConfirmation
        operator={deleteOperator}
        open={Boolean(deleteOperator)}
        onOpenChange={(open) => {
          if (!open) setDeleteOperator(null);
        }}
      />
    </>
  );
}
