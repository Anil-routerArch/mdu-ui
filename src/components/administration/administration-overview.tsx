import { ClipboardListIcon, ShieldIcon, SlidersHorizontalIcon, TriangleAlertIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminOverview, AuditLogEvent } from "@/lib/mock-api/administration";
import type { RoleProfile } from "@/types/rbac";
import type { SelectedScope } from "@/types/hierarchy";

type AdministrationOverviewProps = {
  overview: AdminOverview;
  roles: RoleProfile[];
  auditLogs: AuditLogEvent[];
  selectedScope: SelectedScope;
};

export function AdministrationOverview({
  overview,
  roles,
  auditLogs,
  selectedScope,
}: AdministrationOverviewProps) {
  const cards = [
    {
      label: "Operator / Platform Scope",
      value: selectedScope.path.map((item) => item.name).join(" / "),
      icon: SlidersHorizontalIcon,
      accent: "bg-blue-50 text-blue-700",
    },
    {
      label: "Roles / Policies",
      value: `${roles.length} visible profiles`,
      icon: ShieldIcon,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Audit Logs",
      value: `${auditLogs.length} scoped events`,
      icon: ClipboardListIcon,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Impact Warnings",
      value: `${overview.availableSections.includes("roles_and_policies") ? 1 : 0} sensitive sections`,
      icon: TriangleAlertIcon,
      accent: "bg-amber-50 text-amber-700",
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label} className="border border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-sm text-slate-500">{card.label}</CardTitle>
              <span className={`inline-flex size-10 items-center justify-center rounded-full ${card.accent}`}>
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-slate-950">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
