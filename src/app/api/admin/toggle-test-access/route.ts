import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { userId, testId, granted } = await request.json();

    if (!userId || !testId) {
      return NextResponse.json({ error: "userId and testId required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    if (granted) {
      const { error } = await adminClient.from("test_access").upsert({
        user_id: userId,
        test_id: testId,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await adminClient
        .from("test_access")
        .delete()
        .eq("user_id", userId)
        .eq("test_id", testId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, granted });
  } catch (err: any) {
    console.error("[Toggle Access Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

