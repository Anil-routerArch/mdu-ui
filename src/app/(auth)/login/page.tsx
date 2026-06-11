"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const loginAsUser = useAuthStore((state) => state.loginAsUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await loginAsUser(email, password, rememberMe);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Please verify your email and password.");
      }
    } catch (err) {
      setError("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#081224] px-4 py-12 sm:px-6">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 size-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 size-96 rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6">
        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800 bg-[#0f1b31]/80 p-8 shadow-2xl backdrop-blur-md">
          <div className="space-y-2 text-center">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-2">
              <SparklesIcon className="size-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Multi-Tenant Management
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome to MDU
            </h1>
            <p className="text-sm text-slate-400">
              Sign in with your real uCentral OWSEC credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <MailIcon className="size-4" />
                </div>
                <Input
                  type="email"
                  placeholder="name@ucentral.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#16243d] border-slate-700 pl-10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <LockIcon className="size-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#16243d] border-slate-700 pl-10 pr-10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="size-4 rounded border-slate-700 bg-[#16243d] text-blue-500 focus:ring-0"
                />
                Remember Me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {loading ? (
                <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
