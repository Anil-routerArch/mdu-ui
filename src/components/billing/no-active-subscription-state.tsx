import { EmptyState } from "@/components/states";

type NoActiveSubscriptionStateProps = {
  canSelect?: boolean;
  onSelectPlan?: () => void;
};

export function NoActiveSubscriptionState({
  canSelect = false,
  onSelectPlan,
}: NoActiveSubscriptionStateProps) {
  return (
    <EmptyState
      title="No active subscription"
      description="No current subscription is available for this billing scope."
      actionLabel={canSelect ? "Select Plan" : undefined}
      onAction={canSelect ? onSelectPlan : undefined}
      canAct={canSelect}
    />
  );
}
