import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get("attemptId");

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Authenticate student
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // 2. Fetch attempt
    const { data: attempt, error: attemptError } = await adminClient
      .from("attempts")
      .select("*, test:tests(*)")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // 3. Fetch sections
    const { data: sections } = await adminClient
      .from("sections")
      .select("*")
      .eq("test_id", attempt.test_id)
      .order("sort_order", { ascending: true });

    // 4. Fetch questions WITHOUT any correct answers or explanations (RULE 5)
    const { data: questions, error: qError } = await adminClient
      .from("questions")
      .select("id, test_id, section_id, type, stem, image_url, options, topic, difficulty, source_ref, sort_order")
      .eq("test_id", attempt.test_id)
      .order("sort_order", { ascending: true });

    if (qError) {
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    return NextResponse.json({
      attempt,
      test: attempt.test,
      sections: sections || [],
      questions: questions || [],
    });
  } catch (err: any) {
    console.error("[Attempt Data Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

