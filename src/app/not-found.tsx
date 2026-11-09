import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">
          Error 404
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The requested mock test or page could not be located in the EduQuest testing portal.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <Link
          href="/mocks"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition"
        >
          <span>Mock Tests Arena</span>
        </Link>
      </div>
    </div>
  );
}

