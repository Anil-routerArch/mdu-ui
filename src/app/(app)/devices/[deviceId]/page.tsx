type DeviceDetailPageProps = {
  params: Promise<{
    deviceId: string;
  }>;
};

export default async function DeviceDetailPage({
  params,
}: DeviceDetailPageProps) {
  const { deviceId } = await params;

  return (
    <section className="space-y-2">
      <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
        Route Placeholder
      </p>
      <h1 className="text-3xl font-semibold text-slate-950">Device Detail</h1>
      <p className="text-sm text-slate-600">Device ID: {deviceId}</p>
    </section>
  );
}
