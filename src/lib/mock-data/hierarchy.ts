import type { ID } from "@/types/common";
import type {
  HierarchyNode,
  HierarchyTree,
  ScopePathItem,
  SelectedScope,
} from "@/types/hierarchy";

const ROOT_OPERATOR_ID = "op-operator-a";
const CUSTOMER_B_ID = "cust-customer-b";
const SUNRISE_TOWERS_ID = "site-sunrise-towers";
const SUNRISE_BUILDING_A_ID = "building-sunrise-a";
const TOWER_1_ID = "tower-1";
const FLOOR_12_ID = "floor-12";
const VENUE_LOUNGE_ID = "venue-lounge";
const VENUE_OFFICE_ID = "venue-office";
const VENUE_ROOFTOP_ID = "venue-rooftop";
const CUSTOMER_DIRECT_ID = "cust-direct-c";
const HARBOR_SITE_ID = "site-harbor-point";
const HARBOR_VENUE_ID = "venue-harbor-club";

function createPath(
  items: Array<Pick<ScopePathItem, "id" | "name" | "type">>,
): ScopePathItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
  }));
}

function createNode(node: HierarchyNode): HierarchyNode {
  return node;
}

const operatorAPath = createPath([
  {
    id: ROOT_OPERATOR_ID,
    name: "Operator A",
    type: "operator",
  },
]);

const customerBPath = createPath([
  ...operatorAPath,
  {
    id: CUSTOMER_B_ID,
    name: "Customer B",
    type: "customer",
  },
]);

const sunriseTowersPath = createPath([
  ...customerBPath,
  {
    id: SUNRISE_TOWERS_ID,
    name: "Sunrise Towers",
    type: "site",
  },
]);

const sunriseBuildingAPath = createPath([
  ...sunriseTowersPath,
  {
    id: SUNRISE_BUILDING_A_ID,
    name: "Building A",
    type: "building",
  },
]);

const tower1Path = createPath([
  ...sunriseBuildingAPath,
  {
    id: TOWER_1_ID,
    name: "Tower 1",
    type: "tower",
  },
]);

const floor12Path = createPath([
  ...tower1Path,
  {
    id: FLOOR_12_ID,
    name: "Floor 12",
    type: "floor",
  },
]);

const venueLoungePath = createPath([
  ...floor12Path,
  {
    id: VENUE_LOUNGE_ID,
    name: "Venue Lounge",
    type: "venue",
  },
]);

const venueOfficePath = createPath([
  ...floor12Path,
  {
    id: VENUE_OFFICE_ID,
    name: "Venue Office",
    type: "venue",
  },
]);

const venueRooftopPath = createPath([
  ...tower1Path,
  {
    id: VENUE_ROOFTOP_ID,
    name: "Venue Rooftop",
    type: "venue",
  },
]);

const customerDirectPath = createPath([
  {
    id: CUSTOMER_DIRECT_ID,
    name: "Customer Direct C",
    type: "customer",
  },
]);

const harborSitePath = createPath([
  ...customerDirectPath,
  {
    id: HARBOR_SITE_ID,
    name: "Harbor Point",
    type: "site",
  },
]);

const harborVenuePath = createPath([
  ...harborSitePath,
  {
    id: HARBOR_VENUE_ID,
    name: "Venue Harbor Club",
    type: "venue",
  },
]);

