"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoveRightIcon, PlusIcon, Trash2Icon } from "lucide-react";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { TopologyTab } from "@/components/topology";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getConfigurations } from "@/lib/mock-api/configurations";
import { getDevices } from "@/lib/mock-api/devices";
import { can } from "@/lib/rbac/can";
import { useUiStore } from "@/stores/ui-store";
import type { HierarchyNode, SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";
import { CreateNodeDialog } from "./create-node-dialog";
import { DeleteNodeDialog } from "./delete-node-dialog";
import { MoveNodeDialog } from "./move-node-dialog";
import { NodeConfigurationsTab } from "./node-configurations-tab";
import { NodeDevicesTab } from "./node-devices-tab";
import { NodeOverviewTab } from "./node-overview-tab";

type NodeWorkspaceProps = {
  node: HierarchyNode;
  selectedScope: SelectedScope;
  user: User;
  availableMoveTargets: HierarchyNode[];
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function NodeWorkspace({
  node,
  selectedScope,
  user,
  availableMoveTargets,
}: NodeWorkspaceProps) {
  const activeWorkspaceTab = useUiStore((state) => state.activeWorkspaceTab);
  const setActiveWorkspaceTab = useUiStore((state) => state.setActiveWorkspaceTab);
  const [createOpen, setCreateOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const createDecision = can(user, "create", "hierarchy", selectedScope);
  const moveDecision = can(user, "move", "hierarchy", selectedScope);
  const deleteDecision = can(user, "delete", "hierarchy", selectedScope);

  const deviceCountQuery = useQuery({
    queryKey: ["hierarchy", "node-workspace-device-count", node.id, user.id],
    queryFn: () => getDevices(node.id, user),
  });

  const configurationCountQuery = useQuery({
    queryKey: ["hierarchy", "node-workspace-config-count", node.id, user.id],
    queryFn: () => getConfigurations(node.id, user),
  });

  const scopeSummary = useMemo(
    () => node.path.map((item) => item.name).join(" / "),
    [node.path],
  );

  if (
    (deviceCountQuery.isError &&
      isMockApiError(deviceCountQuery.error) &&
      deviceCountQuery.error.code === "BACKEND_UNAVAILABLE") ||
    (configurationCountQuery.isError &&
      isMockApiError(configurationCountQuery.error) &&
      configurationCountQuery.error.code === "BACKEND_UNAVAILABLE")
  ) {
    return <BackendUnavailableState />;
  }

  if (
    (deviceCountQuery.isError &&
      isMockApiError(deviceCountQuery.error) &&
      deviceCountQuery.error.code === "NO_PERMISSION") ||
    (configurationCountQuery.isError &&
      isMockApiError(configurationCountQuery.error) &&
      configurationCountQuery.error.code === "NO_PERMISSION")
  ) {
    return <NoPermissionState description="You cannot load this node workspace." />;
  }

  if (deviceCountQuery.isError || configurationCountQuery.isError) {
    return (
      <ErrorState
        error={deviceCountQuery.error ?? configurationCountQuery.error}
        onRetry={() => {
          void deviceCountQuery.refetch();
          void configurationCountQuery.refetch();
        }}
      />
    );
  }

  if (deviceCountQuery.isLoading || configurationCountQuery.isLoading) {
    return <LoadingState title="Loading workspace" variant="section" rows={4} />;
  }

  const deviceCount = deviceCountQuery.data?.length ?? 0;
  const configurationCount = configurationCountQuery.data?.length ?? 0;

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl text-slate-950">{node.name}</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 capitalize">
                {node.type.replaceAll("_", " ")}
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                Active
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{scopeSummary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {createDecision.allowed ? (
              <Button type="button" variant="outline" onClick={() => setCreateOpen(true)}>
                <PlusIcon className="size-4" />
                Create Node
              </Button>
            ) : null}
            {moveDecision.allowed ? (
              <Button type="button" variant="outline" onClick={() => setMoveOpen(true)}>
                <MoveRightIcon className="size-4" />
                Move Node
              </Button>
            ) : null}
            {deleteDecision.allowed ? (
              <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2Icon className="size-4" />
                Delete Node
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeWorkspaceTab} onValueChange={(value) => setActiveWorkspaceTab(value as typeof activeWorkspaceTab)}>
        <TabsList variant="line" className="w-full justify-start border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topology">Topology</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <NodeOverviewTab
            node={node}
            deviceCount={deviceCount}
            configurationCount={configurationCount}
          />
        </TabsContent>

        <TabsContent value="topology" className="pt-4">
          <TopologyTab nodeId={node.id} />
        </TabsContent>

        <TabsContent value="devices" className="pt-4">
          <NodeDevicesTab scopeId={node.id} user={user} selectedScope={selectedScope} />
        </TabsContent>

        <TabsContent value="configurations" className="pt-4">
          <NodeConfigurationsTab scopeId={node.id} user={user} selectedScope={selectedScope} />
        </TabsContent>
      </Tabs>

      {createDecision.allowed ? (
        <CreateNodeDialog
          open={createOpen}
          parentScope={selectedScope}
          onOpenChange={setCreateOpen}
        />
      ) : null}

      {moveDecision.allowed ? (
        <MoveNodeDialog
          open={moveOpen}
          node={node}
          availableTargets={availableMoveTargets}
          onOpenChange={setMoveOpen}
        />
      ) : null}

      {deleteDecision.allowed ? (
        <DeleteNodeDialog
          open={deleteOpen}
          node={node}
          deviceCount={deviceCount}
          configurationCount={configurationCount}
          onOpenChange={setDeleteOpen}
        />
      ) : null}
    </div>
  );
}
