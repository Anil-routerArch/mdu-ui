"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

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

  const showBreadcrumbs = !pathname.startsWith("/users");

  return (
    <div className="h-screen overflow-hidden bg-[var(--mdu-app-bg)] text-[var(--mdu-text)]">
      <TopAppHeader />
      <div className="flex h-[calc(100vh-60px)] overflow-hidden">
        <aside
          className={[
            "hidden h-full shrink-0 border-r border-[var(--mdu-border)] bg-[var(--mdu-surface)] lg:block",
            sidebarCollapsed ? "w-[92px]" : "w-[246px]",
          ].join(" ")}
        >
          <Sidebar />
        </aside>

        <Sheet open={mobileSidebarOpen} onOpenChange={(open) => (!open ? closeMobileSidebar() : undefined)}>
          <SheetContent side="left" className="w-[280px] p-0" showCloseButton>
            <Sidebar onNavigate={closeMobileSidebar} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {showBreadcrumbs && (
            <div className="border-b border-[var(--mdu-border)] bg-[var(--mdu-surface-muted)] px-0 py-0 sm:px-0">
              <ScopeBreadcrumbBar />
            </div>
          )}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        </div>
      </div>
      <GlobalSearchOverlay />
    </div>
  );
}
