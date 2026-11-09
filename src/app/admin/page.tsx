import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const revalidate = 0; // Dynamic server component

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // Verify admin authorization
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const adminClient = createAdminClient();

  // Load initial admin data
  const { data: users } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: accessRequests } = await adminClient
    .from("access_requests")
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false });

  const { data: tests } = await adminClient
    .from("tests")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: testAccessRows } = await adminClient
    .from("test_access")
    .select("*");

  const { data: attempts } = await adminClient
    .from("attempts")
    .select("*, test:tests(*), profile:profiles(*)")
    .order("started_at", { ascending: false })
    .limit(100);

  const { data: emailLogs } = await adminClient
    .from("email_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <AdminDashboardClient
      initialUsers={users || []}
      initialRequests={accessRequests || []}
      initialTests={tests || []}
      initialAccessRows={testAccessRows || []}
      initialAttempts={attempts || []}
      initialEmailLogs={emailLogs || []}
      currentAdminId={user.id}
    />
  );
}

