import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Subscription } from "@/types/billing";
import { BillingStatusBadge } from "./billing-status-badge";

type SubscriptionVisibilityDashboardProps = {
  subscriptions: Subscription[];
};

export function SubscriptionVisibilityDashboard({
  subscriptions,
}: SubscriptionVisibilityDashboardProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">Subscription Visibility</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Renews</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium text-slate-900">
                  {subscription.planName}
                </TableCell>
                <TableCell>
                  <BillingStatusBadge status={subscription.status} />
                </TableCell>
                <TableCell className="text-slate-700">
                  {subscription.scopePath.map((item) => item.name).join(" / ")}
                </TableCell>
                <TableCell className="text-slate-700">{subscription.startsAt}</TableCell>
                <TableCell className="text-slate-700">
                  {subscription.renewsAt ?? "Not scheduled"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
