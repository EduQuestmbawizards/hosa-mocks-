"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  HelpCircle,
  Layers,
  ListFilter,
  Loader2,
  Lock,
  Menu,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Timer,
  Wifi,
  WifiOff,
  X,
  XCircle,
} from "lucide-react";
import { formatTimeLeft } from "@/lib/utils";

interface Question {
  id: string;
  test_id: string;
  section_id?: string;
  type: string;
  stem: string;
  image_url?: string;
  options: string[];
  topic?: string;
  difficulty?: string;
  source_ref?: string;
  sort_order: number;
}

interface Section {
  id: string;
  test_id: string;
  name: string;
  weight_percent: number;
  question_count: number;
  sort_order: number;
}

interface AnswerState {
  selected: number[];
  textAnswer?: string;
  timeSpentSec?: number;
  flagged?: boolean;
  checked?: boolean;
  is_correct?: boolean;
  correct?: number[];
  explanation?: string;
  source_ref?: string;
}

export default function ExamAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: attemptId } = use(params);
  const router = useRouter();

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student Responses State
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [essayText, setEssayText] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Practice Mode Specific States (§B)
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [practiceTimerEnabled, setPracticeTimerEnabled] = useState(false); // default off for practice

  // Timer & Exam State
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "offline">("saved");
  const [bubbleSheetOpen, setBubbleSheetOpen] = useState(false); // Mobile drawer

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);
  const autosaveTimeoutRef = useRef<any>(null);

  // 1. Load Exam Data & Restore Local Draft
  useEffect(() => {
    async function initExam() {
      try {
        setLoading(true);

        const res = await fetch(`/api/exam/attempt-data?attemptId=${attemptId}`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Failed to load exam attempt.");
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.attempt?.status === "submitted") {
          router.replace(`/reports/${attemptId}`);
          return;
        }

        const isPractice =
          data.test.kind === "practice" ||
          data.test.mode_config?.instant_feedback === true;

        setIsPracticeMode(isPractice);
        setTest(data.test);
        setQuestions(data.questions || []);
        setSections(data.sections || []);

        // Timer setup
        const durationMin = data.test.duration_min || (isPractice ? 48 : 60);
        const startedAt = new Date(data.attempt.started_at).getTime();
        const durationSec = durationMin * 60;
        const now = Date.now();
        const elapsedSec = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, durationSec - elapsedSec);
        setTimeLeft(remaining);

        // Practice mode defaults timer to OFF unless enabled
        if (!isPractice) {
          setPracticeTimerEnabled(true);
        }

        // Restore Draft
        const localKey = `mbawizards_attempt_${attemptId}`;
        const localDraft = localStorage.getItem(localKey);
        let restoredAnswers = data.attempt.answers_draft || {};
        let restoredEssay = data.attempt.essay_text || "";

        if (localDraft) {
          try {
            const parsed = JSON.parse(localDraft);
            if (parsed.answers) restoredAnswers = parsed.answers;
            if (parsed.essayText) restoredEssay = parsed.essayText;
          } catch (e) {
            console.error("Error parsing local draft:", e);
          }
        }

        setAnswers(restoredAnswers);
        setEssayText(restoredEssay);
      } catch (err: any) {
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    }

    initExam();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setSaveStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [attemptId, router]);

  // 2. Countdown Clock (Auto-submits mock when time expires)
  useEffect(() => {
    if (loading || isSubmitting) return;
    if (isPracticeMode && !practiceTimerEnabled) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          if (!isPracticeMode) {
            handleFinalSubmit(); // Auto-submit in mock mode
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [loading, isSubmitting, isPracticeMode, practiceTimerEnabled]);

  // 3. Local Autosave + Debounced Sync
  const persistDraft = (newAnswers: Record<string, AnswerState>, newEssay: string) => {
    try {
      const localKey = `mbawizards_attempt_${attemptId}`;
      localStorage.setItem(
        localKey,
        JSON.stringify({
          answers: newAnswers,
          essayText: newEssay,
          updatedAt: Date.now(),
        })
      );
      setSaveStatus("saved");
    } catch (e) {
      console.warn("Local storage write failed:", e);
    }

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(async () => {
      if (!navigator.onLine) {
        setSaveStatus("offline");
        return;
      }

      setSaveStatus("saving");
      try {
        await fetch("/api/exam/autosave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            draft: newAnswers,
            essayText: newEssay,
          }),
        });
        setSaveStatus("saved");
      } catch (e) {
        setSaveStatus("offline");
      }
    }, 2000);
  };

  // 4. Handle Option Selection
  const handleSelectOption = (optionIndex: number) => {
    const activeQ = questions[currentIndex];
    if (!activeQ) return;

    // In practice mode, if already checked, question is locked
    if (isPracticeMode && answers[activeQ.id]?.checked) {
      return;
    }

    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const prev = answers[activeQ.id] || { selected: [], timeSpentSec: 0, flagged: false };

    const newAnswers = {
      ...answers,
      [activeQ.id]: {
        ...prev,
        selected: [optionIndex],
        timeSpentSec: (prev.timeSpentSec || 0) + timeSpent,
      },
    };

    setAnswers(newAnswers);
    persistDraft(newAnswers, essayText);
    questionStartTimeRef.current = Date.now();

    // Auto-check in practice mode if toggle is on
    if (isPracticeMode && autoCheckEnabled) {
      handleCheckAnswer(activeQ.id, [optionIndex]);
    }
  };

  // 5. Practice Mode: Check Answer for Single Question (§B)
  const handleCheckAnswer = async (qId: string, optSelection?: number[]) => {
    const selected = optSelection || answers[qId]?.selected || [];
    if (selected.length === 0 || checkingAnswer) return;

    setCheckingAnswer(true);
    try {
      const res = await fetch("/api/exam/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId: qId,
          selected,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const prev = answers[qId] || { selected, timeSpentSec: 0, flagged: false };
        const updated = {
          ...answers,
          [qId]: {
            ...prev,
            selected,
            checked: true,
            is_correct: data.is_correct,
            correct: data.correct,
            explanation: data.explanation,
            source_ref: data.source_ref,
          },
        };
        setAnswers(updated);
        persistDraft(updated, essayText);
      } else {
        alert(data.error || "Failed to check answer.");
      }
    } catch (e) {
      alert("Network error checking answer.");
    } finally {
      setCheckingAnswer(false);
    }
  };

  // 6. Retry Wrong Questions Only (Practice Feature)
  const handleRetryWrongQuestions = () => {
    const newAnswers: Record<string, AnswerState> = {};
    for (const [qId, ans] of Object.entries(answers)) {
      if (ans.is_correct) {
        newAnswers[qId] = ans; // keep correct
      }
      // wrong questions are reset
    }
    setAnswers(newAnswers);
    persistDraft(newAnswers, essayText);
    setCurrentIndex(0);
  };

  // 7. Flag / Clear
  const handleToggleFlag = () => {
    const activeQ = questions[currentIndex];
    if (!activeQ) return;
    const prev = answers[activeQ.id] || { selected: [], timeSpentSec: 0, flagged: false };
    const newAnswers = { ...answers, [activeQ.id]: { ...prev, flagged: !prev.flagged } };
    setAnswers(newAnswers);
    persistDraft(newAnswers, essayText);
  };

  const handleClearChoice = () => {
    const activeQ = questions[currentIndex];
    if (!activeQ) return;
    if (isPracticeMode && answers[activeQ.id]?.checked) return; // locked if checked
    const prev = answers[activeQ.id] || { selected: [], timeSpentSec: 0, flagged: false };
    const newAnswers = { ...answers, [activeQ.id]: { ...prev, selected: [] } };
    setAnswers(newAnswers);
    persistDraft(newAnswers, essayText);
  };

  // 8. Navigation Helpers
  const handleNext = () => {
    if (currentIndex < visibleQuestions.length - 1) {
      questionStartTimeRef.current = Date.now();
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      questionStartTimeRef.current = Date.now();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const jumpToQuestion = (idx: number) => {
    questionStartTimeRef.current = Date.now();
    setCurrentIndex(idx);
    setBubbleSheetOpen(false);
  };

  // 9. Submit Final Exam Attempt
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          essayText,
          clientMeta: {
            userAgent: navigator.userAgent,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Submission failed. Your answers remain saved locally.");
        setIsSubmitting(false);
        return;
      }

      localStorage.removeItem(`mbawizards_attempt_${attemptId}`);
      router.replace(`/reports/${attemptId}`);
    } catch (err: any) {
      alert("Network error submitting exam. Please retry.");
      setIsSubmitting(false);
    }
  };

  // Category Filter in Practice Mode
  const sectionMap = new Map(sections.map((s) => [s.id, s.name]));
  const visibleQuestions = questions.filter((q) => {
    if (selectedCategoryFilter === "all") return true;
    const secName = sectionMap.get(q.section_id || "") || "";
    return secName.toLowerCase() === selectedCategoryFilter.toLowerCase();
  });

  const activeQuestion = visibleQuestions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.values(answers).filter((a) => a.selected && a.selected.length > 0).length;
  const flaggedCount = Object.values(answers).filter((a) => a.flagged).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Running Score for Practice Mode
  const checkedAnswers = Object.values(answers).filter((a) => a.checked);
  const correctCheckedCount = checkedAnswers.filter((a) => a.is_correct).length;
  const wrongCheckedCount = checkedAnswers.length - correctCheckedCount;

  const essayWordCount = essayText.trim().split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Entering Examination Hall...</h2>
        <p className="text-xs text-slate-500 mt-1">Verifying security keys and loading questions</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-xl border border-rose-200 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Exam Unavailable</h2>
        <p className="text-xs text-slate-600">{error || "Could not load exam data."}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden text-slate-900 select-none">
      {/* -------------------------------------------------------------------------
          TOP EXAM HEADER
          ------------------------------------------------------------------------- */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-xs">
        {/* Left: Test Details & Practice Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`hidden sm:flex w-8 h-8 rounded-lg text-white items-center justify-center font-bold text-xs ${
              isPracticeMode ? "bg-emerald-600" : "bg-sky-600"
            }`}
          >
            {test.event}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                {test.title}
              </h1>
              {isPracticeMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  Practice Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>{isPracticeMode ? "Targeted Practice" : "Tournament Conditions"}</span>
              <span>&bull;</span>
              <span className="text-sky-600 font-semibold">
                Progress: {answeredCount} / {totalQuestions}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Running Score (Practice) or Plain Countdown (Mock) */}
        <div className="flex items-center gap-3">
          {isPracticeMode ? (
            <div className="flex items-center gap-3">
              {/* Running Score Pill */}
              <div className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
                <span>Score:</span>
                <span className="text-emerald-700 font-black">{correctCheckedCount}</span>
                <span className="text-slate-400">/</span>
                <span>{checkedAnswers.length}</span>
                {checkedAnswers.length > 0 && (
                  <span className="text-[11px] text-slate-500">
                    ({Math.round((correctCheckedCount / checkedAnswers.length) * 100)}%)
                  </span>
                )}
              </div>

              {/* Optional Timer for Practice */}
              {practiceTimerEnabled ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatTimeLeft(timeLeft)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setPracticeTimerEnabled(true)}
                  className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                  title="Enable suggested 48-min timer"
                >
                  <Timer className="w-3.5 h-3.5" /> Enable Timer
                </button>
              )}
            </div>
          ) : (
            /* Plain countdown clock for real HOSA mock */
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wider ${
                timeLeft < 300
                  ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                  : timeLeft < 600
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{formatTimeLeft(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Right: Autosave Status, Mobile Bubble Sheet & Finish */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Practice Auto-check toggle */}
          {isPracticeMode && (
            <label className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={autoCheckEnabled}
                onChange={(e) => setAutoCheckEnabled(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Auto-Check</span>
            </label>
          )}

          <button
            onClick={() => setBubbleSheetOpen(true)}
            className="lg:hidden p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span className="hidden xs:inline">OMR</span>
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isSubmitting}
            className="px-3.5 sm:px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------------------
          MAIN EXAM BODY
          ------------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* QUESTION PANE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {/* Practice Category Filter Selector */}
            {isPracticeMode && sections.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="font-bold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Category:
                </span>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter("all");
                    setCurrentIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-semibold ${
                    selectedCategoryFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All ({totalQuestions})
                </button>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedCategoryFilter(s.name);
                      setCurrentIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap font-semibold ${
                      selectedCategoryFilter.toLowerCase() === s.name.toLowerCase()
                        ? "bg-emerald-700 text-white"
                        : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {s.name} ({s.question_count})
                  </button>
                ))}
              </div>
            )}

            {/* Question Header: Category + Topic + Flag */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-800 text-xs font-bold">
                  Q{activeQuestion?.sort_order ?? currentIndex + 1}
                </span>
                {activeQuestion?.topic && (
                  <span className="text-xs text-slate-500 font-medium">{activeQuestion.topic}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFlag}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                    answers[activeQuestion?.id]?.flagged
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      answers[activeQuestion?.id]?.flagged ? "fill-amber-600 text-amber-600" : ""
                    }`}
                  />
                  <span>
                    {answers[activeQuestion?.id]?.flagged ? "Flagged" : "Flag"}
                  </span>
                </button>

                {answers[activeQuestion?.id]?.selected?.length > 0 &&
                  !(isPracticeMode && answers[activeQuestion?.id]?.checked) && (
                    <button
                      onClick={handleClearChoice}
                      className="text-xs text-slate-400 hover:text-rose-600 transition font-medium"
                    >
                      Clear Choice
                    </button>
                  )}
              </div>
            </div>

            {/* Question Stem Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                {activeQuestion?.stem}
              </div>

              {activeQuestion?.image_url && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-w-md mx-auto my-4 bg-slate-50 p-2">
                  <img
                    src={activeQuestion.image_url}
                    alt="Surgical Reference"
                    className="w-full h-auto object-contain max-h-72 rounded-lg"
                  />
                </div>
              )}

              {/* Options List */}
              {activeQuestion?.type !== "essay" && (
                <div className="space-y-3 pt-2">
                  {(activeQuestion?.options || []).map((optText, optIdx) => {
                    const letters = ["A", "B", "C", "D", "E"];
                    const qState = answers[activeQuestion.id];
                    const isSelected = qState?.selected?.[0] === optIdx;
                    const isChecked = qState?.checked;
                    const isCorrect = qState?.correct?.[0] === optIdx;

                    let cardStyle = "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80";
                    let bubbleStyle = "border-2 border-slate-300 text-slate-600";

                    if (isChecked) {
                      if (isCorrect) {
                        cardStyle = "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 font-semibold text-emerald-950";
                        bubbleStyle = "bg-emerald-600 text-white";
                      } else if (isSelected && !qState?.is_correct) {
                        cardStyle = "bg-rose-50 border-rose-400 ring-2 ring-rose-400 font-semibold text-rose-950";
                        bubbleStyle = "bg-rose-600 text-white";
                      }
                    } else if (isSelected) {
                      cardStyle = "bg-sky-50 border-sky-500 ring-2 ring-sky-400 shadow-sm";
                      bubbleStyle = "bg-sky-600 text-white shadow-sm";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isPracticeMode && isChecked}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-4 rounded-xl border text-left transition flex items-start justify-between gap-3 ${cardStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition ${bubbleStyle}`}
                          >
                            {letters[optIdx]}
                          </div>
                          <div className="text-sm pt-0.5 leading-snug">{optText}</div>
                        </div>

                        {isChecked && (
                          <div className="text-xs font-bold whitespace-nowrap pl-2">
                            {isCorrect && (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <Check className="w-4 h-4" /> Correct
                              </span>
                            )}
                            {isSelected && !qState?.is_correct && (
                              <span className="text-rose-700 flex items-center gap-1">
                                <X className="w-4 h-4" /> Your Choice
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Practice Mode: Check Answer Button & Instant Feedback Panel (§B) */}
              {isPracticeMode && (
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  {!answers[activeQuestion?.id]?.checked ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Select an option and click Check to see immediate rationales.
                      </span>
                      <button
                        onClick={() => handleCheckAnswer(activeQuestion.id)}
                        disabled={
                          checkingAnswer ||
                          !answers[activeQuestion?.id]?.selected ||
                          answers[activeQuestion?.id]?.selected.length === 0
                        }
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-40 flex items-center gap-1.5"
                      >
                        {checkingAnswer ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Check Answer
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Instant Feedback Revealed After Check */
                    <div
                      className={`p-4 rounded-xl border space-y-2 text-xs ${
                        answers[activeQuestion?.id]?.is_correct
                          ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                          : "bg-rose-50 border-rose-300 text-rose-950"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {answers[activeQuestion?.id]?.is_correct ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct! Excellent recall.</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Incorrect. Review the official rationale below:</span>
                          </>
                        )}
                      </div>

                      <p className="leading-relaxed text-slate-800">
                        {answers[activeQuestion?.id]?.explanation || "Official rationale recorded."}
                      </p>

                      {answers[activeQuestion?.id]?.source_ref && (
                        <div className="text-[11px] font-semibold text-slate-600 pt-1 border-t border-slate-200/60">
                          Reference: {answers[activeQuestion?.id]?.source_ref}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* HCIE Essay Panel */}
              {activeQuestion?.type === "essay" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-700">
                      Tiebreaker Essay &bull; Back of the Answer Sheet
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        essayWordCount > 600
                          ? "text-rose-600"
                          : essayWordCount >= 400
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {essayWordCount} / ~500 Words
                    </span>
                  </div>

                  <textarea
                    rows={12}
                    value={essayText}
                    onChange={(e) => {
                      setEssayText(e.target.value);
                      persistDraft(answers, e.target.value);
                    }}
                    placeholder="Type your structured tiebreaker essay response here..."
                    className="w-full p-4 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM NAVIGATION */}
          <div className="max-w-3xl mx-auto w-full pt-6 flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs sm:text-sm text-slate-700 transition disabled:opacity-40 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">
              Question {currentIndex + 1} of {visibleQuestions.length}
            </span>

            {currentIndex < visibleQuestions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 font-bold text-xs sm:text-sm text-white shadow-sm transition flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white shadow-sm transition flex items-center gap-1.5"
              >
                <span>Review & Finish</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            OMR BUBBLE SHEET SIDEBAR (DESKTOP)
            ------------------------------------------------------------------------- */}
        <aside className="hidden lg:flex w-80 bg-white border-l border-slate-200 flex-col flex-shrink-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {isPracticeMode ? "Question Navigator" : "Answer Sheet (OMR)"}
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block" /> Empty
              </span>
              {isPracticeMode && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Correct
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Wrong
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {questions.map((q, idx) => {
              const qState = answers[q.id];
              const isCurrent = idx === currentIndex;
              const isChecked = qState?.checked;
              const isCorrect = qState?.is_correct;
              const isFlagged = qState?.flagged;

              return (
                <div
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={`p-2 rounded-lg border cursor-pointer transition flex items-center justify-between text-xs ${
                    isCurrent
                      ? "border-sky-500 bg-sky-50 ring-1 ring-sky-400"
                      : isChecked && isCorrect
                      ? "border-emerald-200 bg-emerald-50/40"
                      : isChecked && !isCorrect
                      ? "border-rose-200 bg-rose-50/40"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 text-[11px] font-bold text-right ${
                        isCurrent ? "text-sky-700" : "text-slate-400"
                      }`}
                    >
                      {idx + 1}.
                    </span>

                    <div className="flex items-center gap-1.5">
                      {["A", "B", "C", "D"].map((letter, optIdx) => {
                        const filled = qState?.selected?.[0] === optIdx;
                        return (
                          <div
                            key={letter}
                            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition ${
                              isChecked && isCorrect && filled
                                ? "bg-emerald-600 text-white"
                                : isChecked && !isCorrect && filled
                                ? "bg-rose-600 text-white"
                                : filled
                                ? "bg-sky-600 text-white"
                                : "border border-slate-300 text-slate-400"
                            }`}
                          >
                            {letter}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {isFlagged && <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* -------------------------------------------------------------------------
          MOBILE BUBBLE SHEET SLIDE-OVER DRAWER
          ------------------------------------------------------------------------- */}
      {bubbleSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-80 max-w-full bg-white h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Question Navigator
              </h3>
              <button
                onClick={() => setBubbleSheetOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 text-xs bg-sky-50 border-b border-sky-100 text-sky-900 font-semibold flex justify-between">
              <span>{answeredCount} of {totalQuestions} Answered</span>
              {isPracticeMode && <span>{correctCheckedCount} Correct</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {questions.map((q, idx) => {
                const qState = answers[q.id];
                const isCurrent = idx === currentIndex;
                const isChecked = qState?.checked;
                const isCorrect = qState?.is_correct;

                return (
                  <div
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between text-xs ${
                      isCurrent ? "border-sky-500 bg-sky-50 ring-1 ring-sky-400" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 font-bold text-slate-500">{idx + 1}.</span>
                      <div className="flex items-center gap-1.5">
                        {["A", "B", "C", "D"].map((letter, optIdx) => {
                          const filled = qState?.selected?.[0] === optIdx;
                          return (
                            <div
                              key={letter}
                              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                                isChecked && isCorrect && filled
                                  ? "bg-emerald-600 text-white"
                                  : isChecked && !isCorrect && filled
                                  ? "bg-rose-600 text-white"
                                  : filled
                                  ? "bg-sky-600 text-white"
                                  : "border border-slate-300 text-slate-400"
                              }`}
                            >
                              {letter}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          CONFIRM FINISH EXAM MODAL
          ------------------------------------------------------------------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isPracticeMode ? "Complete Practice Session?" : "Finish & Submit Exam?"}
                </h3>
                <p className="text-xs text-slate-500">
                  Your answers will be saved and your comprehensive report prepared.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Answered</span>
                <span className="text-xl font-black text-emerald-700">{answeredCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Unanswered</span>
                <span className="text-xl font-black text-rose-700">{unansweredCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Flagged</span>
                <span className="text-xl font-black text-amber-700">{flaggedCount}</span>
              </div>
            </div>

            {isPracticeMode && wrongCheckedCount > 0 && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-950 block">Missed {wrongCheckedCount} questions?</span>
                  <span className="text-[11px] text-indigo-700">You can clear wrong responses and retry.</span>
                </div>
                <button
                  onClick={() => {
                    handleRetryWrongQuestions();
                    setShowConfirmModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
                >
                  Retry Wrong Only
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Back to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  "Confirm & Save Report"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
