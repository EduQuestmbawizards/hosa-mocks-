import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Lock,
  Newspaper,
  Shield,
  Sparkles,
  Unlock,
} from "lucide-react";

export const revalidate = 60; // Cache for 60 seconds

export default async function HomePage() {
  const supabase = await createClient();

  // Get current user and profile status if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: any = null;
  let testAccessList: string[] = [];

  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = prof;

    const { data: accessRows } = await supabase
      .from("test_access")
      .select("test_id")
      .eq("user_id", user.id);
    testAccessList = (accessRows || []).map((r) => r.test_id);
  }

  // Fetch published tests
  const { data: testsData } = await supabase
    .from("tests")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const tests = testsData || [
    {
      id: "demo-st-1",
      slug: "st-mock-1",
      title: "Surgical Technologist – Mock 1 (Official Blueprint)",
      event: "ST",
      kind: "mock",
      duration_min: 60,
      total_questions: 50,
      is_free: true,
      instructions: "50 MCQ strictly split 5/5/10/15/5/10 across AST chapters 1, 4, 7, 10, 11, 16.",
    },
    {
      id: "demo-st-2",
      slug: "st-mock-2",
      title: "Surgical Technologist – Mock 2 (Clinical Focus)",
      event: "ST",
      kind: "mock",
      duration_min: 60,
      total_questions: 50,
      is_free: false,
      instructions: "Full exam conditions with advanced intraoperative surgical technology scenarios.",
    },
    {
      id: "demo-st-practice",
      slug: "st-practice-a",
      title: "Surgical Technologist – Practice Set A (Sterility)",
      event: "ST",
      kind: "practice",
      duration_min: 30,
      total_questions: 25,
      is_free: false,
      instructions: "Practice mode with instant feedback and textbook explanations.",
    },
    {
      id: "demo-hcie-1",
      slug: "hcie-mock-1",
      title: "Healthcare Issues Exam – Mock 1 (News Fact-Recall)",
      event: "HCIE",
      kind: "mock",
      duration_min: 60,
      total_questions: 50,
      is_free: false,
      instructions: "Fact-recall from MedicalNewsToday, ScienceDaily & Johns Hopkins + ~500 word tiebreaker essay.",
    },
  ];

  const isApproved = profile?.status === "approved" || profile?.role === "admin";

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* -------------------------------------------------------------------------
          HERO SECTION
          ------------------------------------------------------------------------- */}
      <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-16 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>MBA Wizards Mock Portal &bull; Aspire. Advance. Achieve.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Real-Fidelity HOSA Mock Tests for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
                ST & HCIE
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Practise under exact HOSA 2026-27 tournament conditions. Experience the official 60-minute plain countdown, the precise 50-MCQ category weighting, and comprehensive AST textbook and health news citations.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-200 transition text-sm"
              >
                Start Free ST Mock Test
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/mocks"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition text-sm cursor-pointer"
              >
                Browse Mock Tests Arena
              </Link>
            </div>

            {/* Highlight Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                <Clock className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>60-Min Plain Clock</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>50 MCQ (A–D Options)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Round Two 70% Mastery</span>
              </div>
            </div>
          </div>

          {/* Right Card Graphic */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                    HOSA Testing Arena
                  </span>
                </div>
                <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 border border-slate-600">
                  2026-27 Edition
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xs text-sky-400 font-semibold mb-1">
                    Surgical Technologist (ST)
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    AST 6-Category Blueprint (5/5/10/15/5/10)
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Chapters 1, 4, 7, 10, 11, 16 + Nemitz instruments
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xs text-emerald-400 font-semibold mb-1">
                    Healthcare Issues Exam (HCIE)
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    News Fact-Recall + 500-Word Essay
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    MedicalNewsToday, Johns Hopkins, ScienceDaily, Healthline
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-sky-950/60 border border-sky-800/50 flex items-center justify-between">
                  <span className="text-xs text-sky-200">First Mock is 100% Free</span>
                  <span className="text-xs font-bold text-sky-400 uppercase">
                    Free Access
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          STUDENT STATUS ALERT (WHEN LOGGED IN)
          ------------------------------------------------------------------------- */}
      {user && profile && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isApproved
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isApproved ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5 animate-spin" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Logged in as {profile.full_name} ({profile.email})
                </h3>
                <p className="text-xs text-slate-500">
                  {isApproved
                    ? "Your account is approved! All mock tests and practice sets are unlocked."
                    : "Status: Pending Admin Approval. The Free Mock is unlocked for you; additional tests unlock once approved by Rupali."}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------------------
          TEST CARDS CATALOG GRID
          ------------------------------------------------------------------------- */}
      <section id="tests" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Mock Tests & Practice Catalog
            </h2>
            <p className="text-sm text-slate-500">
              Exam-condition mocks (60 min / 50 MCQ) and targeted practice modules.
            </p>
          </div>
          <Link
            href="/mocks"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition self-start sm:self-auto"
          >
            <span>Open Dedicated Arena (3 Tabs)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test: any) => {
            const hasOverride = testAccessList.includes(test.id);
            const canAccess = test.is_free || isApproved || hasOverride;

            return (
              <div
                key={test.id}
                className={`relative bg-white rounded-xl border transition flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  test.is_free
                    ? "border-emerald-300 ring-1 ring-emerald-200"
                    : canAccess
                    ? "border-slate-300"
                    : "border-slate-200 opacity-95 bg-slate-50/50"
                }`}
              >
                {/* Free Badge Ribbon */}
                {test.is_free && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg shadow-sm">
                    FREE MOCK
                  </div>
                )}

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Category & Status Header */}
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full ${
                        test.event === "ST"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {test.event === "ST" ? "Surgical Tech" : "Healthcare Issues"}
                    </span>
                    <span className="font-semibold uppercase tracking-wider text-slate-500">
                      {test.kind === "mock" ? "Mock Exam" : "Practice Set"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {test.instructions || "Real test conditions with AST citations."}
                    </p>
                  </div>

                  {/* Specs */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.duration_min} Minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.total_questions} Questions</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  {canAccess ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlocked & Ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold" title="Waiting for admin approval">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pending Approval</span>
                    </div>
                  )}

                  {canAccess ? (
                    <Link
                      href={`/tests/${test.slug || test.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition"
                    >
                      Take Test
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={user ? "/dashboard" : "/signup"}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition"
                    >
                      {user ? "View Status" : "Sign Up to Request"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          EXAM BLUEPRINT SECTION (§6.1)
          ------------------------------------------------------------------------- */}
      <section id="blueprint" className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Official Surgical Technologist (ST) Blueprint
          </h2>
          <p className="text-sm text-slate-500">
            Source: Official HOSA 2026-27 Guidelines & Association of Surgical Technologists (AST)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Official Weight</th>
                  <th className="py-3 px-4">Questions (out of 50)</th>
                  <th className="py-3 px-4">Primary Textbook Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">1. Profession of CST</td>
                  <td className="py-3 px-4 font-medium text-sky-700">10%</td>
                  <td className="py-3 px-4 font-bold">5 Questions</td>
                  <td className="py-3 px-4 text-slate-500">AST Core Textbook, Chapter 1</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">2. Physical Environment and Safety Standards</td>
                  <td className="py-3 px-4 font-medium text-sky-700">10%</td>
                  <td className="py-3 px-4 font-bold">5 Questions</td>
                  <td className="py-3 px-4 text-slate-500">AST Core Textbook, Chapter 4</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">3. Surgical Asepsis and Sterility</td>
                  <td className="py-3 px-4 font-medium text-sky-700">20%</td>
                  <td className="py-3 px-4 font-bold">10 Questions</td>
                  <td className="py-3 px-4 text-slate-500">AST Core Textbook, Chapter 7</td>
                </tr>
                <tr className="hover:bg-slate-50 transition bg-sky-50/40">
                  <td className="py-3 px-4 font-semibold text-slate-900">4. Instrumentation, Equipment, and Supplies</td>
                  <td className="py-3 px-4 font-bold text-sky-800">30% (Highest Weight)</td>
                  <td className="py-3 px-4 font-black text-sky-800">15 Questions</td>
                  <td className="py-3 px-4 text-slate-700">AST Ch. 10 & Nemitz Surgical Instrumentation</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">5. Hemostasis, Wound Healing, and Wound Closure</td>
                  <td className="py-3 px-4 font-medium text-sky-700">10%</td>
                  <td className="py-3 px-4 font-bold">5 Questions</td>
                  <td className="py-3 px-4 text-slate-500">AST Core Textbook, Chapter 11</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">6. Surgical Anatomy & Physiology</td>
                  <td className="py-3 px-4 font-medium text-sky-700">20%</td>
                  <td className="py-3 px-4 font-bold">10 Questions</td>
                  <td className="py-3 px-4 text-slate-500">AST Core Textbook, Chapter 16</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          ROUND TWO CLINICAL SKILLS PRACTICE SECTION (§4C)
          ------------------------------------------------------------------------- */}
      <section id="round-two" className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            ST Round Two Clinical Evaluation
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Round Two Skills & Mastery Threshold
          </h2>
          <p className="text-sm text-slate-500">
            For top scorers advancing to Round Two. A combined <strong>70% mastery</strong> (104.3 / 149 pts) across Skills II–VI is required for an award.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Skill I</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">15 Min</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Identify Instruments & Equipment</h4>
            <p className="text-xs text-slate-500">
              15 numbered instrument photos. 2 pts for correct name + spelling, 1 pt for purpose (45 pts total). Excluded from 70% calculation.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Skill II</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">6 Min</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Surgical Scrub Methods</h4>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Points: 46</span>
              <span className="font-semibold text-emerald-700">70% = 32.2 pts</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Skill III</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">3 Min</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Open Gloving Technique</h4>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Points: 27</span>
              <span className="font-semibold text-emerald-700">70% = 18.9 pts</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Skill IV</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">5 Min</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Gowning & Gloving (Self)</h4>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Points: 36</span>
              <span className="font-semibold text-emerald-700">70% = 25.2 pts</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Skill V</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">5 Min</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Passing Surgical Instruments</h4>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Points: 26</span>
              <span className="font-semibold text-emerald-700">70% = 18.2 pts</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Skill VI</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">4 Min</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Loading & Passing Sutures</h4>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Points: 14</span>
              <span className="font-semibold text-emerald-700">70% = 9.8 pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          HCIE SECTION (§6.2)
          ------------------------------------------------------------------------- */}
      <section className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Newspaper className="w-3.5 h-3.5" />
              Healthcare Issues Exam (HCIE) 2026-27
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              News Fact-Recall + Official Tiebreaker Essay
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              HCIE questions test specific factual recall of designated health journalism stories. MBA Wizards questions strictly pull from verified stories within the official test window.
            </p>
          </div>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-white text-indigo-950 hover:bg-slate-100 transition whitespace-nowrap self-start sm:self-auto"
          >
            Practice HCIE Mock
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-indigo-400 font-bold block mb-1">Source 1</span>
            MedicalNewsToday
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-indigo-400 font-bold block mb-1">Source 2</span>
            Johns Hopkins Public Health
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-indigo-400 font-bold block mb-1">Source 3</span>
            ScienceDaily Health
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-indigo-400 font-bold block mb-1">Source 4</span>
            Healthline Clinical
          </div>
        </div>
      </section>
    </div>
  );
}

