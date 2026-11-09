import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ExamReportView from "@/components/reports/ExamReportView";

export const revalidate = 0; // Dynamic server component

export default async function ReportPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/reports/${attemptId}`);
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const adminClient = createAdminClient();

  // Fetch attempt with test details
  const { data: attempt } = await adminClient
    .from("attempts")
    .select("*, test:tests(*)")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) {
    notFound();
  }

  // Authorization: Student can only view their own attempts; Admin can view all
  if (attempt.user_id !== user.id && !isAdmin) {
    redirect("/dashboard");
  }

  // Fetch candidate profile
  const { data: candidateProfile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", attempt.user_id)
    .single();

  // Fetch attempt_answers joined with questions
  const { data: attemptAnswers } = await adminClient
    .from("attempt_answers")
    .select("*, question:questions(*)")
    .eq("attempt_id", attemptId)
    .order("created_at", { ascending: true });

  return (
    <ExamReportView
      attempt={attempt}
      student={candidateProfile || {}}
      test={attempt.test || {}}
      answers={attemptAnswers || []}
      isAdmin={isAdmin}
    />
  );
}

