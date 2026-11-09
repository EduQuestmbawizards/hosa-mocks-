import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Lock,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import StartExamButton from "@/components/exam/StartExamButton";

export default async function TestInstructionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/tests/${id}`);
  }

  // Fetch test by slug or id
  const { data: test } = await supabase
    .from("tests")
    .select("*, sections(*)")
    .or(`slug.eq.${id},id.eq.${id}`)
    .maybeSingle();

  if (!test) {
    notFound();
  }

  // Check user authorization
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isApproved = profile?.status === "approved";
  const isFree = test.is_free === true;

  let canAccess = isAdmin || isApproved || isFree;

  if (!canAccess) {
    const { data: override } = await supabase
      .from("test_access")
      .select("test_id")
      .eq("user_id", user.id)
      .eq("test_id", test.id)
      .maybeSingle();

    if (override) {
      canAccess = true;
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
            {test.event === "ST" ? "Surgical Technologist" : "Healthcare Issues Exam"}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {test.kind === "mock" ? "Official Mock Exam" : "Practice Set"}
          </span>
          {test.is_free && (
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              FREE MOCK
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {test.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {test.instructions ||
            "Please read the following official HOSA tournament instructions carefully before starting the exam clock."}
        </p>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block font-medium">Duration</span>
            <span className="font-extrabold text-slate-900 text-sm">{test.duration_min} Minutes</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block font-medium">Questions</span>
            <span className="font-extrabold text-slate-900 text-sm">{test.total_questions} MCQs</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block font-medium">Options</span>
            <span className="font-extrabold text-slate-900 text-sm">4 Choices (A–D)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block font-medium">Negative Marking</span>
            <span className="font-extrabold text-emerald-700 text-sm">None (0 marks)</span>
          </div>
        </div>
      </div>

      {/* Access Lock Alert (if locked) */}
      {!canAccess ? (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950">
                This Mock Test is Currently Locked
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your account is pending review by EduQuest administration. While you wait for approval, you can take the{" "}
                <strong>Free ST Mock Test</strong> which is completely unlocked for you!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition"
            >
              Go to Free Mock in Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Exam Rules & Instructions Card */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            Official Tournament Rules & Conditions
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Plain Countdown Clock:</strong> In accordance with real HOSA exam rules, there are no verbal time announcements. You must monitor your own countdown timer. The exam automatically submits when time reaches 0:00.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Answer-Sheet Navigation:</strong> An OMR-style bubble sheet panel is displayed alongside each question. You may revisit, flag, or change any answer at any point before submission.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Autosave & Offline Protection:</strong> Every choice is saved locally instantly on your device and synced to the EduQuest server. If you accidentally reload the page or briefly lose connectivity, your selections are safe.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Anti-Cheating Security:</strong> Correct answers and explanations are stored in a secure isolated database and will only be revealed in your comprehensive report after you submit.
              </span>
            </div>
          </div>

          {/* Action launcher */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              &larr; Back to Dashboard
            </Link>

            <StartExamButton testId={test.id} />
          </div>
        </div>
      )}
    </div>
  );
}

