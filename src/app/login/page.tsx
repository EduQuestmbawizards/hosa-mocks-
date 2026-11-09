"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Activity, AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Shield, User } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const initialRole = searchParams.get("role");

  const supabase = createClient();

  const [isAdminLogin, setIsAdminLogin] = useState(initialRole === "admin");
  const [email, setEmail] = useState(initialRole === "admin" ? "rupali.eduquest@gmail.com" : "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLoginMode = (adminMode: boolean) => {
    setIsAdminLogin(adminMode);
    setError(null);
    if (adminMode && !email) {
      setEmail("rupali.eduquest@gmail.com");
    } else if (!adminMode && email === "rupali.eduquest@gmail.com") {
      setEmail("");
    }
  };

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
      {/* Role Toggle Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => toggleLoginMode(false)}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            !isAdminLogin
              ? "bg-white text-slate-900 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Student Login
        </button>
        <button
          type="button"
          onClick={() => toggleLoginMode(true)}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            isAdminLogin
              ? "bg-indigo-600 text-white shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Admin Login
        </button>
      </div>

      <div className="text-center space-y-2">
        <img
          src="/logo.png"
          alt="MBA Wizards"
          className="h-11 w-auto object-contain mx-auto"
        />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          {isAdminLogin ? "Admin Console Login" : "Student Login"}
          {isAdminLogin && (
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase">
              Admin
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-500">
          {isAdminLogin
            ? "Administrative credentials required to manage tests and student access."
            : "Aspire. Advance. Achieve. • Access your mock attempts and diagnostic reports."}
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
            {isAdminLogin ? "Admin Email Address" : "Email Address"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              placeholder={isAdminLogin ? "admin@mbawizards.com" : "name@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                isAdminLogin
                  ? "border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                  : "border-slate-300 focus:ring-sky-500"
              }`}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Password</label>
            {!isAdminLogin && (
              <Link
                href="/forgot-password"
                className="text-[11px] text-sky-600 hover:text-sky-700 font-medium"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-9 pr-11 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                isAdminLogin
                  ? "border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                  : "border-slate-300 focus:ring-sky-500"
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPassword((prev) => !prev);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 transition z-20 cursor-pointer focus:outline-none flex items-center justify-center"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-indigo-600" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-lg text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 ${
            isAdminLogin
              ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              : "bg-sky-600 hover:bg-sky-700 shadow-sky-200"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : isAdminLogin ? (
            <>
              <Shield className="w-4 h-4" />
              Sign In to Admin Console
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-500">
        {!isAdminLogin ? (
          <>
            <div>
              New to MBA Wizards?{" "}
              <Link href="/signup" className="font-semibold text-sky-600 hover:text-sky-700">
                Create an account & start free
              </Link>
            </div>
            <button
              type="button"
              onClick={() => toggleLoginMode(true)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3" /> Are you an Administrator? Sign in here &rarr;
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => toggleLoginMode(false)}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
          >
            ← Switch to Student Login
          </button>
        )}
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
