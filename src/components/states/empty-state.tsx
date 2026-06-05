import { InboxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  canAct?: boolean;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  canAct = false,
}: EmptyStateProps) {
  const showAction = Boolean(actionLabel && onAction && canAct);

  return (
    <Card className="border-dashed border-border/70 shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <InboxIcon className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {description ? (
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
        {showAction ? (
          <Button onClick={onAction} type="button">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
