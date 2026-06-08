import Link from "next/link";
import {
  CreditCardIcon,
  FolderTreeIcon,
  RouterIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { can } from "@/lib/rbac/can";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";

type QuickActionsPanelProps = {
  user: User;
  selectedScope: SelectedScope | null;
};

const allActions = [
  {
    key: "hierarchy",
    label: "Open Hierarchy",
    description: "Review the current structure and selected scope.",
    href: ROUTES.hierarchy,
    module: "hierarchy",
    icon: FolderTreeIcon,
  },
  {
    key: "devices",
    label: "View Devices",
    description: "Inspect scoped infrastructure devices.",
    href: ROUTES.devices,
    module: "devices",
    icon: RouterIcon,
  },
  {
    key: "billing",
    label: "View Billing",
    description: "Open current plan and subscription workflows.",
    href: ROUTES.billing,
    module: "billing",
    icon: CreditCardIcon,
  },
  {
    key: "users",
    label: "Manage Users",
    description: "Review and update scoped user access.",
    href: ROUTES.users,
    module: "users",
    icon: UsersIcon,
  },
  {
    key: "administration",
    label: "Administration",
    description: "Open administrative policies and audit areas.",
    href: ROUTES.administration,
    module: "administration",
    icon: ShieldIcon,
  },
] as const;

export function QuickActionsPanel({ user, selectedScope }: QuickActionsPanelProps) {
  const visibleActions = allActions.filter((action) =>
    can(user, "view", action.module, selectedScope).allowed,
  );

  return (
    <Card className="h-[368px] rounded-[14px] border border-[#e6edf7] bg-white py-0 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base text-[#0f1f46]">Quick Actions</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          const iconClassName =
            action.key === "hierarchy"
              ? "text-blue-600"
              : action.key === "devices"
                ? "text-violet-600"
                : action.key === "billing"
                  ? "text-amber-500"
                  : action.key === "users"
                    ? "text-blue-600"
                    : "text-emerald-600";
          const bgClassName =
            action.key === "hierarchy"
              ? "bg-blue-50"
              : action.key === "devices"
                ? "bg-violet-50"
                : action.key === "billing"
                  ? "bg-amber-50"
                  : action.key === "users"
                    ? "bg-blue-50"
                    : "bg-emerald-50";

          return (
            <Link
              key={action.key}
              href={action.href}
              className="group rounded-[12px] border border-[#e7eef8] bg-white p-3 transition-all hover:border-[#d8e5fb] hover:bg-[#fbfdff]"
            >
              <div className="flex flex-col items-center gap-2.5 text-center">
                <span
                  className={`inline-flex size-10 items-center justify-center rounded-xl ${bgClassName}`}
                >
                  <Icon className={`size-4 ${iconClassName}`} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">{action.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      </CardContent>
    </Card>
  );
}
