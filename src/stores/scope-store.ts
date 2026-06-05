"use client";

import {
  findNodeById,
  getScopePath,
  hierarchyExampleIds,
  toSelectedScope,
} from "@/lib/mock-data/hierarchy";
import type { ScopePathItem, SelectedScope } from "@/types/hierarchy";
import { create } from "zustand";

type ScopeStoreState = {
  selectedScope: SelectedScope | null;
  selectedNodeId: string | null;
  selectedScopePath: ScopePathItem[];
  recentScopes: SelectedScope[];
  isScopeSelected: boolean;
  setSelectedNode: (nodeId: string) => void;
  setSelectedScope: (scope: SelectedScope | null) => void;
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
  setSelectedNode: (nodeId) => {
    const node = findNodeById(nodeId);

    if (!node) {
      return;
    }

    const selectedScope = toSelectedScope(nodeId);

    if (!selectedScope) {
      return;
    }

    const recentScopes = dedupeRecentScopes([
      selectedScope,
      ...get().recentScopes,
    ]).slice(0, 8);

    set(() => ({
      ...buildScopeState(selectedScope, recentScopes),
      selectedScopePath: getScopePath(nodeId),
    }));
  },
  setSelectedScope: (scope) => {
    if (!scope) {
      set(() => buildScopeState(null, []));
      return;
    }

    const existingNode = findNodeById(scope.nodeId);

    if (!existingNode) {
      return;
    }

    const normalizedScope = toSelectedScope(scope.nodeId);

    if (!normalizedScope) {
      return;
    }

    const recentScopes = dedupeRecentScopes([
      normalizedScope,
      ...get().recentScopes,
    ]).slice(0, 8);

    set(() => ({
      ...buildScopeState(normalizedScope, recentScopes),
      selectedScopePath: getScopePath(scope.nodeId),
    }));
  },
  clearScope: () => {
    set(() => buildScopeState(null, []));
  },
}));
