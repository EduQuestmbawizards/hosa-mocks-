import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import MocksPageClient from "@/components/mocks/MocksPageClient";

export const metadata: Metadata = {
  title: "Mock Tests & Practice Arena | EduQuest",
  description:
    "Official 60-minute HOSA mock tests, free diagnostic evaluation, and practice sets with instant feedback for Surgical Technologist (ST) and Healthcare Issues Exam (HCIE).",
};

export const dynamic = "force-dynamic";

export default async function MocksPage() {
  const supabase = await createClient();

  // Current user & access
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: any = null;
  let testAccessList: string[] = [];

  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = prof;

    const { data: accessRows } = await supabase
      .from("test_access")
      .select("test_id")
      .eq("user_id", user.id);
    testAccessList = (accessRows || []).map((r) => r.test_id);
  }

  // Fetch all published tests using adminClient so that the complete test catalog
  // is visible across all tabs (Diagnostic, Mocks, and Practice sets)
  const adminClient = createAdminClient();
  const { data: testsData } = await adminClient
    .from("tests")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const tests = testsData || [];

  return (
    <MocksPageClient
      tests={tests}
      user={user}
      profile={profile}
      testAccessList={testAccessList}
    />
  );
}

