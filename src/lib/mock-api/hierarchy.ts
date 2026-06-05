import {
  filterByScope,
  withMockApi,
  createMockApiError,
} from "@/lib/mock-api/client";
import {
  findNodeById,
  getDescendants,
  mockHierarchyNodes,
  mockHierarchyTree,
} from "@/lib/mock-data/hierarchy";
import type { HierarchyNode, HierarchyTree, ScopePathItem } from "@/types/hierarchy";
import type { User } from "@/types/user";

function filterTreeNodesByUser(nodes: HierarchyNode[], user: User): HierarchyNode[] {
  return nodes
    .filter((node) => filterByScope([node], (item) => item.path, null, user).length > 0)
    .map((node) => ({
      ...node,
      children: node.children ? filterTreeNodesByUser(node.children, user) : undefined,
    }));
}

export async function getHierarchyTree(user: User): Promise<HierarchyTree> {
  return withMockApi(() => ({
    roots: filterTreeNodesByUser(mockHierarchyTree.roots, user),
    selectedScope: mockHierarchyTree.selectedScope,
  }));
}

export async function getHierarchyNode(nodeId: string): Promise<HierarchyNode> {
  return withMockApi(() => {
    const node = findNodeById(nodeId);

    if (!node) {
      throw createMockApiError("NOT_FOUND", "Hierarchy node not found.", {
        status: 404,
      });
    }

    return node;
  });
}

export async function getScopePath(nodeId: string): Promise<ScopePathItem[]> {
  return withMockApi(() => {
    const node = findNodeById(nodeId);

    if (!node) {
      throw createMockApiError("NOT_FOUND", "Scope path not found.", {
        status: 404,
      });
    }

    return node.path;
  });
}

export async function getNodeChildren(nodeId: string): Promise<HierarchyNode[]> {
  return withMockApi(() => {
    const node = findNodeById(nodeId);

    if (!node) {
      throw createMockApiError("NOT_FOUND", "Hierarchy node not found.", {
        status: 404,
      });
    }

    return node.children ?? [];
  });
}

export async function searchHierarchyNodes(
  query: string,
  user: User,
): Promise<HierarchyNode[]> {
  return withMockApi(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const visibleNodes = filterByScope(
      mockHierarchyNodes,
      (node) => node.path,
      null,
      user,
    );

    if (!normalizedQuery) {
      return visibleNodes.slice(0, 10);
    }

    return visibleNodes.filter((node) =>
      node.name.toLowerCase().includes(normalizedQuery),
    );
  });
}

export async function getDescendantNodes(nodeId: string): Promise<HierarchyNode[]> {
  return withMockApi(() => getDescendants(nodeId));
}
