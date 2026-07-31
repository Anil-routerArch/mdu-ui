import { getHeaders, getServiceUrl, checkServiceUrl } from "@/lib/api/config";
import { getOperators } from "@/lib/mock-api/operators";
import { useAuthStore } from "@/stores/auth-store";
import type { HierarchyNode, HierarchyTree, ScopePathItem } from "@/types/hierarchy";
import type { User } from "@/types/user";

const OWPROV_URL = getServiceUrl("provisioning");

function checkProvServiceUrl() {
  checkServiceUrl("provisioning");
}

export let globalFlattenedNodesCache: HierarchyNode[] = [];

function flattenHierarchyNodes(nodes: HierarchyNode[]): HierarchyNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenHierarchyNodes(node.children) : []),
  ]);
}

function mapEntityTreeToNodes(
  node: any,
  parentId: string | null,
  parentPath: ScopePathItem[],
  operatorEntityIds: Set<string>
): HierarchyNode {
  const isOperator =
    node.uuid === "0000-0000-0000" ||
    operatorEntityIds.has(node.uuid) ||
    (node.operatorId && node.operatorId !== "");
  
  const type = node.type === "venue" ? "venue" : isOperator ? "operator" : "customer";

  const currentPathItem: ScopePathItem = {
    id: node.uuid,
    name: node.name,
    type: type,
  };
  const path = [...parentPath, currentPathItem];

  const childrenNodes: HierarchyNode[] = [];

  // Recurse child entities
  if (Array.isArray(node.children)) {
    for (const childEntity of node.children) {
      childrenNodes.push(
        mapEntityTreeToNodes(childEntity, node.uuid, path, operatorEntityIds)
      );
    }
  }

  // Recurse venues
  if (Array.isArray(node.venues)) {
    for (const venue of node.venues) {
      childrenNodes.push(
        mapEntityTreeToNodes(venue, node.uuid, path, operatorEntityIds)
      );
    }
  }

  return {
    id: node.uuid,
    type: type,
    name: node.name,
    parentId: parentId,
    path: path,
    metadata: {
      entityId: node.type !== "venue" ? node.uuid : undefined,
      venueId: node.type === "venue" ? node.uuid : undefined,
      childCount: childrenNodes.length,
      hasTopology: node.type === "venue",
    },
    children: childrenNodes.length > 0 ? childrenNodes : undefined,
    hasChildren: childrenNodes.length > 0,
    isSelectable: true,
  };
}

function findSubtreeNodes(nodes: HierarchyNode[], targetIds: Set<string>): HierarchyNode[] {
  const result: HierarchyNode[] = [];
  for (const node of nodes) {
    if (targetIds.has(node.id)) {
      result.push(node);
    } else if (node.children) {
      result.push(...findSubtreeNodes(node.children, targetIds));
    }
  }
  return result;
}

export async function getHierarchyTree(user: User): Promise<HierarchyTree> {
  checkProvServiceUrl();

  // 1. Fetch operators to build mapping for type determination
  const operators = await getOperators().catch(() => []);
  const operatorEntityIds = new Set(operators.map((op) => op.entityId));

  // 2. Fetch all management roles to get assigned entity IDs
  const rolesRes = await fetch(`${OWPROV_URL}/api/v1/managementRole`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!rolesRes.ok) {
    const errData = await rolesRes.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to fetch management roles.");
  }
  const rolesData = await rolesRes.json();
  const allRoles = rolesData.roles || rolesData.entries || [];

  // Find user's assigned entity IDs (case-insensitive check)
  const userRoles = allRoles.filter((role: any) =>
    Array.isArray(role.users) &&
    role.users.some((u: string) => u.toLowerCase() === user.id.toLowerCase())
  );
  const assignedEntityIds = new Set<string>();
  userRoles.forEach((role: any) => {
    if (role.entity) {
      assignedEntityIds.add(role.entity);
    }
  });

  // Root users are not explicitly assigned to a sub-entity and have top-level access
  if (user.profile.role === "root") {
    assignedEntityIds.add("0000-0000-0000");
  }

  // 3. Fetch full entity/venue tree
  const treeRes = await fetch(`${OWPROV_URL}/api/v1/entity?getTree=true`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!treeRes.ok) {
    const errData = await treeRes.json().catch(() => ({}));
    throw new Error(
      errData?.ErrorDescription || "Failed to fetch hierarchy tree from Provisioning service."
    );
  }

  const rawTree = await treeRes.json();
  const fullTreeMapped = mapEntityTreeToNodes(rawTree, null, [], operatorEntityIds);

  // 4. Prune tree roots to only include the user's assigned subtrees
  let visibleRoots: HierarchyNode[] = [];
  if (assignedEntityIds.has("0000-0000-0000")) {
    visibleRoots = [fullTreeMapped];
  } else {
    visibleRoots = findSubtreeNodes([fullTreeMapped], assignedEntityIds);
  }

  // 5. Update global cache
  globalFlattenedNodesCache = flattenHierarchyNodes(visibleRoots);

  // 6. Resolve selectedScope
  const firstRoot = visibleRoots[0];
  const selectedScope = firstRoot
    ? {
        nodeId: firstRoot.id,
        nodeType: firstRoot.type,
        nodeName: firstRoot.name,
        path: firstRoot.path,
      }
    : null;

  return {
    roots: visibleRoots,
    selectedScope,
  };
}

export async function getHierarchyNode(nodeId: string): Promise<HierarchyNode> {
  if (globalFlattenedNodesCache.length === 0) {
    const user = useAuthStore.getState().currentUser;
    if (user) {
      await getHierarchyTree(user).catch(() => {});
    }
  }

  let node = globalFlattenedNodesCache.find((n) => n.id === nodeId);
  if (!node) {
    throw new Error(`Hierarchy node not found for ID: ${nodeId}`);
  }
  return node;
}

export async function getScopePath(nodeId: string): Promise<ScopePathItem[]> {
  const node = await getHierarchyNode(nodeId);
  return node.path;
}

export async function getNodeChildren(nodeId: string): Promise<HierarchyNode[]> {
  const node = await getHierarchyNode(nodeId);
  return node.children ?? [];
}

export async function searchHierarchyNodes(query: string, user: User): Promise<HierarchyNode[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (globalFlattenedNodesCache.length === 0) {
    await getHierarchyTree(user);
  }
  if (!normalizedQuery) {
    return globalFlattenedNodesCache.slice(0, 10);
  }
  return globalFlattenedNodesCache.filter((node) =>
    node.name.toLowerCase().includes(normalizedQuery)
  );
}

export async function getDescendantNodes(nodeId: string): Promise<HierarchyNode[]> {
  const node = await getHierarchyNode(nodeId);
  return node.children ? flattenHierarchyNodes(node.children) : [];
}
