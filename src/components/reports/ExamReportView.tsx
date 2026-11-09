"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  HelpCircle,
  Layers,
  Printer,
  Sparkles,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

interface ExamReportViewProps {
  attempt: any;
  student: any;
  test: any;
  answers: any[];
  isAdmin?: boolean;
}

export default function ExamReportView({
  attempt,
  student,
  test,
  answers,
  isAdmin = false,
}: ExamReportViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "incorrect" | "skipped" | "flagged">("all");

  const score = Number(attempt.score || 0);
  const maxScore = Number(attempt.max_score || 0);
  const percent = Number(attempt.percent || 0);
  const passPercent = Number(test?.marking?.pass_percent || 70);
  const isPass = percent >= passPercent;

  // Counts
  const totalQuestions = answers.length;
  const correctCount = answers.filter((a) => a.is_correct).length;
  const skippedCount = answers.filter((a) => !a.selected || a.selected.length === 0).length;
  const incorrectCount = totalQuestions - correctCount - skippedCount;
  const flaggedCount = answers.filter((a) => a.flagged).length;

  const avgTimePerQuestion =
    totalQuestions > 0
      ? Math.round(Number(attempt.duration_sec || 0) / totalQuestions)
      : 0;

  // Section Breakdown from section_scores
  const sectionScores = (attempt.section_scores || {}) as Record<
    string,
    { name: string; total: number; correct: number; score: number; weight: number }
  >;

  // Filtered Questions
  const filteredAnswers = answers.filter((ans) => {
    if (activeFilter === "incorrect") return !ans.is_correct && ans.selected?.length > 0;
    if (activeFilter === "skipped") return !ans.selected || ans.selected.length === 0;
    if (activeFilter === "flagged") return ans.flagged;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-container space-y-8 max-w-5xl mx-auto py-6">
      {/* -------------------------------------------------------------------------
          PRINT-ONLY OFFICIAL HEADER (A4 FORMAT)
          ------------------------------------------------------------------------- */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
              EQ
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                EduQuest HOSA Test Performance Report
              </h1>
              <p className="text-xs text-slate-600">
                Official Mock Tournament Evaluation &bull; HOSA 2026-27 Guidelines
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Lead: Rupali (rupali.eduquest@gmail.com)</div>
            <div>Date Printed: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          SCREEN NAVIGATION & ACTIONS BAR
          ------------------------------------------------------------------------- */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Link
            href={isAdmin ? "/admin" : "/dashboard"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isAdmin ? "Back to Admin" : "Back to Dashboard"}</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
            Attempt ID: {attempt.id.slice(0, 8)}...
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          STUDENT & TEST HEADER METADATA
          ------------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                {test?.event === "ST" ? "Surgical Technologist" : "Healthcare Issues Exam"}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {formatDate(attempt.submitted_at || attempt.created_at)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {test?.title || "HOSA Mock Examination"}
            </h1>

            <p className="text-xs text-slate-500">
              Candidate: <strong className="text-slate-800">{student?.full_name || "Student"}</strong> &bull;{" "}
              {student?.email} &bull; {student?.phone || "No phone"} &bull; {student?.city || "No city"}
            </p>
          </div>

          {/* Pass / Fail Stamp */}
          <div
            className={`px-4 py-2 rounded-xl text-center flex flex-col items-center justify-center font-black uppercase tracking-wider border ${
              isPass
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-rose-50 text-rose-800 border-rose-300"
            }`}
          >
            <span className="text-xs">{isPass ? "Mastery Achieved" : "Needs Revision"}</span>
            <span className="text-sm">{percent}% (Threshold {passPercent}%)</span>
          </div>
        </div>

        {/* SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
              Final Score
            </span>
            <div className="text-2xl font-black text-slate-900">
              {score} <span className="text-sm font-normal text-slate-500">/ {maxScore}</span>
            </div>
            <div className="text-[11px] text-sky-700 font-bold">{percent}% Total</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-emerald-700 font-semibold uppercase text-[10px] tracking-wider block">
              Correct Answers
            </span>
            <div className="text-2xl font-black text-emerald-700">{correctCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium">
              +{score} points earned
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
            <span className="text-rose-700 font-semibold uppercase text-[10px] tracking-wider block">
              Incorrect Answers
            </span>
            <div className="text-2xl font-black text-rose-700">{incorrectCount}</div>
            <div className="text-[11px] text-rose-600 font-medium">
              {skippedCount} questions skipped
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
              Time Utilized
            </span>
            <div className="text-2xl font-black text-slate-900">
              {formatDuration(attempt.duration_sec || 0)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              ~{avgTimePerQuestion}s avg per question
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          SECTION-WISE BREAKDOWN TABLE & BARS (§8)
          ------------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 avoid-break">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-600" />
          <span>Category Performance Analysis</span>
        </h2>

        {Object.keys(sectionScores).length === 0 ? (
          <p className="text-xs text-slate-500">General score distribution recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Questions</th>
                  <th className="py-2.5 px-3">Correct</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Visual Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.entries(sectionScores).map(([secName, stat]) => {
                  const catPercent = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                  const isCatPass = catPercent >= 70;

                  return (
                    <tr key={secName} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{secName}</td>
                      <td className="py-2.5 px-3">{stat.total}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{stat.correct}</td>
                      <td className="py-2.5 px-3 font-black">
                        <span className={isCatPass ? "text-emerald-700" : "text-rose-600"}>
                          {catPercent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 w-48">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full ${
                              catPercent >= 70
                                ? "bg-emerald-500"
                                : catPercent >= 50
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, catPercent))}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------------
          HCIE TIEBREAKER ESSAY DISPLAY & GRADING (IF PRESENT)
          ------------------------------------------------------------------------- */}
      {attempt.essay_text && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                HCIE Tiebreaker Essay Response
              </h2>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-800 font-bold px-2.5 py-0.5 rounded border border-indigo-200">
              Evaluated by Admin
            </span>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
            {attempt.essay_text}
          </div>

          <div className="text-xs text-slate-500 italic">
            Official Rubric: 1. Position clarity (10 pts) &bull; 2. Factual health source citation (15 pts) &bull; 3. Structure (15 pts) &bull; 4. Grammar & vocabulary (10 pts). Used strictly as a tournament tiebreaker.
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          QUESTION-BY-QUESTION REVIEW (§8)
          ------------------------------------------------------------------------- */}
      <div className="space-y-4 avoid-break">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Detailed Question Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Review textbook citations, official explanations, and answer comparisons.
            </p>
          </div>

          {/* Filter Pills (Screen only) */}
          <div className="no-print flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              onClick={() => setActiveFilter("incorrect")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeFilter === "incorrect"
                  ? "bg-rose-600 text-white"
                  : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setActiveFilter("skipped")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeFilter === "skipped"
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Skipped ({skippedCount})
            </button>
            {flaggedCount > 0 && (
              <button
                onClick={() => setActiveFilter("flagged")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeFilter === "flagged"
                    ? "bg-amber-500 text-white"
                    : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Flagged ({flaggedCount})
              </button>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-5">
          {filteredAnswers.map((ans, idx) => {
            const q = ans.question || {};
            const selectedOptIdx = ans.selected?.[0];
            const correctOptIdx = ans.correct_snapshot?.[0];
            const isCorrect = ans.is_correct;
            const isSkipped = !ans.selected || ans.selected.length === 0;

            const letters = ["A", "B", "C", "D", "E"];

            return (
              <div
                key={ans.id || idx}
                className={`bg-white rounded-xl border p-5 sm:p-6 space-y-4 shadow-xs transition avoid-break ${
                  isCorrect
                    ? "border-emerald-200"
                    : isSkipped
                    ? "border-slate-300"
                    : "border-rose-200"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      Q{q.sort_order ?? idx + 1}
                    </span>
                    {q.topic && (
                      <span className="text-slate-500 font-medium">{q.topic}</span>
                    )}
                    {ans.time_spent_sec > 0 && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        &bull; {ans.time_spent_sec}s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {ans.flagged && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Bookmark className="w-3 h-3 fill-amber-500" /> Flagged
                      </span>
                    )}
                    {isCorrect ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{ans.marks || 1})
                      </span>
                    ) : isSkipped ? (
                      <span className="font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Skipped (0 pts)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                </div>

                {/* Stem */}
                <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {q.stem}
                </div>

                {/* Optional Image */}
                {q.image_url && (
                  <div className="max-w-xs my-2 rounded-lg overflow-hidden border border-slate-200">
                    <img src={q.image_url} alt="Question Graphic" className="w-full h-auto" />
                  </div>
                )}

                {/* Options List with Highlights */}
                {q.options && q.options.length > 0 && (
                  <div className="space-y-2 pt-1 text-xs sm:text-sm">
                    {q.options.map((optText: string, oIdx: number) => {
                      const isStudentPick = selectedOptIdx === oIdx;
                      const isCorrectPick = correctOptIdx === oIdx;

                      let style = "bg-white border-slate-200 text-slate-700";
                      let bubbleStyle = "border border-slate-300 text-slate-500";

                      if (isCorrectPick) {
                        style = "bg-emerald-50 border-emerald-500 font-semibold text-emerald-950";
                        bubbleStyle = "bg-emerald-600 text-white font-bold";
                      } else if (isStudentPick && !isCorrect) {
                        style = "bg-rose-50 border-rose-400 font-semibold text-rose-950";
                        bubbleStyle = "bg-rose-600 text-white font-bold";
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${bubbleStyle}`}
                            >
                              {letters[oIdx]}
                            </span>
                            <span>{optText}</span>
                          </div>

                          <div className="text-xs font-bold whitespace-nowrap">
                            {isCorrectPick && (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <Check className="w-4 h-4" /> Correct Answer
                              </span>
                            )}
                            {isStudentPick && !isCorrect && (
                              <span className="text-rose-700 flex items-center gap-1">
                                <X className="w-4 h-4" /> Your Selection
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Official Explanation & Textbook / News Citation */}
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                    <span>Explanation & Reference Citation:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {ans.explanation_snapshot || "Official tournament rationale."}
                  </p>
                  {q.source_ref && (
                    <div className="text-[11px] font-semibold text-sky-700 pt-1 border-t border-slate-200/60">
                      Citation: {q.source_ref}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

