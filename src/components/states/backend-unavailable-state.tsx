"use client";

import { RefreshCwIcon, ServerCrashIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type BackendUnavailableStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function BackendUnavailableState({
  title = "Service temporarily unavailable",
  description = "The application shell can remain visible while backend data is unavailable. Try again in a moment.",
  onRetry,
}: BackendUnavailableStateProps) {
  return (
    <Alert className="border-sky-200/70 bg-sky-50/50">
      <ServerCrashIcon className="size-4 text-sky-700" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{description}</p>
        {onRetry ? (
          <Button onClick={onRetry} type="button" variant="outline">
            <RefreshCwIcon className="size-4" />
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
