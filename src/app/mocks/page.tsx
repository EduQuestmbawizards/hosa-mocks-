import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MocksPageClient from "@/components/mocks/MocksPageClient";

export const metadata: Metadata = {
  title: "Mock Tests & Practice Arena | MBA Wizards",
  description:
    "Official 60-minute HOSA mock tests, free diagnostic evaluation, and practice sets with instant feedback for Surgical Technologist (ST) and Healthcare Issues Exam (HCIE).",
};

export const revalidate = 30; // Revalidate every 30 seconds

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

  // Fetch all published tests
  const { data: testsData } = await supabase
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

