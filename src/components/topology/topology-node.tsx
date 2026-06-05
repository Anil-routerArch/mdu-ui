"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertTriangleIcon, CheckCircle2Icon, RouterIcon, ScanEyeIcon, ServerIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeviceStatus, DeviceType } from "@/types/device";

export type TopologyFlowNodeData = {
  id: string;
  label: string;
  subtitle?: string;
  status: DeviceStatus | "summary";
  kind: DeviceType | "group";
  deviceId?: string;
  meta?: string;
};

const kindIcons = {
  gateway: RouterIcon,
  switch: ServerIcon,
  access_point: ScanEyeIcon,
  group: RouterIcon,
} as const;

const statusStyles = {
  online: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  offline: "bg-rose-50 text-rose-700 border-rose-200",
  unknown: "bg-slate-100 text-slate-700 border-slate-200",
  summary: "bg-blue-50 text-blue-700 border-blue-200",
} as const;

export function TopologyNode({ data, selected }: NodeProps) {
  const nodeData = data as TopologyFlowNodeData;
  const Icon = kindIcons[nodeData.kind] ?? RouterIcon;
  const statusClassName = statusStyles[nodeData.status] ?? statusStyles.unknown;

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-xl border bg-white p-3 shadow-sm transition-shadow",
        selected ? "border-blue-300 shadow-md" : "border-slate-200",
      )}
    >
      <Handle type="target" position={Position.Left} className="!size-2 !border-0 !bg-slate-300" />
      <Handle type="source" position={Position.Right} className="!size-2 !border-0 !bg-slate-300" />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Icon className="size-4" />
          </span>
          <Badge variant="outline" className={cn("capitalize", statusClassName)}>
            {nodeData.status}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="truncate text-sm font-medium text-slate-950">{nodeData.label}</p>
          <p className="truncate text-xs capitalize text-slate-500">
            {nodeData.subtitle ?? nodeData.kind.replaceAll("_", " ")}
          </p>
        </div>

        {nodeData.meta ? (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {nodeData.status === "warning" || nodeData.status === "offline" ? (
              <AlertTriangleIcon className="size-3.5 text-amber-600" />
            ) : (
              <CheckCircle2Icon className="size-3.5 text-emerald-600" />
            )}
            <span>{nodeData.meta}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
