"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Activity, AlertCircle, Loader2, Lock, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Check role to redirect appropriately
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(redirectUrl);
      }
      router.refresh();
    } catch (err: any) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-200">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Log In to EduQuest
        </h1>
        <p className="text-xs text-slate-500">
          Access your mock test attempts, weak topic reports, and exams.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-sky-600 hover:text-sky-700 font-medium"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-200 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        New to EduQuest?{" "}
        <Link href="/signup" className="font-semibold text-sky-600 hover:text-sky-700">
          Create an account & start free
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0">
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
