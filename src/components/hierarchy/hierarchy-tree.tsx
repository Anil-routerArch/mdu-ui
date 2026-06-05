"use client";

import { useMemo, useState } from "react";
import {
  Building2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  Layers3Icon,
  MapPinnedIcon,
  NetworkIcon,
  PanelsTopLeftIcon,
  SquareStackIcon,
  TowerControlIcon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { HierarchyNode } from "@/types/hierarchy";

const nodeIcons = {
  operator: TowerControlIcon,
  customer: UsersIcon,
  sub_operator: NetworkIcon,
  site: MapPinnedIcon,
  building: Building2Icon,
  tower: PanelsTopLeftIcon,
  floor: Layers3Icon,
  venue: WarehouseIcon,
} as const;

type HierarchyTreeProps = {
  roots: HierarchyNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
};

function getExpandedFromSelection(roots: HierarchyNode[], selectedNodeId: string | null) {
  if (!selectedNodeId) {
    return new Set<string>();
  }

  const expanded = new Set<string>();

  const walk = (nodes: HierarchyNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === selectedNodeId) {
        expanded.add(node.id);
        return true;
      }

      if (node.children?.length && walk(node.children)) {
        expanded.add(node.id);
        return true;
      }
    }

    return false;
  };

  walk(roots);
  return expanded;
}

function TreeNode({
  node,
  level,
  expandedIds,
  onToggle,
  selectedNodeId,
  onSelectNode,
}: {
  node: HierarchyNode;
  level: number;
  expandedIds: Set<string>;
  onToggle: (nodeId: string) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}) {
  const Icon = nodeIcons[node.type] ?? SquareStackIcon;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition-colors",
          isSelected ? "border-blue-200 bg-blue-50/80" : "hover:bg-slate-50",
        )}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn(
            "shrink-0",
            !hasChildren && "pointer-events-none opacity-40",
          )}
          onClick={() => onToggle(node.id)}
          aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDownIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />
          ) : (
            <span className="size-3.5" />
          )}
        </Button>

        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => onSelectNode(node.id)}
        >
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-slate-900">
              {node.name}
            </span>
            <span className="block text-xs text-slate-500 capitalize">
              {node.type.replaceAll("_", " ")}
            </span>
          </span>
        </button>

        {typeof node.metadata.childCount === "number" ? (
          <Badge variant="outline" className="bg-white text-slate-600">
            {node.metadata.childCount}
          </Badge>
        ) : null}
      </div>

      {hasChildren && isExpanded ? (
        <div className="space-y-1">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HierarchyTree({
  roots,
  selectedNodeId,
  onSelectNode,
}: HierarchyTreeProps) {
  const defaultExpanded = useMemo(
    () => getExpandedFromSelection(roots, selectedNodeId),
    [roots, selectedNodeId],
  );
  const [manualExpandedIds, setManualExpandedIds] = useState<Set<string>>(defaultExpanded);
  const expandedIds = useMemo(
    () => new Set([...manualExpandedIds, ...defaultExpanded]),
    [defaultExpanded, manualExpandedIds],
  );

  const toggleNode = (nodeId: string) => {
    setManualExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  };

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">Hierarchy Tree</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {roots.map((root) => (
          <TreeNode
            key={root.id}
            node={root}
            level={0}
            expandedIds={expandedIds}
            onToggle={toggleNode}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        ))}
      </CardContent>
    </Card>
  );
}
