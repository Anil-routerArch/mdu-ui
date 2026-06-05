import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingConflict } from "@/types/billing";
import { BillingStatusBadge } from "./billing-status-badge";

type BillingConflictStateProps = {
  conflict: BillingConflict;
  onDismiss?: () => void;
};

export function BillingConflictState({
  conflict,
  onDismiss,
}: BillingConflictStateProps) {
  return (
    <Card className="border border-rose-200/80 bg-rose-50/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="size-4 text-rose-700" />
          <CardTitle className="text-base text-rose-950">Billing Conflict</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-rose-900">
        <BillingStatusBadge status={conflict.code} />
        <p>{conflict.message}</p>
        {onDismiss ? (
          <Button type="button" variant="outline" onClick={onDismiss}>
            Close
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
