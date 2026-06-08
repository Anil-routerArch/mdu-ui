"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHierarchyNode, getHierarchyTree } from "@/lib/mock-api/hierarchy";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { useUiStore } from "@/stores/ui-store";
import type { HierarchyNode } from "@/types/hierarchy";
import { HierarchyTree } from "./hierarchy-tree";
import { NodeWorkspace } from "./node-workspace";

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

function findNodeInTree(nodes: HierarchyNode[], nodeId: string): HierarchyNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    if (node.children?.length) {
      const childMatch = findNodeInTree(node.children, nodeId);

      if (childMatch) {
        return childMatch;
      }
    }
  }

  return null;
}

function flattenTree(nodes: HierarchyNode[]): HierarchyNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenTree(node.children) : [])]);
}

function trimTreeToAssignedRoots(nodes: HierarchyNode[], assignedRootIds: string[]) {
  return assignedRootIds
    .map((rootId) => findNodeInTree(nodes, rootId))
    .filter((node): node is HierarchyNode => Boolean(node));
}

export function HierarchyPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const selectedNodeId = useScopeStore((state) => state.selectedNodeId);
  const setSelectedNode = useScopeStore((state) => state.setSelectedNode);
  const setActiveModule = useUiStore((state) => state.setActiveModule);

  useEffect(() => {
    setActiveModule("hierarchy");
  }, [setActiveModule]);

  const decision = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return can(currentUser, "view", "hierarchy", selectedScope);
  }, [currentUser, selectedScope]);

  const treeQuery = useQuery({
    queryKey: ["hierarchy", "tree", currentUser?.id ?? "none"],
    enabled: Boolean(currentUser && decision?.allowed),
    queryFn: () => getHierarchyTree(currentUser!),
  });

  const nodeQuery = useQuery({
    queryKey: ["hierarchy", "node", selectedNodeId ?? "none"],
    enabled: Boolean(currentUser && selectedNodeId && decision?.allowed),
    queryFn: () => getHierarchyNode(selectedNodeId!),
  });

  const visibleRoots = useMemo(() => {
    if (!treeQuery.data || !currentUser) {
      return [];
    }

    const assignedRootIds = currentUser.scopeAssignments
      .map((assignment) => assignment.scopePath.at(-1)?.id)
      .filter((id): id is string => Boolean(id));

    return trimTreeToAssignedRoots(treeQuery.data.roots, assignedRootIds);
  }, [currentUser, treeQuery.data]);

  const availableMoveTargets = useMemo(() => {
    if (!nodeQuery.data) {
      return [];
    }

    return flattenTree(visibleRoots).filter(
      (candidate) =>
        candidate.id !== nodeQuery.data.id &&
        !candidate.path.some((item) => item.id === nodeQuery.data.id),
    );
  }, [nodeQuery.data, visibleRoots]);

  if (!currentUser) {
    return (
      <NoPermissionState
        title="No active session"
        description="Sign in with a mock user to access the hierarchy workspace."
      />
    );
  }

  if (!selectedScope || !selectedNodeId) {
    return (
      <EmptyState
        title="No hierarchy scope selected"
        description="Select a hierarchy node from the scope controls to open the workspace."
      />
    );
  }

  if (!decision?.allowed) {
    return (
      <NoPermissionState description="You do not have access to the hierarchy workspace for this scope." />
    );
  }

  if (treeQuery.isLoading || nodeQuery.isLoading) {
    return <LoadingState title="Loading hierarchy workspace" variant="page" rows={6} />;
  }

  if (treeQuery.isError || nodeQuery.isError) {
    const error = treeQuery.error ?? nodeQuery.error;

    if (isMockApiError(error) && error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => {
        void treeQuery.refetch();
        void nodeQuery.refetch();
      }} />;
    }

    if (isMockApiError(error) && error.code === "NO_PERMISSION") {
      return <NoPermissionState description="This hierarchy node is not available in your permitted subtree." />;
    }

    return <ErrorState error={error} onRetry={() => {
      void treeQuery.refetch();
      void nodeQuery.refetch();
    }} />;
  }

  if (!visibleRoots.length) {
    return (
      <EmptyState
        title="Empty hierarchy"
        description="No hierarchy nodes are available inside your permitted subtree."
      />
    );
  }

  if (!nodeQuery.data) {
    return (
      <EmptyState
        title="Node unavailable"
        description="The selected hierarchy node could not be loaded."
      />
    );
  }

  const visibleNode = flattenTree(visibleRoots).find((node) => node.id === nodeQuery.data.id);

  if (!visibleNode) {
    return (
      <NoPermissionState description="The selected node is outside your visible hierarchy subtree." />
    );
  }

  return (
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Hierarchy</h1>
        <p className="text-sm text-slate-600">
          Recursive subtree navigation and contextual workspace for the selected node.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <HierarchyTree
            roots={visibleRoots}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNode}
          />

          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-950">Tree Guidance</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              The hierarchy tree and the scope breadcrumb stay synchronized through the shared scope store.
            </CardContent>
          </Card>
        </div>

        <NodeWorkspace
          node={visibleNode}
          selectedScope={selectedScope}
          user={currentUser}
          availableMoveTargets={availableMoveTargets}
        />
      </div>
    </div>
  );
}
