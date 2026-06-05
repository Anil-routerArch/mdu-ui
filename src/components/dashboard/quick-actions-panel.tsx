import Link from "next/link";
import { CreditCardIcon, FolderTreeIcon, LayoutDashboardIcon, RouterIcon, ShieldIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-950">Quick Actions</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Role-aware navigation shortcuts for the selected scope.
            </CardDescription>
          </div>
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <LayoutDashboardIcon className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <div
              key={action.key}
              className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Icon className="size-4" />
                </span>
                <p className="font-medium text-slate-900">{action.label}</p>
              </div>
              <p className="mb-4 text-sm text-slate-600">{action.description}</p>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={action.href}>Open</Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
