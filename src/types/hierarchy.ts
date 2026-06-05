import type { ID } from "@/types/common";

export type HierarchyNodeType =
  | "operator"
  | "customer"
  | "sub_operator"
  | "site"
  | "building"
  | "tower"
  | "floor"
  | "venue";

export interface ScopePathItem {
  id: ID;
  type: HierarchyNodeType;
  name: string;
}

export interface NodeMetadata {
  entityId?: ID;
  venueId?: ID;
  customerId?: ID;
  siteId?: ID;
  buildingId?: ID;
  towerId?: ID;
  floorId?: ID;
  deviceCount?: number;
  clientCount?: number;
  childCount?: number;
  venueCount?: number;
  hasTopology?: boolean;
  hasMap?: boolean;
}

export interface HierarchyNode {
  id: ID;
  type: HierarchyNodeType;
  name: string;
  parentId: ID | null;
  path: ScopePathItem[];
  metadata: NodeMetadata;
  children?: HierarchyNode[];
  hasChildren: boolean;
  isSelectable: boolean;
}

export interface SelectedScope {
  nodeId: ID;
  nodeType: HierarchyNodeType;
  nodeName: string;
  path: ScopePathItem[];
}

export interface HierarchyTree {
  roots: HierarchyNode[];
  selectedScope: SelectedScope | null;
}
