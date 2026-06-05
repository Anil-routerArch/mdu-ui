"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  CreditCardIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  Settings2Icon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { APP_MODULES } from "@/lib/constants/modules";
import { getVisibleModules } from "@/lib/rbac/module-access";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { useUiStore } from "@/stores/ui-store";
import type { ModuleKey } from "@/types/rbac";

type SidebarProps = {
  onNavigate?: () => void;
};

const moduleIcons: Record<ModuleKey, typeof LayoutDashboardIcon> = {
  dashboard: LayoutDashboardIcon,
  customers: Building2Icon,
  hierarchy: FolderTreeIcon,
  devices: NetworkIcon,
  configurations: Settings2Icon,
  billing: CreditCardIcon,
  users: UsersIcon,
  administration: ShieldCheckIcon,
};

function getModuleFromPath(pathname: string): ModuleKey {
  if (pathname.startsWith("/customers")) return "customers";
  if (pathname.startsWith("/hierarchy")) return "hierarchy";
  if (pathname.startsWith("/devices")) return "devices";
  if (pathname.startsWith("/configurations")) return "configurations";
  if (pathname.startsWith("/billing")) return "billing";
  if (pathname.startsWith("/users")) return "users";
  if (pathname.startsWith("/administration")) return "administration";
  return "dashboard";
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const setActiveModule = useUiStore((state) => state.setActiveModule);

  if (!currentUser) {
    return null;
  }

  const visibleModuleKeys = getVisibleModules(currentUser, selectedScope);
  const visibleModules = APP_MODULES.filter((module) =>
    visibleModuleKeys.includes(module.key),
  );
  const activeModule = getModuleFromPath(pathname);

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="px-4 py-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Operational modules for the selected scope.
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 pb-4">
          {visibleModules.map((module) => {
            const Icon = moduleIcons[module.key];
            const isActive = module.key === activeModule;

            return (
              <Button
                key={module.key}
                asChild
                variant="ghost"
                className={[
                  "h-12 w-full justify-start rounded-xl px-3 text-sm font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <Link
                  href={module.href}
                  onClick={() => {
                    setActiveModule(module.key);
                    onNavigate?.();
                  }}
                >
                  <Icon className="mr-3 size-4" />
                  {module.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="px-4 pb-4">
        <Separator className="mb-4" />
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl px-3 text-slate-700 hover:bg-slate-100"
          >
            <ShieldCheckIcon className="mr-3 size-4" />
            System Health
          </Button>
          <Button
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl px-3 text-slate-700 hover:bg-slate-100"
          >
            <LayoutDashboardIcon className="mr-3 size-4" />
            Reports
          </Button>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          © 2026 MDU Platform
        </p>
      </div>
    </div>
  );
}
