type UserDetailPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;

  return (
    <section className="space-y-2">
      <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
        Route Placeholder
      </p>
      <h1 className="text-3xl font-semibold text-slate-950">User Detail</h1>
      <p className="text-sm text-slate-600">User ID: {userId}</p>
    </section>
  );
}