export const mockHierarchyTree: HierarchyTree = {
  roots: [
    createNode({
      id: ROOT_OPERATOR_ID,
      type: "operator",
      name: "Operator A",
      parentId: null,
      path: operatorAPath,
      metadata: {
        entityId: "entity-operator-a",
        childCount: 1,
        customerId: CUSTOMER_B_ID,
      },
      hasChildren: true,
      isSelectable: true,
      children: [
        createNode({
          id: CUSTOMER_B_ID,
          type: "customer",
          name: "Customer B",
          parentId: ROOT_OPERATOR_ID,
          path: customerBPath,
          metadata: {
            entityId: "entity-customer-b",
            childCount: 1,
            deviceCount: 164,
          },
          hasChildren: true,
          isSelectable: true,
          children: [
            createNode({
              id: SUNRISE_TOWERS_ID,
              type: "site",
              name: "Sunrise Towers",
              parentId: CUSTOMER_B_ID,
              path: sunriseTowersPath,
              metadata: {
                siteId: SUNRISE_TOWERS_ID,
                childCount: 1,
                deviceCount: 96,
              },
              hasChildren: true,
              isSelectable: true,
              children: [
                createNode({
                  id: SUNRISE_BUILDING_A_ID,
                  type: "building",
                  name: "Building A",
                  parentId: SUNRISE_TOWERS_ID,
                  path: sunriseBuildingAPath,
                  metadata: {
                    buildingId: SUNRISE_BUILDING_A_ID,
                    childCount: 1,
                    deviceCount: 96,
                  },
                  hasChildren: true,
                  isSelectable: true,
                  children: [
                    createNode({
                      id: TOWER_1_ID,
                      type: "tower",
                      name: "Tower 1",
                      parentId: SUNRISE_BUILDING_A_ID,
                      path: tower1Path,
                      metadata: {
                        towerId: TOWER_1_ID,
                        childCount: 2,
                        deviceCount: 64,
                        hasTopology: true,
                      },
                      hasChildren: true,
                      isSelectable: true,
                      children: [
                        createNode({
                          id: FLOOR_12_ID,
                          type: "floor",
                          name: "Floor 12",
                          parentId: TOWER_1_ID,
                          path: floor12Path,
                          metadata: {
                            floorId: FLOOR_12_ID,
                            childCount: 2,
                            deviceCount: 32,
                            hasTopology: true,
                            hasMap: true,
                          },
                          hasChildren: true,
                          isSelectable: true,
                          children: [
                            createNode({
                              id: VENUE_LOUNGE_ID,
                              type: "venue",
                              name: "Venue Lounge",
                              parentId: FLOOR_12_ID,
                              path: venueLoungePath,
                              metadata: {
                                venueId: VENUE_LOUNGE_ID,
                                deviceCount: 12,
                                hasTopology: true,
                                hasMap: true,
                              },
                              hasChildren: false,
                              isSelectable: true,
                            }),
                            createNode({
                              id: VENUE_OFFICE_ID,
                              type: "venue",
                              name: "Venue Office",
                              parentId: FLOOR_12_ID,
                              path: venueOfficePath,
                              metadata: {
                                venueId: VENUE_OFFICE_ID,
                                deviceCount: 20,
                                hasTopology: true,
                                hasMap: true,
                              },
                              hasChildren: false,
                              isSelectable: true,
                            }),
                          ],
                        }),
                        createNode({
                          id: VENUE_ROOFTOP_ID,
                          type: "venue",
                          name: "Venue Rooftop",
                          parentId: TOWER_1_ID,
                          path: venueRooftopPath,
                          metadata: {
                            venueId: VENUE_ROOFTOP_ID,
                            deviceCount: 8,
                            hasTopology: true,
                          },
                          hasChildren: false,
                          isSelectable: true,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    createNode({
      id: CUSTOMER_DIRECT_ID,
      type: "customer",
      name: "Customer Direct C",
      parentId: null,
      path: customerDirectPath,
      metadata: {
        entityId: "entity-customer-direct-c",
        childCount: 1,
        deviceCount: 36,
      },
      hasChildren: true,
      isSelectable: true,
      children: [
        createNode({
          id: HARBOR_SITE_ID,
          type: "site",
          name: "Harbor Point",
          parentId: CUSTOMER_DIRECT_ID,
          path: harborSitePath,
          metadata: {
            siteId: HARBOR_SITE_ID,
            childCount: 1,
            venueCount: 1,
            deviceCount: 36,
          },
          hasChildren: true,
          isSelectable: true,
          children: [
            createNode({
              id: HARBOR_VENUE_ID,
              type: "venue",
              name: "Venue Harbor Club",
              parentId: HARBOR_SITE_ID,
              path: harborVenuePath,
              metadata: {
                venueId: HARBOR_VENUE_ID,
                deviceCount: 36,
                hasTopology: true,
              },
              hasChildren: false,
              isSelectable: true,
            }),
          ],
        }),
      ],
    }),
  ],
  selectedScope: {
    nodeId: VENUE_LOUNGE_ID,
    nodeType: "venue",
    nodeName: "Venue Lounge",
    path: venueLoungePath,
  },
};

function flattenNodes(nodes: HierarchyNode[]): HierarchyNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenNodes(node.children) : [])]);
}

export const mockHierarchyNodes = flattenNodes(mockHierarchyTree.roots);

export function findNodeById(nodeId: ID): HierarchyNode | undefined {
  return mockHierarchyNodes.find((node) => node.id === nodeId);
}

export function getScopePath(nodeId: ID): ScopePathItem[] {
  return findNodeById(nodeId)?.path ?? [];
}

export function getDescendants(nodeId: ID): HierarchyNode[] {
  const node = findNodeById(nodeId);

  if (!node?.children?.length) {
    return [];
  }

  return flattenNodes(node.children);
}

export function isNodeWithinSubtree(
  nodeId: ID,
  subtreeRootId: ID,
): boolean {
  const node = findNodeById(nodeId);

  if (!node) {
    return false;
  }

  return node.path.some((pathItem) => pathItem.id === subtreeRootId);
}

export function toSelectedScope(nodeId: ID): SelectedScope | null {
  const node = findNodeById(nodeId);

  if (!node) {
    return null;
  }

  return {
    nodeId: node.id,
    nodeType: node.type,
    nodeName: node.name,
    path: node.path,
  };
}

export const hierarchyExampleIds = {
  ROOT_OPERATOR_ID,
  CUSTOMER_B_ID,
  SUNRISE_TOWERS_ID,
  TOWER_1_ID,
  FLOOR_12_ID,
  VENUE_LOUNGE_ID,
  VENUE_OFFICE_ID,
  CUSTOMER_DIRECT_ID,
  HARBOR_SITE_ID,
  HARBOR_VENUE_ID,
} as const;
