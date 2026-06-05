type CustomerDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { customerId } = await params;

  return (
    <section className="space-y-2">
      <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
        Route Placeholder
      </p>
      <h1 className="text-3xl font-semibold text-slate-950">
        Customer Detail
      </h1>
      <p className="text-sm text-slate-600">Customer ID: {customerId}</p>
    </section>
  );
}
