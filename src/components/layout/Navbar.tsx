"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Layers,
  Lock,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser);

        if (currentUser) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

          setProfile(prof);
        }
      } catch (err) {
        console.error("Navbar auth load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(prof);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const isExamAttempt = pathname.startsWith("/attempt");

  // In active exam attempt screen, hide standard navbar to prevent distractions
  if (isExamAttempt) {
    return null;
  }

  return (
    <header className="site-header sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <img
              src="/logo.png"
              alt="EduQuest - Reimagining Education"
              className="h-10 sm:h-11 w-auto object-contain group-hover:opacity-95 transition"
            />
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md ml-1">
              Portal
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className={`transition hover:text-sky-600 ${
                pathname === "/" ? "text-sky-600 font-semibold" : ""
              }`}
            >
              Overview
            </Link>
            <Link
              href="/mocks"
              className={`transition hover:text-sky-600 ${
                pathname.startsWith("/mocks") ? "text-sky-600 font-semibold" : ""
              }`}
            >
              Mocks & Practice
            </Link>
            <Link
              href="/#blueprint"
              className="transition hover:text-sky-600"
            >
              Exam Blueprint
            </Link>
            <Link
              href="/#round-two"
              className="transition hover:text-sky-600 flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              ST Skills
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className={`transition hover:text-sky-600 ${
                  pathname.startsWith("/dashboard")
                    ? "text-sky-600 font-semibold"
                    : ""
                }`}
              >
                My Dashboard
              </Link>
            )}

            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition ${
                  pathname.startsWith("/admin") ? "ring-2 ring-indigo-400" : ""
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User Status & Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Status Badge */}
                {profile?.role !== "admin" && (
                  <div
                    className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${
                      profile?.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {profile?.status === "approved" ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Approved
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        Pending Approval
                      </>
                    )}
                  </div>
                )}

                <span className="text-xs text-slate-600 font-medium truncate max-w-[140px]">
                  {profile?.full_name || user.email}
                </span>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-md hover:bg-rose-50"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?role=admin"
                  className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Login
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-sky-600 px-3 py-1.5 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg shadow-sm shadow-sky-200 transition"
                >
                  Start Free Mock
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Responsive for all screen sizes down to 360px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl">
          <div className="flex flex-col gap-3">
            {user && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-1">
                <div className="text-sm font-bold text-slate-800">
                  {profile?.full_name || "Student"}
                </div>
                <div className="text-xs text-slate-500 mb-2">{user.email}</div>
                <div
                  className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-medium items-center gap-1 ${
                    profile?.status === "approved" || profile?.role === "admin"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {profile?.status === "approved" || profile?.role === "admin"
                    ? "Full Access Active"
                    : "Pending Approval (Free Mock Unlocked)"}
                </div>
              </div>
            )}

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Overview
            </Link>
            <Link
              href="/mocks"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname.startsWith("/mocks")
                  ? "bg-sky-50 text-sky-700 font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Mock Tests & Diagnostic
            </Link>
            <Link
              href="/#blueprint"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Official HOSA Blueprint
            </Link>
            <Link
              href="/#round-two"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md flex items-center justify-between"
            >
              <span>ST Round Two Clinical Skills</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                70% Mastery
              </span>
            </Link>

            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-sky-600 bg-sky-50 rounded-md"
              >
                My Student Dashboard
              </Link>
            )}

            {profile?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <Link
                    href="/login?role=admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg"
                  >
                    Student Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                  >
                    Start Free Mock Exam
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

