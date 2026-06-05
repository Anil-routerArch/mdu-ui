type ConfigurationDetailPageProps = {
  params: Promise<{
    configId: string;
  }>;
};

export default async function ConfigurationDetailPage({
  params,
}: ConfigurationDetailPageProps) {
  const { configId } = await params;

  return (
    <section className="space-y-2">
      <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
        Route Placeholder
      </p>
      <h1 className="text-3xl font-semibold text-slate-950">
        Configuration Detail
      </h1>
      <p className="text-sm text-slate-600">Configuration ID: {configId}</p>
    </section>
  );
}
