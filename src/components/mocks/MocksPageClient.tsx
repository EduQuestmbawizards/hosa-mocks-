"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  FileText,
  Filter,
  Layers,
  Lock,
  Newspaper,
  Play,
  Search,
  Shield,
  Sparkles,
  Stethoscope,
  Unlock,
  Zap,
} from "lucide-react";

interface MocksPageClientProps {
  tests: any[];
  user: any;
  profile: any;
  testAccessList: string[];
}

export default function MocksPageClient({
  tests,
  user,
  profile,
  testAccessList,
}: MocksPageClientProps) {
  // Tabs: 1. "diagnostic" (Default, Free Diagnostic Mock), 2. "mock" (Tournament Mocks), 3. "practice" (Practice Sets)
  const [activeTab, setActiveTab] = useState<"diagnostic" | "mock" | "practice">("diagnostic");

  // Filters
  const [selectedEvent, setSelectedEvent] = useState<"all" | "ST" | "HCIE">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isApproved = profile?.status === "approved" || profile?.role === "admin";

  // Categorize Tests
  // 1. Mock Tests: all tests with kind === 'mock'
  const allMockTests = tests.filter((t) => t.kind === "mock");

  // 2. Diagnostic Tests: mock tests that are free (is_free === true)
  const diagnosticTests = tests.filter((t) => t.kind === "mock" && t.is_free === true);

  // 3. Practice Tests: tests with kind === 'practice'
  const practiceTests = tests.filter((t) => t.kind === "practice");

  // Get active list based on selected tab
  const getTabList = () => {
    switch (activeTab) {
      case "mock":
        return allMockTests;
      case "diagnostic":
        return diagnosticTests;
      case "practice":
        return practiceTests;
    }
  };

  // Apply Event filter and Search
  const filteredList = getTabList().filter((t) => {
    const matchesEvent = selectedEvent === "all" ? true : t.event === selectedEvent;
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      (t.title || "").toLowerCase().includes(term) ||
      (t.instructions || "").toLowerCase().includes(term) ||
      (t.slug || "").toLowerCase().includes(term);

    return matchesEvent && matchesSearch;
  });

  // Access check helper
  const canAccessTest = (test: any) => {
    if (!user) return false;
    if (isApproved) return true;
    if (test.is_free) return true;
    return testAccessList.includes(test.id);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* -------------------------------------------------------------------------
          HEADER & BREADCRUMBS
          ------------------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-slate-800 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800">Test Arena</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>HOSA Mock Tests & Practice Arena</span>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                2026-27 Edition
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Official-fidelity exam environment with the real 60-minute countdown, 50-MCQ category weighting, instant diagnostic feedback, and clinical rubrics.
            </p>
          </div>

          {user ? (
            <Link
              href="/dashboard"
              className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>My Student Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/signup"
              className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock Free Diagnostic</span>
            </Link>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          USER ACCESS STATUS BANNER
          ------------------------------------------------------------------------- */}
      {user && (
        <div
          className={`p-4 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border ${
            isApproved
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-amber-50 text-amber-900 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isApproved ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {isApproved
                  ? "Full Access Active:"
                  : "Status: Pending Review:"}
              </span>{" "}
              {isApproved
                ? "All 50-MCQ tournament mocks and practice sets are unlocked for you."
                : "The Free Diagnostic Mock is unlocked for you right now. All remaining tournament mocks and practice sets will automatically unlock once approved by MBA Wizards administration."}
            </div>
          </div>
          {!isApproved && (
            <span className="font-bold text-emerald-800 bg-white/90 px-2.5 py-1 rounded-md border border-emerald-300 whitespace-nowrap shadow-xs">
              1 Free Diagnostic Mock Active
            </span>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------
          MAIN 3 TABS: 1. DIAGNOSTIC TEST (DEFAULT) | 2. MOCK TESTS | 3. PRACTICE TESTS
          ------------------------------------------------------------------------- */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-2 pb-px overflow-x-auto scrollbar-none">
        {/* TAB 1 (1ST POSITION & DEFAULT): DIAGNOSTIC TEST (FREE MOCK) */}
        <button
          type="button"
          onClick={() => setActiveTab("diagnostic")}
          className={`px-4 sm:px-6 py-3 rounded-t-xl transition whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer ${
            activeTab === "diagnostic"
              ? "bg-white text-emerald-700 border-t-2 border-emerald-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Diagnostic Test</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
            Free
          </span>
        </button>

        {/* TAB 2: MOCK TESTS */}
        <button
          type="button"
          onClick={() => setActiveTab("mock")}
          className={`px-4 sm:px-6 py-3 rounded-t-xl transition whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer ${
            activeTab === "mock"
              ? "bg-white text-sky-700 border-t-2 border-sky-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mock Tests</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
            {allMockTests.length}
          </span>
        </button>

        {/* TAB 3: PRACTICE TESTS */}
        <button
          type="button"
          onClick={() => setActiveTab("practice")}
          className={`px-4 sm:px-6 py-3 rounded-t-xl transition whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer ${
            activeTab === "practice"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Zap className="w-4 h-4 text-indigo-600" />
          <span>Practice Tests</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
            {practiceTests.length}
          </span>
        </button>
      </div>

      {/* -------------------------------------------------------------------------
          FILTER & SEARCH CONTROLS
          ------------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Event Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedEvent("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedEvent === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Events
          </button>
          <button
            type="button"
            onClick={() => setSelectedEvent("ST")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedEvent === "ST"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-sky-50 text-sky-800 hover:bg-sky-100"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Surgical Tech (ST)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedEvent("HCIE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedEvent === "HCIE"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Healthcare Issues (HCIE)</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tests by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          TEST CARDS GRID
          ------------------------------------------------------------------------- */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tests found in this category</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching your event filter or check back as new tournament mocks are imported by administration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((test) => {
            const accessible = canAccessTest(test);
            const isFreeMock = test.is_free === true;
            const isPractice = test.kind === "practice";

            return (
              <div
                key={test.id}
                className={`bg-white rounded-2xl border transition shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden relative ${
                  isFreeMock
                    ? "border-emerald-300 ring-1 ring-emerald-200"
                    : isPractice
                    ? "border-indigo-200"
                    : "border-slate-200"
                }`}
              >
                {/* Top highlight bar */}
                <div
                  className={`h-1.5 w-full ${
                    isFreeMock
                      ? "bg-emerald-500"
                      : isPractice
                      ? "bg-indigo-500"
                      : "bg-sky-500"
                  }`}
                />

                <div className="p-5 sm:p-6 space-y-4 flex-1">
                  {/* Badges Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        test.event === "ST"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {test.event === "ST" ? "Surgical Technologist" : "Healthcare Issues"}
                    </span>

                    {/* Free / Locked Pill */}
                    {isFreeMock ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Free Access
                      </span>
                    ) : accessible ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Title & Instructions */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {test.instructions || "Standard HOSA competitive event mock test format."}
                    </p>
                  </div>

                  {/* Test Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Duration</div>
                        <div className="font-bold text-slate-800">
                          {isPractice ? "Flexible (48 min)" : `${test.duration_min} Minutes`}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Questions</div>
                        <div className="font-bold text-slate-800">
                          {test.total_questions} Questions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="pt-2 text-[11px] text-slate-600 space-y-1">
                    {isPractice ? (
                      <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Instant Feedback & AST Explanations</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Strict 60-Min Plain Countdown Clock</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>70% Passing Threshold & Diagnostic Report</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                  {accessible ? (
                    <Link
                      href={`/tests/${test.slug || test.id}`}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isFreeMock
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                          : isPractice
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                          : "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200"
                      }`}
                    >
                      <span>
                        {isFreeMock
                          ? "Start Free Diagnostic Mock"
                          : isPractice
                          ? "Start Practice Test"
                          : "Launch Mock Exam"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : user ? (
                    <div className="space-y-1">
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked (Awaiting Approval)</span>
                      </button>
                      <p className="text-[10px] text-slate-400 text-center">
                        Take the Free Diagnostic Mock while awaiting approval.
                      </p>
                    </div>
                  ) : isFreeMock ? (
                    <Link
                      href={`/signup?redirect=/tests/${test.slug || test.id}`}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Quick Register & Start Free Mock</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/login?redirect=/tests/${test.slug || test.id}`}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Access (Requires Approval)</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------------------
          DIAGNOSTIC TEST INFO CALLOUT BANNER
          ------------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MBA Wizards Diagnostic Strategy</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          How to Use Your Mocks & Diagnostic Test Effectively
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white text-sm">1. Start with Diagnostic</div>
            <p className="text-slate-400 leading-relaxed">
              Take the free 50-MCQ Diagnostic Mock first to benchmark baseline scores and identify weak AST textbook chapters.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white text-sm">2. Drill with Practice Sets</div>
            <p className="text-slate-400 leading-relaxed">
              Use Practice Mode with instant explanations to master difficult instrumentation, sterility, and anatomy questions.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white text-sm">3. Full Exam Simulation</div>
            <p className="text-slate-400 leading-relaxed">
              Attempt 60-minute tournament mocks under strict timed conditions to lock in pacing and score above the 70% threshold.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
