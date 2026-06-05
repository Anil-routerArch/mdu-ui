"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
};

function getSafeErrorText(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong while loading this content.";
}

export function ErrorState({
  title = "Unable to load data",
  description,
  error,
  onRetry,
  retryLabel = "Retry",
}: ErrorStateProps) {
  const safeErrorText = getSafeErrorText(error);

  return (
    <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
      <AlertTriangleIcon className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{description ?? safeErrorText ?? "Please try again."}</p>
        {onRetry ? (
          <Button onClick={onRetry} type="button" variant="outline">
            <RefreshCwIcon className="size-4" />
            {retryLabel}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
