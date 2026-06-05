"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { GlobalSearchOverlay } from "@/components/shell/global-search-overlay";
import { ScopeBreadcrumbBar } from "@/components/shell/scope-breadcrumb-bar";
import { Sidebar } from "@/components/shell/sidebar";
import { TopAppHeader } from "@/components/shell/top-app-header";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { useUiStore } from "@/stores/ui-store";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const setSelectedNode = useScopeStore((state) => state.setSelectedNode);
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar);
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  useEffect(() => {
    if (!currentUser || !selectedScope) {
      return;
    }

    const decision = can(currentUser, "view", "hierarchy", selectedScope);

    if (!decision.allowed) {
      const fallbackNodeId =
        currentUser.scopeAssignments[0]?.scopePath.at(-1)?.id ?? null;

      if (fallbackNodeId) {
        setSelectedNode(fallbackNodeId);
      }
    }
  }, [currentUser, selectedScope, setSelectedNode]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopAppHeader />
      <div className="flex min-h-[calc(100vh-5rem)]">
        <aside
          className={[
            "hidden border-r border-slate-200 bg-white lg:block",
            sidebarCollapsed ? "w-[88px]" : "w-[280px]",
          ].join(" ")}
        >
          <Sidebar />
        </aside>

        <Sheet open={mobileSidebarOpen} onOpenChange={(open) => (!open ? closeMobileSidebar() : undefined)}>
          <SheetContent side="left" className="w-[280px] p-0" showCloseButton>
            <Sidebar onNavigate={closeMobileSidebar} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 backdrop-blur-sm sm:px-6">
            <ScopeBreadcrumbBar />
          </div>
          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
      <GlobalSearchOverlay />
    </div>
  );
}
