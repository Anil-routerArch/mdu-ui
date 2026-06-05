import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";

import { EmptyState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConfigurationValidationError } from "@/types/config";

type ConfigurationValidationErrorsProps = {
  errors: ConfigurationValidationError[];
  title?: string;
  suggestedFixes?: Partial<Record<string, string>>;
};

export function ConfigurationValidationErrors({
  errors,
  title = "Validation Results",
  suggestedFixes = {},
}: ConfigurationValidationErrorsProps) {
  if (!errors.length) {
    return (
      <EmptyState
        title="No validation issues"
        description="The current configuration draft does not report validation errors."
      />
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {errors.map((error) => {
          const suggestedFix = suggestedFixes[error.field];

          return (
            <div
              key={`${error.field}-${error.code}`}
              className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangleIcon className="size-4 text-amber-600" />
                    <p className="font-medium text-slate-900">{error.field}</p>
                  </div>
                  <p className="text-sm text-slate-600">{error.message}</p>
                  <p className="text-xs text-slate-500">Code: {error.code}</p>
                  {suggestedFix ? (
                    <div className="flex items-start gap-2 text-xs text-emerald-700">
                      <CheckCircle2Icon className="mt-0.5 size-3.5" />
                      <span>{suggestedFix}</span>
                    </div>
                  ) : null}
                </div>
                <Badge
                  variant="outline"
                  className={
                    error.severity === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }
                >
                  {error.severity}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
