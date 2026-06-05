"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getConfigurationById,
  validateConfigurationDraft,
} from "@/lib/mock-api/configurations";
import { can } from "@/lib/rbac/can";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { AssignConfigurationDialog } from "./assign-configuration-dialog";
import { ConfigurationStatusBadge } from "./configuration-status-badge";
import { ConfigurationValidationErrors } from "./configuration-validation-errors";
import { EffectiveConfigurationPreview } from "./effective-configuration-preview";

type ConfigurationDetailPageProps = {
  configId: string;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function ConfigurationDetailPage({
  configId,
}: ConfigurationDetailPageProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedScope = useScopeStore((state) => state.selectedScope);
  const [assignOpen, setAssignOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftSettings, setDraftSettings] = useState('{\n  "ssid": "MDU-Guest"\n}');

  const detailQuery = useQuery({
    queryKey: ["configuration", configId, currentUser?.id ?? "none"],
    enabled: Boolean(currentUser),
    queryFn: () => getConfigurationById(configId, currentUser!),
  });

  const assignAllowed = useMemo(() => {
    if (!currentUser) {
      return false;
    }

    return can(currentUser, "assign", "configurations", selectedScope).allowed;
  }, [currentUser, selectedScope]);

  const editAllowed = useMemo(() => {
    if (!currentUser) {
      return false;
    }

    return can(currentUser, "edit", "configurations", selectedScope).allowed;
  }, [currentUser, selectedScope]);

  const validationQuery = useQuery({
    queryKey: ["configuration-validation", configId, draftName, draftSettings],
    enabled: Boolean(detailQuery.data),
    queryFn: () =>
      validateConfigurationDraft({
        name: draftName || detailQuery.data?.name,
        scopeId: detailQuery.data?.scopePath.at(-1)?.id,
        values: draftSettings.trim()
          ? { settings: draftSettings, scope: detailQuery.data?.scopePath.at(-1)?.name }
          : {},
      }),
  });

  if (!currentUser) {
    return <NoPermissionState description="No active session is available." />;
  }

  if (detailQuery.isLoading) {
    return <LoadingState title="Loading configuration" variant="page" rows={5} />;
  }

  if (detailQuery.isError) {
    if (
      isMockApiError(detailQuery.error) &&
      detailQuery.error.code === "BACKEND_UNAVAILABLE"
    ) {
      return <BackendUnavailableState onRetry={() => void detailQuery.refetch()} />;
    }

    if (isMockApiError(detailQuery.error) && detailQuery.error.code === "NO_PERMISSION") {
      return (
        <NoPermissionState description="This configuration is outside your permitted scope." />
      );
    }

    return <ErrorState error={detailQuery.error} onRetry={() => void detailQuery.refetch()} />;
  }

  const configuration = detailQuery.data;

  if (!configuration) {
    return (
      <ErrorState
        title="Configuration not available"
        description="The requested configuration could not be loaded."
      />
    );
  }

  const previewTargetId = configuration.scopePath.at(-1)?.id ?? null;
  const scopeSummary = configuration.scopePath.map((item) => item.name).join(" / ");
  const effectiveDraftName = draftName || configuration.name;

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl text-slate-950">{configuration.name}</CardTitle>
              <ConfigurationStatusBadge status={configuration.status} />
            </div>
            <p className="text-sm text-slate-600">{scopeSummary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {editAllowed ? (
              <Button type="button" variant="outline">
                Edit
              </Button>
            ) : null}
            {assignAllowed ? (
              <Button type="button" variant="outline" onClick={() => setAssignOpen(true)}>
                Assign Configuration
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-slate-200 bg-transparent p-0"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="effective-preview">Effective Preview</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <span className="text-slate-500">Version:</span> v
                  {configuration.currentVersion.version}
                </div>
                <div>
                  <span className="text-slate-500">Assignments:</span>{" "}
                  {configuration.assignmentCount}
                </div>
                <div>
                  <span className="text-slate-500">Updated:</span> {configuration.updatedAt}
                </div>
                <div>
                  <span className="text-slate-500">Description:</span>{" "}
                  {configuration.description ?? "No description"}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">
                  Version Change Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <span className="text-slate-500">Version ID:</span>{" "}
                  {configuration.currentVersion.id}
                </div>
                <div>
                  <span className="text-slate-500">Created:</span>{" "}
                  {configuration.currentVersion.createdAt}
                </div>
                <div>
                  <span className="text-slate-500">Created By:</span>{" "}
                  {configuration.currentVersion.createdByUserId}
                </div>
                <div>
                  <span className="text-slate-500">Change Summary:</span>{" "}
                  {configuration.currentVersion.changeSummary}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Settings Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
                  Settings are represented as a mock summary in this phase. Real
                  configuration editing, versioning, and rollout persistence remain deferred.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200/70 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Scope Root
                    </p>
                    <p className="mt-1 text-slate-900">
                      {configuration.scopePath.at(-1)?.name ?? "Unknown"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/70 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Current Version Notes
                    </p>
                    <p className="mt-1 text-slate-900">
                      {configuration.currentVersion.changeSummary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="pt-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-950">Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div>
                <span className="text-slate-500">Current assignment count:</span>{" "}
                {configuration.assignmentCount}
              </div>
              <div>
                <span className="text-slate-500">Scoped to:</span> {scopeSummary}
              </div>
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-amber-900">
                Assignment target compatibility, propagation, and rollout sequencing are
                deferred. This mock view focuses on scope visibility and operational impact.
              </div>
              {assignAllowed ? (
                <Button type="button" variant="outline" onClick={() => setAssignOpen(true)}>
                  Assign Configuration
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effective-preview" className="pt-4">
          <EffectiveConfigurationPreview targetId={previewTargetId} user={currentUser} />
        </TabsContent>

        <TabsContent value="validation" className="pt-4">
          <div className="space-y-4">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-slate-950">Interactive Draft</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Draft Name</label>
                    <Input
                      value={effectiveDraftName}
                      onChange={(event) => setDraftName(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="font-medium text-slate-700">Validation Target Scope</p>
                    <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3">
                      {scopeSummary}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Draft Settings</label>
                  <Textarea
                    className="min-h-40 font-mono"
                    value={draftSettings}
                    onChange={(event) => setDraftSettings(event.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {validationQuery.isLoading ? (
              <LoadingState title="Running validation" variant="section" rows={3} />
            ) : validationQuery.isError ? (
              <ErrorState
                error={validationQuery.error}
                onRetry={() => void validationQuery.refetch()}
              />
            ) : (
              <ConfigurationValidationErrors
                errors={validationQuery.data ?? []}
                suggestedFixes={{
                  name: "Use a non-empty configuration name.",
                  values: "Include at least one setting value in the draft.",
                  scopeId: "Keep the configuration scoped to a valid permitted target.",
                }}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {assignAllowed ? (
        <AssignConfigurationDialog
          configuration={configuration}
          user={currentUser}
          open={assignOpen}
          onOpenChange={setAssignOpen}
        />
      ) : null}
    </div>
  );
}
