import { DeviceDetailPage } from "@/components/devices";

type DeviceDetailRoutePageProps = {
  params: Promise<{
    deviceId: string;
  }>;
};

export default async function DeviceDetailRoutePage({
  params,
}: DeviceDetailRoutePageProps) {
  const { deviceId } = await params;

  return <DeviceDetailPage deviceId={deviceId} />;
}
