import { ActivityIcon, FolderTreeIcon, Layers3Icon, NetworkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HierarchyNode } from "@/types/hierarchy";

type NodeOverviewTabProps = {
  node: HierarchyNode;
  deviceCount: number;
  configurationCount: number;
};

function OverviewMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof ActivityIcon;
}) {
  return (
    <Card className="border border-slate-200/70 bg-slate-50/60 shadow-none">
      <CardContent className="flex items-center gap-3 pt-4">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="text-xl font-semibold text-slate-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function NodeOverviewTab({
  node,
  deviceCount,
  configurationCount,
}: NodeOverviewTabProps) {
  const scopePath = node.path.map((item) => item.name).join(" / ");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric
          label="Child Nodes"
          value={node.metadata.childCount ?? node.children?.length ?? 0}
          icon={FolderTreeIcon}
        />
        <OverviewMetric
          label="Devices"
          value={deviceCount || node.metadata.deviceCount || 0}
          icon={NetworkIcon}
        />
        <OverviewMetric
          label="Configurations"
          value={configurationCount}
          icon={Layers3Icon}
        />
        <OverviewMetric
          label="Scope Depth"
          value={node.path.length}
          icon={ActivityIcon}
        />
      </div>

      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Node Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Node Type
              </p>
              <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                {node.type.replaceAll("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Scope Path
              </p>
              <p className="mt-1 text-sm text-slate-700">{scopePath}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status Summary
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                  Workspace Active
                </Badge>
                {node.metadata.hasTopology ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Topology Ready
                  </Badge>
                ) : null}
                {node.metadata.hasMap ? (
                  <Badge variant="outline" className="bg-slate-100 text-slate-700">
                    Map-capable
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Metadata
            </p>
            <dl className="space-y-2 text-sm text-slate-700">
              {Object.entries(node.metadata).length > 0 ? (
                Object.entries(node.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-3">
                    <dt className="capitalize text-slate-500">{key.replaceAll(/([A-Z])/g, " $1")}</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {String(value)}
                    </dd>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-slate-500">
                  No additional metadata is available for this node.
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
