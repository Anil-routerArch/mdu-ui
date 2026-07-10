import { OperatorDetailPage } from "@/components/operators";

type OperatorDetailRoutePageProps = {
  params: Promise<{
    operatorId: string;
  }>;
};

export default async function OperatorDetailRoutePage({
  params,
}: OperatorDetailRoutePageProps) {
  const { operatorId } = await params;

  return <OperatorDetailPage operatorId={operatorId} />;
}
