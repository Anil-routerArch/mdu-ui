import { AlertTriangleIcon, ShieldAlertIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PermissionChangeImpactWarningProps = {
  affectedUsersCount: number;
  affectedScopes: string[];
  affectedModules: string[];
  confirmationMessage?: string;
};

export function PermissionChangeImpactWarning({
  affectedUsersCount,
  affectedScopes,
  affectedModules,
  confirmationMessage = "Review role and scope impact carefully before confirming permission changes.",
}: PermissionChangeImpactWarningProps) {
  return (
    <Card className="border border-amber-200/80 bg-amber-50/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlertIcon className="size-4 text-amber-700" />
          <CardTitle className="text-base text-amber-950">Permission Impact Warning</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-amber-900">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-amber-200/70 bg-white/70 p-3">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-4" />
              <span className="font-medium">Affected Users</span>
            </div>
            <p className="mt-2 text-lg font-semibold">{affectedUsersCount}</p>
          </div>
          <div className="rounded-xl border border-amber-200/70 bg-white/70 p-3">
            <p className="font-medium">Affected Scopes</p>
            <p className="mt-2 text-xs">{affectedScopes.join(", ") || "No scope summary"}</p>
          </div>
          <div className="rounded-xl border border-amber-200/70 bg-white/70 p-3">
            <p className="font-medium">Affected Modules</p>
            <p className="mt-2 text-xs">{affectedModules.join(", ") || "No module summary"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-amber-200/70 bg-amber-100/60 p-3">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          <p>{confirmationMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
}
