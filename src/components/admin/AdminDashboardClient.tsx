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
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Layers,
  ListFilter,
  Loader2,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Unlock,
  Upload,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

interface AdminDashboardClientProps {
  initialUsers: any[];
  initialRequests: any[];
  initialTests: any[];
  initialAccessRows: any[];
  initialAttempts: any[];
  initialEmailLogs: any[];
  currentAdminId: string;
}

export default function AdminDashboardClient({
  initialUsers,
  initialRequests,
  initialTests,
  initialAccessRows,
  initialAttempts,
  initialEmailLogs,
  currentAdminId,
}: AdminDashboardClientProps) {
  // Only 2 Tabs: "access" (Access Grant & Approvals) and "reports" (Student Reports)
  const [activeTab, setActiveTab] = useState<"access" | "reports">("access");

  // State data
  const [users, setUsers] = useState(initialUsers);
  const [requests, setRequests] = useState(initialRequests);
  const [tests, setTests] = useState(initialTests);
  const [accessRows, setAccessRows] = useState(initialAccessRows);
  const [attempts, setAttempts] = useState(initialAttempts);

  // Filters & Search for Access Tab
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters & Search for Reports Tab
  const [reportSearch, setReportSearch] = useState("");
  const [reportEventFilter, setReportEventFilter] = useState("all");

  // JSON Question Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importSlug, setImportSlug] = useState("st-mock-1");
  const [importJsonText, setImportJsonText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<any>(null);

  // Filtered Students (exclude admin from list)
  const studentsList = users.filter((u) => u.role !== "admin");
  const filteredStudents = studentsList.filter((u) => {
    const term = userSearch.toLowerCase();
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.phone || "").toLowerCase().includes(term) ||
      (u.city || "").toLowerCase().includes(term);

    const matchesStatus =
      userStatusFilter === "all" ? true : u.status === userStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalStudents = studentsList.length;
  const approvedCount = studentsList.filter((u) => u.status === "approved").length;
  const pendingCount = studentsList.filter((u) => u.status === "pending").length;
  const revokedCount = studentsList.filter((u) => u.status === "rejected").length;

  // Filtered Reports
  const filteredAttempts = attempts.filter((a) => {
    const term = reportSearch.toLowerCase();
    const studentName = a.profile?.full_name || "";
    const studentEmail = a.profile?.email || "";
    const testTitle = a.test?.title || "";

    const matchesSearch =
      studentName.toLowerCase().includes(term) ||
      studentEmail.toLowerCase().includes(term) ||
      testTitle.toLowerCase().includes(term);

    const matchesEvent =
      reportEventFilter === "all" ? true : a.test?.event === reportEventFilter;

    return matchesSearch && matchesEvent;
  });

  const passedAttemptsCount = attempts.filter((a) => Number(a.percent || 0) >= 70).length;
  const avgScorePercent =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((acc, curr) => acc + Number(curr.percent || 0), 0) / attempts.length
        )
      : 0;

  // 1. Handle Approve / Revoke Student Access
  const handleDecideRequest = async (userId: string, decision: "approved" | "rejected", note?: string) => {
    setProcessingId(userId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/decide-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, decision, note }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionMessage({ type: "error", text: data.error || "Decision update failed." });
        return;
      }

      // Update local state
      setRequests((prev) =>
        prev.map((r) => (r.user_id === userId ? { ...r, status: decision } : r))
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: decision } : u))
      );

      setActionMessage({
        type: "success",
        text: `Student access ${decision === "approved" ? "APPROVED" : "REVOKED"} successfully! Notification email dispatched.`,
      });
    } catch (e: any) {
      setActionMessage({ type: "error", text: "Network error processing decision." });
    } finally {
      setProcessingId(null);
    }
  };

  // 2. Export Users to CSV
  const exportUsersCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Phone", "City", "Events", "Role", "Status", "Joined"];
    const rows = studentsList.map((u) => [
      u.id,
      `"${u.full_name || ""}"`,
      `"${u.email || ""}"`,
      `"${u.phone || ""}"`,
      `"${u.city || ""}"`,
      `"${(u.events || []).join(";")}"`,
      u.role,
      u.status,
      u.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eduquest_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Handle JSON Questions Import (with Dry-Run Support)
  const handleImportQuestions = async (isDryRun: boolean = false) => {
    setImportLoading(true);
    setActionMessage(null);
    if (isDryRun) setDryRunResult(null);

    try {
      const parsed = JSON.parse(importJsonText);
      const res = await fetch("/api/admin/import-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testSlug: parsed.test_slug || importSlug,
          test_slug: parsed.test_slug,
          test_meta: parsed.test_meta,
          questions: parsed.questions,
          dryRun: isDryRun,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (isDryRun) {
          setDryRunResult({ success: false, errors: data.errors, warnings: data.warnings });
        } else {
          alert(data.error || "Failed to import questions.");
        }
        setImportLoading(false);
        return;
      }

      if (isDryRun) {
        setDryRunResult(data);
      } else {
        setActionMessage({ type: "success", text: data.message });
        setImportModalOpen(false);
        setImportJsonText("");
        setDryRunResult(null);
      }
    } catch (e: any) {
      alert("Invalid JSON format. Please verify syntax.");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* -------------------------------------------------------------------------
          ADMIN TOP BAR
          ------------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="EduQuest"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              EduQuest Administration Console
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Admin
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Admin: <strong className="text-slate-800">Rupali</strong> (rupali.eduquest@gmail.com)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            View as Student
          </Link>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Questions JSON</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          NAVIGATION TABS (EXACTLY 2 TABS: ACCESS GRANT & REPORTS)
          ------------------------------------------------------------------------- */}
      <div className="flex border-b border-slate-200 gap-2 pb-px text-xs font-bold">
        {/* TAB 1: ACCESS GRANT */}
        <button
          onClick={() => setActiveTab("access")}
          className={`px-5 py-3 rounded-t-xl transition whitespace-nowrap flex items-center gap-2 text-sm cursor-pointer ${
            activeTab === "access"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Access Grant & Approvals</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
              {pendingCount} Pending
            </span>
          )}
        </button>

        {/* TAB 2: REPORTS */}
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-5 py-3 rounded-t-xl transition whitespace-nowrap flex items-center gap-2 text-sm cursor-pointer ${
            activeTab === "reports"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Reports</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
            {attempts.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ACCESS GRANT & APPROVALS (APPROVE & REVOKE ACTIONS)
          ========================================================================= */}
      {activeTab === "access" && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Students</span>
              <div className="text-3xl font-black text-slate-900">{totalStudents}</div>
              <div className="text-[11px] text-slate-500">Registered candidates</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-600">Approved Access</span>
              <div className="text-3xl font-black text-emerald-700">{approvedCount}</div>
              <div className="text-[11px] text-emerald-600 font-medium">All mocks unlocked</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-amber-600">Pending Review</span>
              <div className="text-3xl font-black text-amber-600">{pendingCount}</div>
              <div className="text-[11px] text-amber-700 font-semibold">
                {pendingCount > 0 ? "Awaiting your decision" : "No pending queue"}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-rose-600">Revoked / Declined</span>
              <div className="text-3xl font-black text-rose-600">{revokedCount}</div>
              <div className="text-[11px] text-rose-700">Access revoked</div>
            </div>
          </div>

          {/* Student Access Management Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Candidate Access Grant & Control</h2>
                <p className="text-xs text-slate-500">
                  Approve or revoke candidate permissions to access full 50-MCQ mocks and practice tests.
                </p>
              </div>
              <button
                onClick={exportUsersCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Students CSV</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by candidate name, email, phone, or city..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="w-full sm:w-44 py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">All Statuses ({totalStudents})</option>
                <option value="approved">Approved Only ({approvedCount})</option>
                <option value="pending">Pending Only ({pendingCount})</option>
                <option value="rejected">Revoked Only ({revokedCount})</option>
              </select>
            </div>

            {/* Students Table with Approve & Revoke Buttons */}
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">No students found matching your search.</p>
                <p className="text-xs text-slate-400">Try adjusting your filter or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3">Email Address</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">City</th>
                      <th className="py-3 px-3">Events</th>
                      <th className="py-3 px-3">Registered</th>
                      <th className="py-3 px-3">Access Status</th>
                      <th className="py-3 px-3 text-right">Approve / Revoke Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStudents.map((u) => {
                      const isProcessing = processingId === u.id;
                      const isApproved = u.status === "approved";
                      const isRevoked = u.status === "rejected";
                      const isPending = u.status === "pending";

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {u.full_name || "Student"}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{u.email}</td>
                          <td className="py-3 px-3 text-slate-500">{u.phone || "-"}</td>
                          <td className="py-3 px-3 text-slate-500">{u.city || "-"}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded font-bold bg-sky-100 text-sky-800 text-[10px]">
                              {(u.events || ["ST"]).join(", ")}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{formatDate(u.created_at)}</td>
                          <td className="py-3 px-3">
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Approved
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                Pending Review
                              </span>
                            )}
                            {isRevoked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Revoked
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* APPROVE BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleDecideRequest(u.id, "approved")}
                                disabled={isProcessing || isApproved}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                  isApproved
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default opacity-80"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-95"
                                }`}
                                title={isApproved ? "Candidate is already approved" : "Grant full mock access"}
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>{isApproved ? "Approved ✓" : "Approve"}</span>
                              </button>

                              {/* REVOKE BUTTON */}
                              <button
                                type="button"
                                onClick={() => {
                                  const note = prompt(`Reason for revoking access for ${u.full_name}:`);
                                  if (note !== null) {
                                    handleDecideRequest(u.id, "rejected", note || undefined);
                                  }
                                }}
                                disabled={isProcessing || isRevoked}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                  isRevoked
                                    ? "bg-rose-50 text-rose-500 border border-rose-200 cursor-default opacity-80"
                                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer active:scale-95"
                                }`}
                                title={isRevoked ? "Candidate access is already revoked" : "Revoke candidate access"}
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>{isRevoked ? "Revoked ✕" : "Revoke"}</span>
                              </button>
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: STUDENT REPORTS (VIEW & PRINT PERFORMANCE REPORTS)
          ========================================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Attempts Recorded</span>
              <div className="text-3xl font-black text-slate-900">{attempts.length}</div>
              <div className="text-[11px] text-slate-500">Across ST & HCIE mocks</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-600">Passed (≥ 70%)</span>
              <div className="text-3xl font-black text-emerald-700">{passedAttemptsCount}</div>
              <div className="text-[11px] text-emerald-600 font-medium">Met tournament benchmark</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 lg:col-span-1">
              <span className="text-[11px] font-bold uppercase text-indigo-600">Average Candidate Score</span>
              <div className="text-3xl font-black text-indigo-600">{avgScorePercent}%</div>
              <div className="text-[11px] text-slate-500">Overall portal performance</div>
            </div>
          </div>

          {/* Reports Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Completed Mock Test Reports</h2>
                <p className="text-xs text-slate-500">
                  Inspect detailed question-by-question analytics, category breakdowns, and print A4 PDF reports.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {filteredAttempts.length} of {attempts.length} attempts
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by candidate name, email, or test title..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <select
                value={reportEventFilter}
                onChange={(e) => setReportEventFilter(e.target.value)}
                className="w-full sm:w-44 py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="ST">Surgical Tech (ST)</option>
                <option value="HCIE">Healthcare Issues (HCIE)</option>
              </select>
            </div>

            {filteredAttempts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">No reports found.</p>
                <p className="text-xs text-slate-400">Reports will appear here once candidates complete their exams.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-3">Candidate</th>
                      <th className="py-3 px-3">Test Title</th>
                      <th className="py-3 px-3">Event</th>
                      <th className="py-3 px-3">Score</th>
                      <th className="py-3 px-3">Percentage</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3">Submitted At</th>
                      <th className="py-3 px-3 text-right">Official Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredAttempts.map((a: any) => {
                      const isPass = Number(a.percent || 0) >= 70;

                      return (
                        <tr key={a.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{a.profile?.full_name || "Student"}</div>
                            <div className="text-[11px] text-slate-400">{a.profile?.email}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">{a.test?.title}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                              {a.test?.event || "ST"}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {a.score} / {a.max_score}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                                isPass
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {a.percent}% {isPass ? "✓" : ""}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">{formatDuration(a.duration_sec || 0)}</td>
                          <td className="py-3 px-3 text-slate-400">{formatDate(a.submitted_at || a.started_at)}</td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/reports/${a.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition shadow-xs cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View & Print</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          BULK QUESTION BANK IMPORTER MODAL (JSON)
          ------------------------------------------------------------------------- */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Bulk Question Bank Importer (JSON)
                </h3>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Paste questions JSON format with <code>test_meta</code> and <code>questions</code> array. Review notes are automatically mapped to admin-only storage.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Destination Mock Test:
              </label>
              <select
                value={importSlug}
                onChange={(e) => setImportSlug(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                {tests.map((t: any) => (
                  <option key={t.id} value={t.slug}>
                    {t.title} ({t.slug}) — {t.total_questions} questions
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Question Data JSON:
              </label>
              <textarea
                rows={10}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{\n  "test_slug": "st-mock-2",\n  "test_meta": { "total_questions": 50 },\n  "questions": [\n    {\n      "stem": "Which disinfectant is sporicidal...",\n      "type": "mcq_single",\n      "section": "Surgical Asepsis & Sterility",\n      "options": ["Glutaraldehyde", "Alcohol", "Iodophor", "Phenol"],\n      "correct": 0,\n      "explanation": "Glutaraldehyde (Cidex) is a high-level sporicidal sterilant.",\n      "review_note": "Verified from AST 5th Ed. Ch. 7"\n    }\n  ]\n}'
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Dry-Run Result Preview */}
            {dryRunResult && (
              <div
                className={`p-4 rounded-xl text-xs space-y-2 border ${
                  dryRunResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {dryRunResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    Dry-Run Result:{" "}
                    {dryRunResult.success ? "PASSED VALIDATION" : "VALIDATION ERRORS FOUND"}
                  </span>
                </div>

                {dryRunResult.stats && (
                  <div className="text-[11px] font-mono grid grid-cols-2 gap-1 text-slate-700">
                    <div>Total Valid Questions: {dryRunResult.stats.valid_questions}</div>
                    <div>Category Counts: {JSON.stringify(dryRunResult.stats.category_counts)}</div>
                  </div>
                )}

                {dryRunResult.errors?.length > 0 && (
                  <div className="space-y-1 text-rose-700 font-mono text-[11px]">
                    <div className="font-bold">Errors to fix:</div>
                    {dryRunResult.errors.map((err: string, i: number) => (
                      <div key={i}>&bull; {err}</div>
                    ))}
                  </div>
                )}

                {dryRunResult.warnings?.length > 0 && (
                  <div className="space-y-1 text-amber-800 font-mono text-[11px]">
                    <div className="font-bold">Warnings:</div>
                    {dryRunResult.warnings.map((warn: string, i: number) => (
                      <div key={i}>&bull; {warn}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleImportQuestions(true)}
                disabled={importLoading || !importJsonText.trim()}
                className="px-4 py-2 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {importLoading ? "Validating..." : "Run Dry-Run Check"}
              </button>
              <button
                type="button"
                onClick={() => handleImportQuestions(false)}
                disabled={importLoading || !importJsonText.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {importLoading ? "Importing..." : "Commit Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
