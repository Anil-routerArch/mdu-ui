"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { can } from "@/lib/rbac/can";
import type { Customer, CustomerSummary } from "@/types/customer";
import type { User } from "@/types/user";
import { CustomerBillingTab } from "./customer-billing-tab";
import { CustomerHealthSummary } from "./customer-health-summary";
import { CustomerUsersTab } from "./customer-users-tab";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import { SuspendCustomerDialog } from "./suspend-customer-dialog";

type CustomerWorkspaceProps = {
  customer: Customer;
  summary: CustomerSummary;
  user: User;
};

export function CustomerWorkspace({
  customer,
  summary,
  user,
}: CustomerWorkspaceProps) {
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const scope = {
    nodeId: customer.id,
    nodeType: customer.type,
    nodeName: customer.name,
    path: customer.path,
  } as const;

  const billingAllowed = can(user, "view", "billing", scope).allowed;
  const usersAllowed = can(user, "view", "users", scope).allowed;
  const suspendAllowed = can(user, "edit", "customers", scope).allowed;
  const deleteAllowed = can(user, "delete", "customers", scope).allowed;

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-base text-slate-950">Customer Workspace</CardTitle>
            <p className="text-sm text-slate-600">
              Scoped workspace for {customer.name}. Tabs are filtered by permission and scope.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {suspendAllowed ? (
              <Button type="button" variant="outline" onClick={() => setSuspendOpen(true)}>
                Suspend
              </Button>
            ) : null}
            {deleteAllowed ? (
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-slate-200 bg-transparent p-0"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {billingAllowed ? <TabsTrigger value="billing">Billing</TabsTrigger> : null}
          {usersAllowed ? <TabsTrigger value="users">Users</TabsTrigger> : null}
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <span className="text-slate-500">Type:</span> {customer.type.replaceAll("_", " ")}
                </div>
                <div>
                  <span className="text-slate-500">First Admin User:</span>{" "}
                  {customer.firstAdminUserId ?? "Not assigned"}
                </div>
                <div>
                  <span className="text-slate-500">Created:</span> {customer.createdAt}
                </div>
                <div>
                  <span className="text-slate-500">Updated:</span> {customer.updatedAt}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Scope Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <span className="text-slate-500">Path:</span>{" "}
                  {customer.path.map((item) => item.name).join(" / ")}
                </div>
                <div>
                  <span className="text-slate-500">Sites:</span> {summary.siteCount}
                </div>
                <div>
                  <span className="text-slate-500">Venues:</span> {summary.venueCount}
                </div>
                <div>
                  <span className="text-slate-500">Devices / Users:</span> {summary.deviceCount} /{" "}
                  {summary.userCount}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {billingAllowed ? (
          <TabsContent value="billing" className="pt-4">
            <CustomerBillingTab customer={customer} user={user} />
          </TabsContent>
        ) : null}

        {usersAllowed ? (
          <TabsContent value="users" className="pt-4">
            <CustomerUsersTab customer={customer} user={user} />
          </TabsContent>
        ) : null}

        <TabsContent value="health" className="pt-4">
          <CustomerHealthSummary customer={customer} summary={summary} />
        </TabsContent>
      </Tabs>

      <SuspendCustomerDialog
        customer={customer}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
      />
      <DeleteCustomerDialog
        customer={customer}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
