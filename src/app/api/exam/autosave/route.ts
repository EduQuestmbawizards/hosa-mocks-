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

    const { attemptId, draft, essayText } = await request.json();

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error: updateError } = await adminClient
      .from("attempts")
      .update({
        answers_draft: draft || {},
        essay_text: essayText || null,
      })
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .eq("status", "in_progress");

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error("[Autosave Error]:", err);
    return NextResponse.json({ error: "Autosave failed" }, { status: 500 });
  }
}

