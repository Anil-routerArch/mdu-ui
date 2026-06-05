"use client";

import type { ReactNode } from "react";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PartialDataStateProps = {
  title?: string;
  description?: string;
  failedSections?: string[];
  onRetry?: () => void;
  children?: ReactNode;
};

export function PartialDataState({
  title = "Some data could not be loaded",
  description = "Available content is shown below. Missing sections may be retried.",
  failedSections = [],
  onRetry,
  children,
}: PartialDataStateProps) {
  return (
    <div className="space-y-4">
      <Alert className="border-amber-200/70 bg-amber-50/50">
        <AlertTriangleIcon className="size-4 text-amber-700" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{description}</p>
          {failedSections.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Failed sections</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {failedSections.map((section) => (
                  <li key={section}>{section}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {onRetry ? (
            <Button onClick={onRetry} type="button" variant="outline">
              <RefreshCwIcon className="size-4" />
              Retry
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
      {children ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-4">{children}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
