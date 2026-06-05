"use client";

import { useMemo, useState } from "react";
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
import type { Customer } from "@/types/customer";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";
import { CustomerStatusBadge } from "./customer-status-badge";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import { SuspendCustomerDialog } from "./suspend-customer-dialog";

type CustomerListProps = {
  customers: Customer[];
  user: User;
  selectedScope: SelectedScope | null;
};

export function CustomerList({ customers, user, selectedScope }: CustomerListProps) {
  const [suspendCustomer, setSuspendCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  const editAllowed = useMemo(
    () => can(user, "edit", "customers", selectedScope).allowed,
    [selectedScope, user],
  );
  const suspendAllowed = useMemo(
    () => can(user, "edit", "customers", selectedScope).allowed,
    [selectedScope, user],
  );
  const deleteAllowed = useMemo(
    () => can(user, "delete", "customers", selectedScope).allowed,
    [selectedScope, user],
  );

  return (
    <>
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Customers / Sub-Operators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parent Scope</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-500">
                        {customer.path.map((item) => item.name).join(" / ")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-slate-700">
                    {customer.type.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell>
                    <CustomerStatusBadge status={customer.status} />
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {customer.path.slice(0, -1).map((item) => item.name).join(" / ") || "Root"}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {customer.billing.currentPlanName ?? "No active subscription"}
                  </TableCell>
                  <TableCell className="text-slate-700">{customer.summary.userCount}</TableCell>
                  <TableCell className="text-slate-700">{customer.summary.deviceCount}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={ROUTES.customerDetail(customer.id)}>View Detail</Link>
                      </Button>
                      {editAllowed ? (
                        <Button type="button" variant="outline" size="sm">
                          Edit
                        </Button>
                      ) : null}
                      {suspendAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSuspendCustomer(customer)}
                        >
                          Suspend
                        </Button>
                      ) : null}
                      {deleteAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteCustomer(customer)}
                        >
                          Delete
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

      <SuspendCustomerDialog
        customer={suspendCustomer}
        open={Boolean(suspendCustomer)}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendCustomer(null);
          }
        }}
      />

      <DeleteCustomerDialog
        customer={deleteCustomer}
        open={Boolean(deleteCustomer)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteCustomer(null);
          }
        }}
      />
    </>
  );
}
