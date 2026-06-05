"use client";

import { ChevronDownIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/states/empty-state";
import {
  findNodeById,
  isNodeWithinSubtree,
  mockHierarchyNodes,
} from "@/lib/mock-data/hierarchy";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import type { HierarchyNode, ScopePathItem } from "@/types/hierarchy";

function getAccessibleAlternatives(
  item: ScopePathItem,
  currentUserIdRoots: string[],
): HierarchyNode[] {
  const currentNode = findNodeById(item.id);
  const parentId = currentNode?.parentId ?? null;

  return mockHierarchyNodes.filter((node) => {
    if (node.type !== item.type) {
      return false;
    }

    if (node.parentId !== parentId) {
      return false;
    }

    return currentUserIdRoots.some((rootId) => isNodeWithinSubtree(node.id, rootId));
  });
}

export function ScopeBreadcrumbBar() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const recentScopes = useScopeStore((state) => state.recentScopes);
  const setSelectedNode = useScopeStore((state) => state.setSelectedNode);

  if (!currentUser) {
    return null;
  }

  if (!selectedScope) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <EmptyState
          title="No scope selected"
          description="Select a permitted hierarchy scope to load scoped modules."
        />
      </div>
    );
  }

  const assignmentRoots = currentUser.scopeAssignments
    .map((assignment) => assignment.scopePath[0]?.id)
    .filter((value): value is string => Boolean(value));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Current Scope
          </p>
          <Breadcrumb>
            <BreadcrumbList className="gap-y-2">
              {selectedScope.path.map((item, index) => {
                const alternatives = getAccessibleAlternatives(item, assignmentRoots);
                const isLast = index === selectedScope.path.length - 1;

                return (
                  <div key={item.id} className="contents">
                    <BreadcrumbItem>
                      {alternatives.length > 1 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className={[
                                "h-8 rounded-lg px-2 text-sm",
                                isLast
                                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                  : "text-slate-700 hover:bg-slate-100",
                              ].join(" ")}
                            >
                              <span>{item.name}</span>
                              <ChevronDownIcon className="ml-1 size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            {alternatives.map((node) => (
                              <DropdownMenuItem
                                key={node.id}
                                onClick={() => setSelectedNode(node.id)}
                              >
                                {node.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <BreadcrumbPage className={isLast ? "text-blue-700" : ""}>
                          {item.name}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {!isLast ? <BreadcrumbSeparator /> : null}
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {recentScopes.slice(0, 3).map((scope) => (
            <Button
              key={scope.nodeId}
              type="button"
              variant="outline"
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-700"
              onClick={() => setSelectedNode(scope.nodeId)}
            >
              {scope.nodeName}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
