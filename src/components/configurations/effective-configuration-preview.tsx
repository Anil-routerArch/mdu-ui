"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BackendUnavailableState,
  EmptyState,
  ErrorState,
  LoadingState,
  NoPermissionState,
} from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEffectiveConfigurationPreview } from "@/lib/mock-api/configurations";
import type { User } from "@/types/user";

type EffectiveConfigurationPreviewProps = {
  targetId: string | null;
  user: User;
};

type MockApiError = { code?: string };

function isMockApiError(error: unknown): error is MockApiError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function EffectiveConfigurationPreview({
  targetId,
  user,
}: EffectiveConfigurationPreviewProps) {
  const query = useQuery({
    queryKey: ["effective-configuration-preview", targetId ?? "none", user.id],
    enabled: Boolean(targetId),
    queryFn: () => getEffectiveConfigurationPreview(targetId!, user),
  });

  const previewSections = useMemo(() => {
    if (!query.data) {
      return [];
    }

    return Object.entries(query.data.effectiveValues).map(([key, value]) => {
      const overrideSource = query.data?.overrideSources[key];

      return {
        key,
        effectiveValue: value,
        overrideSource,
        mode: overrideSource ? "overridden" : "inherited",
      };
    });
  }, [query.data]);

  if (!targetId) {
    return (
      <EmptyState
        title="No preview target"
        description="A configuration preview target is not available for this configuration."
      />
    );
  }

  if (query.isLoading) {
    return <LoadingState title="Loading effective preview" variant="section" rows={4} />;
  }

  if (query.isError) {
    if (isMockApiError(query.error) && query.error.code === "BACKEND_UNAVAILABLE") {
      return <BackendUnavailableState onRetry={() => void query.refetch()} />;
    }

    if (isMockApiError(query.error) && query.error.code === "NO_PERMISSION") {
      return (
        <NoPermissionState description="Effective configuration preview is not available for this target." />
      );
    }

    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  if (!query.data || previewSections.length === 0) {
    return (
      <EmptyState
        title="No effective preview"
        description="No effective configuration values are available for this target."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Effective Preview Target</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>{query.data.targetPath.map((item) => item.name).join(" / ")}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
              {query.data.targetNodeType.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              {query.data.configurationIds.length} applied configuration
              {query.data.configurationIds.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">Assigned / Inherited Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {previewSections.map((entry) => (
              <div
                key={entry.key}
                className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{entry.key}</p>
                    <p className="text-sm text-slate-600">
                      Effective value: {String(entry.effectiveValue)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      entry.mode === "overridden"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }
                  >
                    {entry.mode === "overridden" ? "override" : "inherited"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">Override Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            {previewSections.some((entry) => entry.overrideSource) ? (
              previewSections
                .filter((entry) => entry.overrideSource)
                .map((entry) => (
                  <div
                    key={`${entry.key}-source`}
                    className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-4"
                  >
                    <p className="font-medium text-slate-900">{entry.key}</p>
                    <p className="mt-1 text-sm text-amber-900">
                      Overridden by: {entry.overrideSource}
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      Conflict indicator: later assignment overrides inherited value.
                    </p>
                  </div>
                ))
            ) : (
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-4 text-emerald-900">
                No overrides detected. Effective values currently align with inherited or directly
                assigned configuration data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
