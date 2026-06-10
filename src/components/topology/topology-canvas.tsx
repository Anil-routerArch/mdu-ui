"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Device } from "@/types/device";
import { TopologyNode, type TopologyFlowNodeData } from "./topology-node";
import type { TopologyOverlayState } from "./topology-overlay-controls";

type TopologyCanvasProps = {
  title?: string;
  contextLabel: string;
  nodes: Node<TopologyFlowNodeData>[];
  edges: Edge[];
  overlays: TopologyOverlayState;
  onNodeClick?: (deviceId: string) => void;
  devicesById?: Record<string, Device>;
};

const nodeTypes = {
  topology: TopologyNode,
};

export function TopologyCanvas({
  title = "Topology",
  contextLabel,
  nodes,
  edges,
  overlays,
  onNodeClick,
}: TopologyCanvasProps) {
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (node.data.kind === "gateway") {
        return overlays.gateways;
      }
      if (node.data.kind === "switch") {
        return overlays.switches;
      }
      if (node.data.kind === "access_point") {
        return overlays.access_points;
      }

      return true;
    });
  }, [nodes, overlays.access_points, overlays.gateways, overlays.switches]);

  const visibleNodeIds = useMemo(
    () => new Set(filteredNodes.map((node) => node.id)),
    [filteredNodes],
  );

  const filteredEdges = useMemo(() => {
    if (!overlays.links) {
      return [];
    }

    return edges
      .filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
      .map((edge) => ({
        ...edge,
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
  }, [edges, overlays.links, visibleNodeIds]);

  const handleNodeClick: NodeMouseHandler<Node<TopologyFlowNodeData>> = (_, node) => {
    if (node.data.deviceId && onNodeClick) {
      onNodeClick(node.data.deviceId);
    }
  };

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">{title}</CardTitle>
        <p className="text-sm text-slate-500">{contextLabel}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[520px] overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50/40">
          <ReactFlow
            fitView
            nodes={filteredNodes}
            edges={filteredEdges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} color="var(--mdu-topology-grid)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}
