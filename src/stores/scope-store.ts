"use client";

import {
  findNodeById,
  getScopePath,
  hierarchyExampleIds,
  toSelectedScope,
} from "@/lib/mock-data/hierarchy";
import type { HierarchyNode, ScopePathItem, SelectedScope } from "@/types/hierarchy";
import { create } from "zustand";

type ScopeStoreState = {
  selectedScope: SelectedScope | null;
  selectedNodeId: string | null;
  selectedScopePath: ScopePathItem[];
  recentScopes: SelectedScope[];
  isScopeSelected: boolean;
  hierarchyNodes: HierarchyNode[];
  setSelectedNode: (nodeId: string) => void;
  setSelectedScope: (scope: SelectedScope | null) => void;
  setHierarchyNodes: (nodes: HierarchyNode[]) => void;
  clearScope: () => void;
};

const defaultSelectedScope =
  toSelectedScope(hierarchyExampleIds.FLOOR_12_ID) ??
  toSelectedScope(hierarchyExampleIds.CUSTOMER_B_ID);

function dedupeRecentScopes(scopes: SelectedScope[]): SelectedScope[] {
  const seen = new Set<string>();

  return scopes.filter((scope) => {
    if (seen.has(scope.nodeId)) {
      return false;
    }

    seen.add(scope.nodeId);
    return true;
  });
}

function buildScopeState(scope: SelectedScope | null, recentScopes: SelectedScope[]) {
  return {
    selectedScope: scope,
    selectedNodeId: scope?.nodeId ?? null,
    selectedScopePath: scope?.path ?? [],
    recentScopes,
    isScopeSelected: Boolean(scope),
  };
}

export const useScopeStore = create<ScopeStoreState>((set, get) => ({
  ...buildScopeState(
    defaultSelectedScope,
    defaultSelectedScope ? [defaultSelectedScope] : [],
  ),
  hierarchyNodes: [],
  setHierarchyNodes: (nodes) => {
    set({ hierarchyNodes: nodes });
  },
  setSelectedNode: (nodeId) => {
    // 1. Look up in dynamic nodes first
    let node = get().hierarchyNodes.find((n) => n.id === nodeId);
    let selectedScope: SelectedScope | null = null;
    let scopePath: ScopePathItem[] = [];

    if (node) {
      selectedScope = {
        nodeId: node.id,
        nodeType: node.type,
        nodeName: node.name,
        path: node.path,
      };
      scopePath = node.path;
    } else {
      // 2. Fall back to mock hierarchy
      const mockNode = findNodeById(nodeId);
      if (!mockNode) {
        return;
      }
      selectedScope = toSelectedScope(nodeId);
      scopePath = getScopePath(nodeId);
    }

    if (!selectedScope) {
      return;
    }

    const recentScopes = dedupeRecentScopes([
      selectedScope,
      ...get().recentScopes,
    ]).slice(0, 8);

    set(() => ({
      ...buildScopeState(selectedScope, recentScopes),
      selectedScopePath: scopePath,
    }));
  },
  setSelectedScope: (scope) => {
    if (!scope) {
      set(() => buildScopeState(null, []));
      return;
    }

    let node = get().hierarchyNodes.find((n) => n.id === scope.nodeId);
    let normalizedScope: SelectedScope | null = null;
    let scopePath: ScopePathItem[] = [];

    if (node) {
      normalizedScope = {
        nodeId: node.id,
        nodeType: node.type,
        nodeName: node.name,
        path: node.path,
      };
      scopePath = node.path;
    } else {
      const mockNode = findNodeById(scope.nodeId);
      if (!mockNode) {
        return;
      }
      normalizedScope = toSelectedScope(scope.nodeId);
      scopePath = getScopePath(scope.nodeId);
    }

    if (!normalizedScope) {
      return;
    }

    const recentScopes = dedupeRecentScopes([
      normalizedScope,
      ...get().recentScopes,
    ]).slice(0, 8);

    set(() => ({
      ...buildScopeState(normalizedScope, recentScopes),
      selectedScopePath: scopePath,
    }));
  },
  clearScope: () => {
    set(() => buildScopeState(null, []));
  },
}));

