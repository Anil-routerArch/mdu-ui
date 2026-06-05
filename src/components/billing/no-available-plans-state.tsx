import { EmptyState } from "@/components/states";

export function NoAvailablePlansState() {
  return (
    <EmptyState
      title="No available plans"
      description="There are no eligible active parent-offered billing plans for the selected scope."
    />
  );
}
