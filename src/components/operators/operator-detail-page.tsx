"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Network, Tag, Users, ShieldAlert, Store } from "lucide-react";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOperatorById } from "@/lib/mock-api/operators";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { EditOperatorForm } from "./edit-operator-form";
import { DeleteOperatorConfirmation } from "./delete-operator-confirmation";

type OperatorDetailPageProps = {
  operatorId: string;
};

function formatSafeDate(timestamp: number): string {
  if (!timestamp) return "Never";
  let ms = timestamp;
  if (timestamp < 9466848000) {
    ms = timestamp * 1000;
  }
  if (ms < 946684800000 || ms > 4102444800000) {
    return "Never";
  }
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "Never";
  }
}

export function OperatorDetailPage({ operatorId }: OperatorDetailPageProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const query = useQuery({
    queryKey: ["operator", operatorId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser),
    queryFn: () => getOperatorById(operatorId),
  });

  const editAllowed = useMemo(
    () => (currentUser ? can(currentUser, "edit", "operators", selectedScope).allowed : false),
    [currentUser, selectedScope]
  );
  const deleteAllowed = useMemo(
    () => (currentUser ? can(currentUser, "delete", "operators", selectedScope).allowed : false),
    [currentUser, selectedScope]
  );

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading operator details" variant="page" rows={5} />;
  }

  if (query.isError) {
    const errMsg = (query.error as any)?.message || "";
    if (errMsg.includes("unreachable") || errMsg.includes("not configured")) {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const operator = query.data;

  if (!operator) {
    return (
      <ErrorState
        title="Operator not available"
        description="The requested operator could not be loaded."
      />
    );
  }

  return (
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Store className="h-6 w-6 text-slate-800" />
              <CardTitle className="text-2xl text-slate-950">{operator.name}</CardTitle>
              {operator.defaultOperator && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Default Operator
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">ID: {operator.id}</p>
            <p className="text-sm text-slate-500">Registration ID: {operator.registrationId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {editAllowed && (
              <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                Edit Details
              </Button>
            )}
            {deleteAllowed && (
              <Button
                type="button"
                variant="outline"
                className="text-rose-600 hover:text-rose-700"
                onClick={() => setDeleteOpen(true)}
              >
                Delete Operator
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-slate-200 bg-transparent p-0"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="service-classes">Service Classes</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Operator Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <span className="text-slate-500">Name:</span> {operator.name}
                </div>
                <div>
                  <span className="text-slate-500">Registration ID:</span> {operator.registrationId}
                </div>
                <div>
                  <span className="text-slate-500">Description:</span> {operator.description || "-"}
                </div>
                <div>
                  <span className="text-slate-500">Source IP List:</span>{" "}
                  {operator.sourceIP && operator.sourceIP.length > 0
                    ? operator.sourceIP.join(", ")
                    : "No IP restrictions"}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Rules & Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <span className="text-slate-500">Firmware Upgrade:</span>{" "}
                  {operator.deviceRules?.firmwareUpgrade === "yes"
                    ? "Allowed"
                    : operator.deviceRules?.firmwareUpgrade === "no"
                    ? "Disabled"
                    : "RC Only"}
                </div>
                <div>
                  <span className="text-slate-500">RC Only:</span>{" "}
                  {operator.deviceRules?.rcOnly ? "Enabled" : "Disabled"}
                </div>
                <div>
                  <span className="text-slate-500">Firmware RC Only:</span>{" "}
                  {operator.firmwareRCOnly ? "Enabled" : "Disabled"}
                </div>
                <div>
                  <span className="text-slate-500">Created:</span> {formatSafeDate(operator.created)}
                </div>
                <div>
                  <span className="text-slate-500">Modified:</span> {formatSafeDate(operator.modified)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="pt-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Network className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-lg font-medium text-slate-950 mb-1">Operator Devices</p>
              <p className="text-sm">There are no devices registered under this operator.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-classes" className="pt-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Tag className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-lg font-medium text-slate-950 mb-1">Service Classes</p>
              <p className="text-sm">No service classes are defined for this operator.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="pt-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Users className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-lg font-medium text-slate-950 mb-1">Subscribers</p>
              <p className="text-sm">There are no active signups or subscribers.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="pt-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-950">Management Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {editAllowed && (
                <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                  Edit Operator Settings
                </Button>
              )}
              {deleteAllowed && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => setDeleteOpen(true)}
                >
                  Permanently Delete Operator
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditOperatorForm
        operator={operator}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteOperatorConfirmation
        operator={operator}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => router.push("/operators")}
      />
    </div>
  );
}
