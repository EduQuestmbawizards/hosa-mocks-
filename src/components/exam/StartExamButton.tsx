"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Play } from "lucide-react";

export default function StartExamButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to start exam attempt.");
        setLoading(false);
        return;
      }

      const attemptId = data.attempt.id;
      router.push(`/attempt/${attemptId}`);
    } catch (err: any) {
      setError("Network error starting exam. Please check connection.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full sm:w-auto flex flex-col items-end gap-2">
      {error && <p className="text-rose-600 text-xs font-semibold">{error}</p>}
      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-200 transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Initializing Exam Environment...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-white" />
            I Am Ready &ndash; Start Clock & Begin
          </>
        )}
      </button>
    </div>
  );
}

