"use client";

import { useState } from "react";
import { ChevronDownIcon, Clock3Icon, RefreshCwIcon, Settings2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/states/empty-state";
import { Command, CommandInput } from "@/components/ui/command";
import { mockRecentAlerts } from "@/lib/mock-data/alerts";
import { mockBillingPlans, mockSubscriptions } from "@/lib/mock-data/billing";
import { mockConfigurationSets } from "@/lib/mock-data/configurations";
import { mockCustomers } from "@/lib/mock-data/customers";
import { mockDevices } from "@/lib/mock-data/devices";
import {
  findNodeById,
  isNodeWithinSubtree,
  mockHierarchyNodes,
} from "@/lib/mock-data/hierarchy";
import { GlobalSearchResults } from "@/components/shell/global-search-overlay";
import { mockUsers } from "@/lib/mock-data/users";
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

function isWithinSelectedScope(path: ScopePathItem[] | undefined, scopeNodeId: string): boolean {
  return (path ?? []).some((item) => item.id === scopeNodeId);
}

function formatLastUpdated(value: string | null): string {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getLatestTimestamp(values: Array<string | null | undefined>): string | null {
  const timestamps = values
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((value) => !Number.isNaN(value));

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function getScopedLastUpdated(pathname: string, scopeNodeId: string, currentUserUpdatedAt: string) {
  if (pathname.startsWith("/devices")) {
    return getLatestTimestamp(
      mockDevices
        .filter((device) => isWithinSelectedScope(device.assignment?.path, scopeNodeId))
        .flatMap((device) => [device.updatedAt, device.health.lastSeenAt]),
    );
  }

  if (pathname.startsWith("/configurations")) {
    return getLatestTimestamp(
      mockConfigurationSets
        .filter((config) => isWithinSelectedScope(config.scopePath, scopeNodeId))
        .flatMap((config) => [config.updatedAt, config.currentVersion.createdAt]),
    );
  }

  if (pathname.startsWith("/customers")) {
    return getLatestTimestamp(
      mockCustomers
        .filter((customer) => isWithinSelectedScope(customer.path, scopeNodeId))
        .map((customer) => customer.updatedAt),
    );
  }

  if (pathname.startsWith("/billing")) {
    return getLatestTimestamp([
      ...mockBillingPlans
        .filter((plan) => isWithinSelectedScope(plan.offeredByScope, scopeNodeId))
        .map((plan) => plan.updatedAt),
      ...mockSubscriptions
        .filter((subscription) => isWithinSelectedScope(subscription.scopePath, scopeNodeId))
        .flatMap((subscription) => [subscription.startsAt, subscription.renewsAt, subscription.expiresAt]),
    ]);
  }

  if (pathname.startsWith("/users")) {
    return getLatestTimestamp(
      mockUsers
        .filter((user) =>
          user.scopeAssignments.some((assignment) =>
            isWithinSelectedScope(assignment.scopePath, scopeNodeId),
          ),
        )
        .flatMap((user) => [user.updatedAt, user.lastLoginAt]),
    );
  }

  if (pathname.startsWith("/administration")) {
    return getLatestTimestamp(
      mockUsers.flatMap((user) => [user.updatedAt, user.lastLoginAt]),
    );
  }

  return getLatestTimestamp([
    ...mockRecentAlerts
      .filter((alert) => isWithinSelectedScope(alert.scopePath, scopeNodeId))
      .map((alert) => alert.occurredAt),
    ...mockDevices
      .filter((device) => isWithinSelectedScope(device.assignment?.path, scopeNodeId))
      .flatMap((device) => [device.updatedAt, device.health.lastSeenAt]),
    ...mockConfigurationSets
      .filter((config) => isWithinSelectedScope(config.scopePath, scopeNodeId))
      .map((config) => config.updatedAt),
    currentUserUpdatedAt,
  ]);
}

export function ScopeBreadcrumbBar() {
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeQuery, setCustomizeQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const setSelectedNode = useScopeStore((state) => state.setSelectedNode);

  if (!currentUser) {
    return null;
  }

  if (!selectedScope) {
    return (
      <div className="rounded-[18px] border border-[#e7eef8] bg-white p-2.5 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
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
  const lastScopeName = selectedScope.path.at(-1)?.name ?? selectedScope.nodeName;
  const lastUpdated = formatLastUpdated(
    getScopedLastUpdated(pathname, selectedScope.nodeId, currentUser.updatedAt),
  );
  const handleRefresh = () => {
    router.refresh();

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="border border-[#e7eef8] bg-white px-3 py-2 shadow-none">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="gap-y-1.5 text-[12px] text-slate-500">
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
                            onClick={() => setSelectedNode(item.id)}
                            className={[
                              "h-7 rounded-lg px-2 text-[12px]",
                              isLast
                                ? "border border-[#dbe8ff] bg-[#f5f9ff] text-[#2563eb] hover:bg-[#edf5ff] hover:text-[#1d4ed8]"
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
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedNode(item.id)}
                        className={[
                          "h-7 rounded-lg px-2 text-[12px] font-normal",
                          isLast
                            ? "border border-[#dbe8ff] bg-[#f5f9ff] text-[#2563eb] hover:bg-[#edf5ff] hover:text-[#1d4ed8]"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                        ].join(" ")}
                      >
                        <BreadcrumbPage className="text-inherit">{item.name}</BreadcrumbPage>
                      </Button>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleRefresh}
            className="h-8 rounded-xl px-2.5 text-[12px] text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            <Clock3Icon className="size-3.5" />
            <span>Last updated: {lastUpdated}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl border border-[#e8eef7] bg-[#f8fbff] text-slate-600 hover:bg-[#f2f7ff]"
            onClick={handleRefresh}
          >
            <RefreshCwIcon className="size-3.5" />
          </Button>
          <DropdownMenu
            open={customizeOpen}
            onOpenChange={(open) => {
              setCustomizeOpen(open);

              if (!open) {
                setCustomizeQuery("");
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-xl border-[#e8eef7] bg-white px-2.5 text-[12px] text-slate-700 hover:bg-slate-50"
              >
                <Settings2Icon className="size-3.5" />
                Customize
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={8}
              className="w-[360px] rounded-2xl border border-[#e7eef8] bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Select Scope
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-0 my-2 bg-[#edf2f8]" />
              <Command className="rounded-xl bg-transparent p-0">
                <CommandInput
                  placeholder="Search hierarchy nodes..."
                  value={customizeQuery}
                  onValueChange={setCustomizeQuery}
                  className="text-sm"
                />
                <GlobalSearchResults
                  query={customizeQuery}
                  onSelectNode={(nodeId) => {
                    setSelectedNode(nodeId);
                    setCustomizeOpen(false);
                    setCustomizeQuery("");
                  }}
                />
              </Command>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            className="hidden h-8 rounded-xl bg-[#f8fbff] px-2.5 text-[12px] text-slate-600 hover:bg-[#f1f5fb] xl:inline-flex"
            onClick={() => setSelectedNode(selectedScope.nodeId)}
          >
            {lastScopeName}
          </Button>
        </div>
      </div>
    </div>
  );
}
