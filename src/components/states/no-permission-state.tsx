"use client";

import { LockIcon, ShieldAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NoPermissionStateProps = {
  title?: string;
  description?: string;
  onBack?: () => void;
  onChangeScope?: () => void;
};

export function NoPermissionState({
  title = "You do not have access to this content",
  description = "Try returning to a safe page or switch to a scope you are allowed to access.",
  onBack,
  onChangeScope,
}: NoPermissionStateProps) {
  return (
    <Card className="border-amber-200/70 bg-amber-50/40 shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldAlertIcon className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="mx-auto flex max-w-xl items-start justify-center gap-2 text-sm text-muted-foreground">
          <LockIcon className="mt-0.5 size-4 shrink-0" />
          <p>{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onBack ? (
            <Button onClick={onBack} type="button" variant="outline">
              Go Back
            </Button>
          ) : null}
          {onChangeScope ? (
            <Button onClick={onChangeScope} type="button">
              Change Scope
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
