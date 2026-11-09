"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Activity, AlertCircle, CheckCircle2, Loader2, Lock, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    events: ["ST"] as ("ST" | "HCIE")[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  const toggleEvent = (event: "ST" | "HCIE") => {
    setFormData((prev) => {
      if (prev.events.includes(event)) {
        if (prev.events.length === 1) return prev; // Keep at least one
        return { ...prev, events: prev.events.filter((e) => e !== event) };
      } else {
        return { ...prev, events: [...prev.events, event] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Automatically sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        console.warn("Auto sign-in notice:", signInError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-0">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-200">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-500">
            Register for the EduQuest HOSA 2026-27 Mock Test Portal. Free mock unlocked immediately!
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              Account created successfully! Admin notified. Redirecting to your dashboard...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-rose-600 text-[11px] mt-1">{fieldErrors.fullName[0]}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-rose-600 text-[11px] mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          {/* Phone & City (2 columns on tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-rose-600 text-[11px] mt-1">{fieldErrors.phone[0]}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                City / Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai / Dallas"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              {fieldErrors.city && (
                <p className="text-rose-600 text-[11px] mt-1">{fieldErrors.city[0]}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password (min. 8 characters) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-rose-600 text-[11px] mt-1">{fieldErrors.password[0]}</p>
            )}
          </div>

          {/* HOSA Events Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="block font-semibold text-slate-700">
              Which HOSA event(s) are you preparing for? <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => toggleEvent("ST")}
                className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                  formData.events.includes("ST")
                    ? "border-sky-500 bg-sky-50 text-sky-900 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="text-xs">Surgical Tech (ST)</div>
                  <div className="text-[10px] text-slate-500">6 Categories & AST</div>
                </div>
                {formData.events.includes("ST") && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleEvent("HCIE")}
                className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                  formData.events.includes("HCIE")
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="text-xs">Healthcare Issues (HCIE)</div>
                  <div className="text-[10px] text-slate-500">News Recall & Essay</div>
                </div>
                {formData.events.includes("HCIE") && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-200 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Registration...
              </>
            ) : (
              "Complete Signup & Access Free Mock"
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}

