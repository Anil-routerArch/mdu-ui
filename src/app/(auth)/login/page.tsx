import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
            MDU UI
          </p>
          <h1 className="text-2xl font-semibold text-slate-950">Login</h1>
          <p className="text-sm text-slate-600">
            Development-only auth bypass is enabled so the mock app opens directly
            into the authenticated UI.
          </p>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-sm text-slate-500">
            TODO: Replace this temporary bypass with real OWSEC/auth enforcement.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Open Mock App</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
