"use client";

import { useState } from "react";

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
import type { BillingPlan, Subscription } from "@/types/billing";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";
import { AssignPlanDialog } from "./assign-plan-dialog";
import { BillingPlanDetail } from "./billing-plan-detail";
import { BillingStatusBadge } from "./billing-status-badge";

type BillingPlanListProps = {
  plans: BillingPlan[];
  subscriptions: Subscription[];
  selectedScope: SelectedScope;
  user: User;
  canEdit?: boolean;
  canAssign?: boolean;
};

function formatLimits(plan: BillingPlan) {
  return plan.type === "fixed_device"
    ? `${plan.deviceLimit ?? "N/A"} devices`
    : `$${plan.pricePerConnection ?? 0}/connection`;
}

export function BillingPlanList({
  plans,
  subscriptions,
  selectedScope,
  user,
  canEdit = false,
  canAssign = false,
}: BillingPlanListProps) {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(plans[0] ?? null);
  const [assignPlan, setAssignPlan] = useState<BillingPlan | null>(null);

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Billing Plan List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Subscriptions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => {
                const relatedSubscriptions = subscriptions.filter(
                  (subscription) => subscription.planId === plan.id,
                );

                return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium text-slate-900">{plan.name}</TableCell>
                    <TableCell className="text-slate-700">
                      {plan.type.replaceAll("_", " ")}
                    </TableCell>
                    <TableCell>
                      <BillingStatusBadge status={plan.status} />
                    </TableCell>
                    <TableCell className="text-slate-700">{plan.billingCycle}</TableCell>
                    <TableCell className="text-slate-700">${plan.price}</TableCell>
                    <TableCell className="text-slate-700">{formatLimits(plan)}</TableCell>
                    <TableCell className="text-slate-700">
                      {relatedSubscriptions.length}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          View Detail
                        </Button>
                        {canEdit ? (
                          <>
                            <Button type="button" variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button type="button" variant="outline" size="sm">
                              {plan.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                          </>
                        ) : null}
                        {canAssign ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAssignPlan(plan)}
                          >
                            Assign to Customer
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BillingPlanDetail
        plan={selectedPlan}
        subscriptions={subscriptions}
        readOnly={!canEdit}
      />

      <AssignPlanDialog
        open={Boolean(assignPlan)}
        plan={assignPlan}
        selectedScope={selectedScope}
        user={user}
        onOpenChange={(open) => {
          if (!open) {
            setAssignPlan(null);
          }
        }}
      />
    </div>
  );
}
