"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRightIcon,
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
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  if (!currentUser) {
    return null;
  }

  const visibleModuleKeys = getVisibleModules(currentUser, selectedScope);
  const visibleModules = APP_MODULES.filter((module) =>
    visibleModuleKeys.includes(module.key),
  );
  const activeModule = getModuleFromPath(pathname);

  return (
    <div className="flex h-full flex-col bg-mdu-surface text-mdu-text">
      <div
        className={[
          "flex-1 overflow-hidden",
          sidebarCollapsed ? "px-2.5 pt-4" : "px-3.5 pt-5",
        ].join(" ")}
      >
        <nav className={sidebarCollapsed ? "space-y-2 pb-5" : "space-y-1.5 pb-5"}>
          {visibleModules.map((module) => {
            const Icon = moduleIcons[module.key];
            const isActive = module.key === activeModule;

            return (
              <Button
                key={module.key}
                asChild
                variant="ghost"
                className={[
                  sidebarCollapsed
                    ? "!h-[30px] w-full justify-center rounded-2xl px-0"
                    : "!h-[30px] w-full justify-start rounded-2xl px-3.5",
                  "text-sm font-medium transition-all",
                  isActive
                    ? "border border-mdu-border-strong bg-[linear-gradient(180deg,var(--mdu-primary-soft-2)_0%,var(--mdu-primary-soft-3)_100%)] text-mdu-primary shadow-[var(--mdu-shadow-soft)] hover:bg-[linear-gradient(180deg,var(--mdu-primary-soft-2)_0%,var(--mdu-primary-soft-3)_100%)] hover:text-mdu-primary"
                    : "text-mdu-text-muted hover:bg-mdu-surface-soft hover:text-mdu-text-strong",
                ].join(" ")}
              >
                <Link
                  href={module.href}
                  title={sidebarCollapsed ? module.label : undefined}
                  aria-label={module.label}
                  onClick={() => {
                    setActiveModule(module.key);
                    onNavigate?.();
                  }}
                  className={sidebarCollapsed ? "flex h-full w-full items-center justify-center" : "flex h-full w-full items-center"}
                >
                  <Icon className={sidebarCollapsed ? "size-4 shrink-0" : "mr-3 size-4 shrink-0"} />
                  {!sidebarCollapsed ? (
                    <>
                      <span className="flex-1 text-left">{module.label}</span>
                      <ChevronRightIcon
                        className={[
                          "size-4 shrink-0 transition-opacity",
                          isActive ? "opacity-100" : "opacity-40",
                        ].join(" ")}
                      />
                    </>
                  ) : null}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      <div className={sidebarCollapsed ? "mt-auto px-2.5 pb-5" : "mt-auto px-4 pb-5"}>
        <Separator className="mb-4 bg-mdu-border-soft" />
        <div className="space-y-1.5">
          <Button
            variant="ghost"
            title={sidebarCollapsed ? "System Health" : undefined}
            aria-label="System Health"
            className={[
              sidebarCollapsed
                ? "!h-[30px] w-full justify-center rounded-2xl px-0"
                : "!h-[30px] w-full justify-start rounded-2xl px-3",
              "text-mdu-text-muted hover:bg-mdu-surface-soft hover:text-mdu-text-strong",
            ].join(" ")}
          >
            <ShieldCheckIcon className={sidebarCollapsed ? "size-4" : "mr-3 size-4"} />
            {!sidebarCollapsed ? "System Health" : null}
          </Button>
          <Button
            variant="ghost"
            title={sidebarCollapsed ? "Reports" : undefined}
            aria-label="Reports"
            className={[
              sidebarCollapsed
                ? "!h-[30px] w-full justify-center rounded-2xl px-0"
                : "!h-[30px] w-full justify-start rounded-2xl px-3",
              "text-mdu-text-muted hover:bg-mdu-surface-soft hover:text-mdu-text-strong",
            ].join(" ")}
          >
            <LayoutDashboardIcon className={sidebarCollapsed ? "size-4" : "mr-3 size-4"} />
            {!sidebarCollapsed ? "Reports" : null}
          </Button>
        </div>
        {!sidebarCollapsed ? (
          <div className="mt-6 border-t border-mdu-border-soft pt-4 text-xs leading-5 text-mdu-text-soft">
            <p>© 2026 MDU Platform</p>
            <p>All rights reserved.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
