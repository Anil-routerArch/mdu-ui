import { ConfigurationDetailPage } from "@/components/configurations";

type ConfigurationDetailRoutePageProps = {
  params: Promise<{
    configId: string;
  }>;
};

export default async function ConfigurationDetailRoutePage({
  params,
}: ConfigurationDetailRoutePageProps) {
  const { configId } = await params;

  return <ConfigurationDetailPage configId={configId} />;
}
