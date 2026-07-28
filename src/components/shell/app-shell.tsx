"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GlobalSearchOverlay } from "@/components/shell/global-search-overlay";
import { ScopeBreadcrumbBar } from "@/components/shell/scope-breadcrumb-bar";
import { Sidebar } from "@/components/shell/sidebar";
import { TopAppHeader } from "@/components/shell/top-app-header";
import { getHierarchyTree } from "@/lib/mock-api/hierarchy";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { useUiStore } from "@/stores/ui-store";
import type { HierarchyNode } from "@/types/hierarchy";

type AppShellProps = {
  children: ReactNode;
};

function flattenHierarchyNodes(nodes: HierarchyNode[]): HierarchyNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenHierarchyNodes(node.children) : []),
  ]);
}

export function AppShell({ children }: AppShellProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const setSelectedNode = useScopeStore((state) => state.setSelectedNode);
  const setHierarchyNodes = useScopeStore((state) => state.setHierarchyNodes);
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar);
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const pathname = usePathname();

  const treeQuery = useQuery({
    queryKey: ["hierarchy", "tree", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser),
    queryFn: () => getHierarchyTree(currentUser!),
  });

  // Keep Zustand's hierarchyNodes synchronized and auto-select root UUID
  useEffect(() => {
    if (treeQuery.data?.roots) {
      const flattened = flattenHierarchyNodes(treeQuery.data.roots);
      setHierarchyNodes(flattened);

      // Auto-migrate selected mock scope ID to the real database UUID root
      const isMockId = (id: string) =>
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) &&
        id !== "0000-0000-0000";

      if (!selectedScope || isMockId(selectedScope.nodeId)) {
        const fallbackNodeId = treeQuery.data.roots[0]?.id;
        if (fallbackNodeId) {
          setSelectedNode(fallbackNodeId);
        }
      }
    }
  }, [treeQuery.data, currentUser, selectedScope, setHierarchyNodes, setSelectedNode]);

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

  const showBreadcrumbs = !pathname.startsWith("/users") && !pathname.startsWith("/customers");

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
            <div className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Access platform modules and hierarchy tree</SheetDescription>
            </div>
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
