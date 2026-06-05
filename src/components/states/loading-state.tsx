import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  title?: string;
  description?: string;
  variant?: "page" | "section" | "table" | "card";
  rows?: number;
};

function LoadingHeader({
  title,
  description,
}: Pick<LoadingStateProps, "title" | "description">) {
  if (!title && !description) {
    return null;
  }

  return (
    <div className="space-y-2">
      {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={`table-row-${index + 1}`} className="grid grid-cols-4 gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={`card-skeleton-${index + 1}`} className="border-border/60 shadow-sm">
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SectionSkeleton({ rows }: { rows: number }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-4 pt-4">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={`section-skeleton-${index + 1}`} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

function PageSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: Math.min(rows, 4) }).map((_, index) => (
          <Skeleton key={`page-kpi-${index + 1}`} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <SectionSkeleton rows={Math.max(rows, 3)} />
    </div>
  );
}

export function LoadingState({
  title = "Loading",
  description,
  variant = "section",
  rows = 5,
}: LoadingStateProps) {
  return (
    <div className="space-y-4">
      <LoadingHeader title={title} description={description} />
      {variant === "table" ? <TableSkeleton rows={rows} /> : null}
      {variant === "card" ? <CardSkeleton rows={rows} /> : null}
      {variant === "section" ? <SectionSkeleton rows={rows} /> : null}
      {variant === "page" ? <PageSkeleton rows={rows} /> : null}
    </div>
  );
}
