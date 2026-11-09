import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDuration } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Lock,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Unlock,
  User,
} from "lucide-react";

export const revalidate = 0; // Dynamic server component

export default async function StudentDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch student profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch student's test attempts
  const { data: attempts } = await supabase
    .from("attempts")
    .select("*, test:tests(*)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  // Fetch individual test access overrides
  const { data: accessRows } = await supabase
    .from("test_access")
    .select("test_id")
    .eq("user_id", user.id);

  const testAccessList = (accessRows || []).map((r) => r.test_id);

  // Fetch published tests
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const isApproved = profile?.status === "approved" || profile?.role === "admin";
  const isPending = profile?.status === "pending";
  const isRejected = profile?.status === "rejected";

  // Calculate high-level stats
  const completedAttempts = (attempts || []).filter((a) => a.status === "submitted");
  const totalCompleted = completedAttempts.length;
  const bestScore = totalCompleted
    ? Math.max(...completedAttempts.map((a) => Number(a.percent || 0)))
    : 0;
  const avgScore = totalCompleted
    ? Math.round(
        (completedAttempts.reduce((acc, a) => acc + Number(a.percent || 0), 0) /
          totalCompleted) *
          10
      ) / 10
    : 0;

  // Aggregate category / weak topics from section_scores
  const categoryStats: Record<string, { total: number; correct: number }> = {};
  for (const attempt of completedAttempts) {
    if (attempt.section_scores) {
      for (const [secName, val] of Object.entries(attempt.section_scores as any)) {
        if (!categoryStats[secName]) {
          categoryStats[secName] = { total: 0, correct: 0 };
        }
        categoryStats[secName].total += (val as any).total || 0;
        categoryStats[secName].correct += (val as any).correct || 0;
      }
    }
  }

  const weakCategories = Object.entries(categoryStats)
    .map(([name, stat]) => ({
      name,
      percent: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
      total: stat.total,
    }))
    .filter((c) => c.percent < 70)
    .sort((a, b) => a.percent - b.percent);

  return (
    <div className="space-y-8 pb-12">
      {/* -------------------------------------------------------------------------
          PROFILE & WELCOME BANNER
          ------------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome, {profile?.full_name || "Student"}!
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                {profile?.events?.join(" & ") || "HOSA"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {profile?.email} &bull; {profile?.phone || "No phone"} &bull; {profile?.city || "No city"}
            </p>
          </div>

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm transition"
            >
              Switch to Admin View
            </Link>
          )}
        </div>

        {/* Status Callout Banner */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          {isPending && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0 animate-spin" />
                <div>
                  <span className="font-bold">Access Status: Pending Admin Approval.</span> You can take the{" "}
                  <strong>Free Mock Test</strong> right now! All remaining mocks and practice sets will automatically unlock as soon as EduQuest verifies your signup.
                </div>
              </div>
              <span className="font-semibold text-amber-800 whitespace-nowrap">
                Review in progress
              </span>
            </div>
          )}

          {isApproved && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Full Access Unlocked:</span> Your account is approved. All 50-MCQ mocks, HCIE tiebreaker essays, and Round Two clinical checklists are active!
              </div>
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2.5 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Access Declined:</span> Contact EduQuest administration at{" "}
                <a href="mailto:rupali.eduquest@gmail.com" className="underline font-semibold">
                  rupali.eduquest@gmail.com
                </a>{" "}
                for inquiries. You are still permitted to attempt the Free Mock.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          SUMMARY STATS CARDS
          ------------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Completed Mocks
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {totalCompleted}
          </div>
          <div className="text-[11px] text-slate-400">Recorded attempts</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Best Score
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600">
            {bestScore}%
          </div>
          <div className="text-[11px] text-slate-400">Peak mock achievement</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Score
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">
            {avgScore}%
          </div>
          <div className="text-[11px] text-slate-400">70% needed for ST Round Two</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            ST Mastery Goal
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            104.3 / 149
          </div>
          <div className="text-[11px] text-slate-400">Skills II–VI 70% threshold</div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          WEAK-TOPIC SUMMARY / DIAGNOSTICS
          ------------------------------------------------------------------------- */}
      {weakCategories.length > 0 && (
        <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-950">
              Recommended Focus Areas (Accuracy &lt; 70%)
            </h3>
          </div>
          <p className="text-xs text-amber-800">
            Based on your mock attempts, targeting these topics will yield the highest score gains:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {weakCategories.map((c) => (
              <div
                key={c.name}
                className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-800">{c.name}</span>
                <span className="font-black text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                  {c.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          AVAILABLE TESTS & LAUNCHER
          ------------------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Assigned Mock Tests
          </h2>
          <span className="text-xs text-slate-500">
            Standard 60-min countdown with plain clock
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(tests || []).map((t: any) => {
            const hasOverride = testAccessList.includes(t.id);
            const canTake = t.is_free || isApproved || hasOverride;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-xl border p-5 flex flex-col justify-between shadow-xs transition ${
                  t.is_free
                    ? "border-emerald-300 ring-1 ring-emerald-200"
                    : canTake
                    ? "border-slate-300 hover:border-sky-400"
                    : "border-slate-200 bg-slate-50/70"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        t.event === "ST"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {t.event} &bull; {t.kind.toUpperCase()}
                    </span>

                    {t.is_free ? (
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                        Free Mock
                      </span>
                    ) : canTake ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                        <Unlock className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center gap-1 text-[11px]">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{t.instructions}</p>

                  <div className="text-xs text-slate-600 flex items-center gap-4 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {t.duration_min} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {t.total_questions} MCQs
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                  {canTake ? (
                    <Link
                      href={`/tests/${t.slug || t.id}`}
                      className="w-full text-center py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      Start Attempt
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full text-center py-2 px-3 rounded-lg bg-slate-200 text-slate-500 font-semibold text-xs cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" /> Awaiting Approval
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          RECENT ATTEMPTS HISTORY & FULL REPORT ACCESS
          ------------------------------------------------------------------------- */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Recent Attempts & Score Reports
        </h2>

        {(!attempts || attempts.length === 0) ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No attempts recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Launch your first mock test above to view question-by-question analytics, time usage, and textbook citations.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Test Title</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attempts.map((a: any) => {
                    const isSubmitted = a.status === "submitted";
                    const isPass = Number(a.percent || 0) >= 70;

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {a.test?.title || "Mock Test"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-sky-700">
                            {a.test?.event || "ST"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(a.started_at)}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {isSubmitted ? `${a.score} / ${a.max_score}` : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {isSubmitted ? (
                            <span
                              className={`px-2 py-0.5 rounded font-black text-[11px] ${
                                isPass
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {a.percent}%
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">In Progress</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {isSubmitted ? formatDuration(a.duration_sec || 0) : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isSubmitted
                                ? "bg-slate-100 text-slate-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isSubmitted ? (
                            <Link
                              href={`/reports/${a.id}`}
                              className="inline-flex items-center gap-1 font-bold text-sky-600 hover:text-sky-700 hover:underline"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Report
                            </Link>
                          ) : (
                            <Link
                              href={`/attempt/${a.id}`}
                              className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700 hover:underline"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Resume Exam
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

