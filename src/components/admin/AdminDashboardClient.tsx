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
  const [activeTab, setActiveTab] = useState<
    "overview" | "requests" | "users" | "matrix" | "reports" | "tests" | "emails" | "skills"
  >("overview");

  // State data
  const [users, setUsers] = useState(initialUsers);
  const [requests, setRequests] = useState(initialRequests);
  const [tests, setTests] = useState(initialTests);
  const [accessRows, setAccessRows] = useState(initialAccessRows);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [emailLogs, setEmailLogs] = useState(initialEmailLogs);

  // Filters & Search
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // JSON Question Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importSlug, setImportSlug] = useState("st-mock-1");
  const [importJsonText, setImportJsonText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<any>(null);

  // ST Round Two Clinical Skills Evaluator State
  const [selectedStudentForSkill, setSelectedStudentForSkill] = useState<string>(
    users[0]?.id || ""
  );
  const [skillScores, setSkillScores] = useState<Record<string, number>>({
    skill_2: 46, // Scrub (46 pts, 70% = 32.2)
    skill_3: 27, // Open Gloving (27 pts, 70% = 18.9)
    skill_4: 36, // Gowning & Gloving (36 pts, 70% = 25.2)
    skill_5: 26, // Passing Instruments (26 pts, 70% = 18.2)
    skill_6: 14, // Loading & Passing Sutures (14 pts, 70% = 9.8)
  });

  // Calculate high-level metrics
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedStudents = users.filter((u) => u.status === "approved");
  const totalAttemptsCount = attempts.length;

  // 1. Handle Accept / Reject Access Request
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
        text: `Student ${decision === "approved" ? "accepted" : "rejected"}. Notification email dispatched!`,
      });
    } catch (e: any) {
      setActionMessage({ type: "error", text: "Network error processing decision." });
    } finally {
      setProcessingId(null);
    }
  };

  // 2. Handle Per-Test Access Override Toggle
  const handleToggleTestAccess = async (userId: string, testId: string, currentGranted: boolean) => {
    try {
      const res = await fetch("/api/admin/toggle-test-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, testId, granted: !currentGranted }),
      });

      if (res.ok) {
        if (!currentGranted) {
          setAccessRows((prev) => [...prev, { user_id: userId, test_id: testId }]);
        } else {
          setAccessRows((prev) =>
            prev.filter((r) => !(r.user_id === userId && r.test_id === testId))
          );
        }
      }
    } catch (e) {
      console.error("Failed to toggle access:", e);
    }
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

  // 4. Export Users to CSV
  const exportUsersCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Phone", "City", "Events", "Role", "Status", "Joined"];
    const rows = users.map((u) => [
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
    link.setAttribute("download", `mbawizards_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.city || "").toLowerCase().includes(userSearch.toLowerCase());

    const matchesStatus =
      userStatusFilter === "all" ? true : u.status === userStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate ST Round Two Mastery on Skills II-VI (combined 149 pts, 70% = 104.3)
  const totalSkills2To6 =
    (skillScores.skill_2 || 0) +
    (skillScores.skill_3 || 0) +
    (skillScores.skill_4 || 0) +
    (skillScores.skill_5 || 0) +
    (skillScores.skill_6 || 0);
  const masteryAchieved = totalSkills2To6 >= 104.3;

  return (
    <div className="space-y-6 pb-16">
      {/* -------------------------------------------------------------------------
          ADMIN TOP BAR
          ------------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="MBA Wizards"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              MBA Wizards Administration Console
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
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
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
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          NAVIGATION TABS
          ------------------------------------------------------------------------- */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 pb-px text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "overview"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Overview
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap flex items-center gap-1.5 relative ${
            activeTab === "requests"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Access Requests
          {pendingRequests.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "users"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "matrix"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ToggleRight className="w-3.5 h-3.5" /> Test Access Matrix
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "reports"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Student Reports ({attempts.length})
        </button>

        <button
          onClick={() => setActiveTab("tests")}
          className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "tests"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Tests & Questions
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "skills"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> ST Round Two Grader
        </button>

        <button
          onClick={() => setActiveTab("emails")}
          className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "emails"
              ? "bg-white text-indigo-700 border-t-2 border-indigo-600 border-x border-slate-200 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mail className="w-3.5 h-3.5" /> Email Log
        </button>
      </div>

      {/* -------------------------------------------------------------------------
          TAB 1: OVERVIEW METRICS
          ------------------------------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Registered Users</span>
              <div className="text-3xl font-black text-slate-900">{users.length}</div>
              <div className="text-[11px] text-slate-500">Students & Instructors</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-amber-600">Pending Review</span>
              <div className="text-3xl font-black text-amber-600">{pendingRequests.length}</div>
              <div className="text-[11px] text-amber-700 font-semibold">
                {pendingRequests.length > 0 ? "Awaiting your decision" : "Inbox cleared"}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-600">Approved Students</span>
              <div className="text-3xl font-black text-emerald-700">{approvedStudents.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium">All mocks unlocked</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Attempts Completed</span>
              <div className="text-3xl font-black text-indigo-600">{totalAttemptsCount}</div>
              <div className="text-[11px] text-slate-500">Graded submissions</div>
            </div>
          </div>

          {/* Pending Requests Alert Box */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Action Needed: {pendingRequests.length} Pending Access Requests</span>
                </div>
                <button
                  onClick={() => setActiveTab("requests")}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 underline"
                >
                  Review All Requests &rarr;
                </button>
              </div>
              <p className="text-xs text-amber-800">
                New students have registered and are currently taking the Free Mock while awaiting full unlock.
              </p>
            </div>
          )}

          {/* Recent Mock Submissions Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Student Submissions</h3>
              <button
                onClick={() => setActiveTab("reports")}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all reports
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Test</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Percentage</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attempts.slice(0, 5).map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {a.profile?.full_name || "Student"}
                      </td>
                      <td className="py-2.5 px-3">{a.test?.title || "Mock Exam"}</td>
                      <td className="py-2.5 px-3 font-bold">{a.score} / {a.max_score}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded font-black ${
                            Number(a.percent || 0) >= 70
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {a.percent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{formatDate(a.started_at)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/reports/${a.id}`}
                          className="font-bold text-indigo-600 hover:underline"
                        >
                          Inspect & Print
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 2: ACCESS REQUESTS (ACCEPT / REJECT WORKFLOW)
          ------------------------------------------------------------------------- */}
      {activeTab === "requests" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pending Student Access Requests</h2>
              <p className="text-xs text-slate-500">
                Accepting unlocks all published tests and triggers an acceptance email from your address.
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
              {pendingRequests.length} Pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">All caught up!</h3>
              <p className="text-xs text-slate-500">No pending access requests require your decision.</p>
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
                    <th className="py-3 px-3">Enrolled Events</th>
                    <th className="py-3 px-3">Registered At</th>
                    <th className="py-3 px-3 text-right">Decision Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pendingRequests.map((req) => {
                    const prof = req.profile || {};
                    const isProcessing = processingId === req.user_id;

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {prof.full_name || "Applicant"}
                        </td>
                        <td className="py-3 px-3">{prof.email}</td>
                        <td className="py-3 px-3">{prof.phone || "Not given"}</td>
                        <td className="py-3 px-3">{prof.city || "Not given"}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded font-bold bg-sky-100 text-sky-800 text-[10px]">
                            {(prof.events || ["ST"]).join(", ")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{formatDate(req.created_at)}</td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => handleDecideRequest(req.user_id, "approved")}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
                          >
                            Accept & Unlock
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt("Optional reason for declining:");
                              handleDecideRequest(req.user_id, "rejected", note || undefined);
                            }}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 3: USERS LIST & CSV EXPORT
          ------------------------------------------------------------------------- */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">All Registered Students & Users</h2>
              <p className="text-xs text-slate-500">Search and filter across candidates.</p>
            </div>
            <button
              onClick={exportUsersCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="w-full sm:w-44 py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Events</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-2.5 px-3">{u.email}</td>
                    <td className="py-2.5 px-3">{u.phone || "-"}</td>
                    <td className="py-2.5 px-3">{u.city || "-"}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-indigo-700">
                        {(u.events || []).join(", ") || "ST"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="uppercase text-[10px] font-bold text-slate-500">{u.role}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : u.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 4: TEST ACCESS MATRIX
          ------------------------------------------------------------------------- */}
      {activeTab === "matrix" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Per-Test Access Override Matrix</h2>
            <p className="text-xs text-slate-500">
              Grant or revoke specific individual mock tests for individual students on top of their global status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-50">Student</th>
                  <th className="py-2.5 px-3">Status</th>
                  {tests.map((t: any) => (
                    <th key={t.id} className="py-2.5 px-3 text-center whitespace-nowrap">
                      {t.title.slice(0, 18)}...
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => {
                  const isApprovedStudent = u.status === "approved";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 sticky left-0 bg-white">
                        {u.full_name} ({u.email.slice(0, 15)}...)
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          {u.status}
                        </span>
                      </td>
                      {tests.map((t: any) => {
                        const hasOverride = accessRows.some(
                          (r: any) => r.user_id === u.id && r.test_id === t.id
                        );
                        const effectiveAccess = t.is_free || isApprovedStudent || hasOverride;

                        return (
                          <td key={t.id} className="py-2.5 px-3 text-center">
                            {t.is_free ? (
                              <span className="text-[10px] text-emerald-700 font-bold">Free</span>
                            ) : (
                              <button
                                onClick={() => handleToggleTestAccess(u.id, t.id, hasOverride)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                                  hasOverride
                                    ? "bg-indigo-600 text-white"
                                    : effectiveAccess
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {hasOverride ? "Override (Granted)" : effectiveAccess ? "Approved" : "Locked"}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 5: STUDENT REPORTS & PRINT
          ------------------------------------------------------------------------- */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Completed Mock Test Reports</h2>
              <p className="text-xs text-slate-500">
                Preview full question-by-question analytics and print on behalf of any candidate.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {attempts.length} attempts recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Test Title</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attempts.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {a.profile?.full_name || "Student"}
                    </td>
                    <td className="py-2.5 px-3">{a.test?.title}</td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-700">{a.test?.event}</td>
                    <td className="py-2.5 px-3 font-bold">{a.score} / {a.max_score}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-black ${
                          Number(a.percent || 0) >= 70
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {a.percent}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{formatDuration(a.duration_sec || 0)}</td>
                    <td className="py-2.5 px-3 text-slate-400">{formatDate(a.submitted_at || a.started_at)}</td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <Link
                        href={`/reports/${a.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                      >
                        <Eye className="w-3 h-3" /> Preview & Print
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 6: TESTS & QUESTIONS MANAGEMENT
          ------------------------------------------------------------------------- */}
      {activeTab === "tests" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tests & Mock Banks</h2>
              <p className="text-xs text-slate-500">
                Manage publishing status, duration, and Free Mock allocation.
              </p>
            </div>
            <button
              onClick={() => setImportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Import Question Bank
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Slug</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Free Mock</th>
                  <th className="py-2.5 px-3">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tests.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{t.slug}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{t.title}</td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-700">{t.event}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px]">{t.kind}</td>
                    <td className="py-2.5 px-3">{t.duration_min} min</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                          t.is_free
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.is_free ? "FREE" : "LOCKED"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          t.is_published
                            ? "bg-sky-100 text-sky-800"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {t.is_published ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 7: ST ROUND TWO CLINICAL SKILLS CHECKLIST EVALUATOR (§4C)
          ------------------------------------------------------------------------- */}
      {activeTab === "skills" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
              ST Round Two Rubric
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Clinical Skills Checklist & 70% Mastery Calculator
            </h2>
            <p className="text-xs text-slate-500">
              Grade student clinical performance on Skills II through VI. 70% combined mastery (104.3 / 149 pts) is required for an award.
            </p>
          </div>

          {/* Student Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Select Candidate:
            </label>
            <select
              value={selectedStudentForSkill}
              onChange={(e) => setSelectedStudentForSkill(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Skills Checklist Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Skill II */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Skill II: Surgical Scrub Methods</span>
                <span className="text-slate-500">Max 46 pts (70% = 32.2)</span>
              </div>
              <input
                type="number"
                min={0}
                max={46}
                value={skillScores.skill_2}
                onChange={(e) => setSkillScores({ ...skillScores, skill_2: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold text-sm bg-white"
              />
            </div>

            {/* Skill III */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Skill III: Open Gloving Technique</span>
                <span className="text-slate-500">Max 27 pts (70% = 18.9)</span>
              </div>
              <input
                type="number"
                min={0}
                max={27}
                value={skillScores.skill_3}
                onChange={(e) => setSkillScores({ ...skillScores, skill_3: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold text-sm bg-white"
              />
            </div>

            {/* Skill IV */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Skill IV: Gowning & Gloving (Self)</span>
                <span className="text-slate-500">Max 36 pts (70% = 25.2)</span>
              </div>
              <input
                type="number"
                min={0}
                max={36}
                value={skillScores.skill_4}
                onChange={(e) => setSkillScores({ ...skillScores, skill_4: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold text-sm bg-white"
              />
            </div>

            {/* Skill V */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Skill V: Passing Surgical Instruments</span>
                <span className="text-slate-500">Max 26 pts (70% = 18.2)</span>
              </div>
              <input
                type="number"
                min={0}
                max={26}
                value={skillScores.skill_5}
                onChange={(e) => setSkillScores({ ...skillScores, skill_5: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold text-sm bg-white"
              />
            </div>

            {/* Skill VI */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Skill VI: Loading & Passing Sutures</span>
                <span className="text-slate-500">Max 14 pts (70% = 9.8)</span>
              </div>
              <input
                type="number"
                min={0}
                max={14}
                value={skillScores.skill_6}
                onChange={(e) => setSkillScores({ ...skillScores, skill_6: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold text-sm bg-white"
              />
            </div>
          </div>

          {/* Mastery Threshold Result Card */}
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              masteryAchieved
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-rose-50 border-rose-300 text-rose-950"
            }`}
          >
            <div>
              <div className="text-xs uppercase font-bold tracking-wider">
                Combined Score (Skills II through VI)
              </div>
              <div className="text-2xl font-black">
                {totalSkills2To6} / 149 Points{" "}
                <span className="text-base font-normal">
                  ({Math.round((totalSkills2To6 / 149) * 100)}%)
                </span>
              </div>
              <p className="text-xs mt-1">
                {masteryAchieved
                  ? "✅ 70% Mastery threshold satisfied (min 104.3 required)."
                  : "❌ Below 70% mastery threshold. Remediation recommended before tournament."}
              </p>
            </div>

            <button
              onClick={() => alert("Skill rubric evaluation saved to student profile!")}
              className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm"
            >
              Save Evaluation to Student File
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 8: EMAIL LOG AUDIT
          ------------------------------------------------------------------------- */}
      {activeTab === "emails" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Email Dispatch Audit Log</h2>
            <p className="text-xs text-slate-500">
              Audit trail of SMTP transactional emails dispatched through the portal.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Template</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Dispatched At</th>
                  <th className="py-2.5 px-3">Error Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {emailLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.to_email}</td>
                    <td className="py-2.5 px-3 font-mono">{log.template}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          log.status === "sent"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{formatDate(log.created_at)}</td>
                    <td className="py-2.5 px-3 text-rose-600 text-[11px] truncate max-w-xs">
                      {log.error || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          JSON QUESTION IMPORT MODAL
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
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Test Slug</label>
                <input
                  type="text"
                  value={importSlug}
                  onChange={(e) => setImportSlug(e.target.value)}
                  placeholder="e.g. st-mock-1 or hcie-mock-1"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">JSON Payload</label>
                <textarea
                  rows={10}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{"test_slug": "st-mock-1", "questions": [{"section": "Surgical Asepsis", "type": "mcq_single", "stem": "Which indicator...", "options": ["A", "B", "C", "D"], "correct": [2], "explanation": "..."}]}'
                  className="w-full p-3 font-mono text-[11px] border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Dry Run Report Box */}
            {dryRunResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 max-h-48 overflow-y-auto ${
                  dryRunResult.success
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {dryRunResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Dry-Run Passed: {dryRunResult.totalQuestions} questions valid!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Dry-Run Failed: {dryRunResult.errors?.length} errors found</span>
                    </>
                  )}
                </div>

                {dryRunResult.categoryCounts && (
                  <div className="text-[11px] grid grid-cols-2 gap-1 pt-1 border-t border-emerald-200/60">
                    {Object.entries(dryRunResult.categoryCounts).map(([cat, cnt]: any) => (
                      <div key={cat}>
                        {cat}: <strong>{cnt}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {dryRunResult.warnings?.length > 0 && (
                  <div className="pt-1 text-[11px] text-amber-800">
                    <span className="font-bold">Warnings:</span>
                    <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                      {dryRunResult.warnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {dryRunResult.errors?.length > 0 && (
                  <div className="pt-1 text-[11px] text-rose-800">
                    <span className="font-bold">Row Errors:</span>
                    <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                      {dryRunResult.errors.map((err: any, i: number) => (
                        <li key={i}>
                          Row {err.row}: {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleImportQuestions(true)}
                disabled={importLoading || !importJsonText.trim()}
                className="px-4 py-2 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition disabled:opacity-50"
              >
                Dry-Run Validate
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setImportModalOpen(false);
                    setDryRunResult(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleImportQuestions(false)}
                  disabled={importLoading || !importJsonText.trim()}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Commit Import"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

