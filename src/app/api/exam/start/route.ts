import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate student
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Please log in to start this test" }, { status: 401 });
    }

    const { testId } = await request.json();

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 2. Fetch test details
    const { data: test, error: testError } = await adminClient
      .from("tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (testError || !test || !test.is_published) {
      return NextResponse.json({ error: "Test not found or currently unpublished" }, { status: 404 });
    }

    // 3. Access Verification
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    const isApproved = profile?.status === "approved";
    const isFree = test.is_free === true;

    let hasAccess = isAdmin || isFree || isApproved;

    if (!hasAccess) {
      // Check individual test_access override
      const { data: override } = await adminClient
        .from("test_access")
        .select("test_id")
        .eq("user_id", user.id)
        .eq("test_id", testId)
        .maybeSingle();

      if (override) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "This mock test is locked. Your account is currently pending admin approval. You can practice with the Free Mock Test in the meantime!",
          locked: true,
        },
        { status: 403 }
      );
    }

    // 4. Check for existing in_progress attempt or create a new one
    let attempt;
    const { data: existingAttempt } = await adminClient
      .from("attempts")
      .select("*")
      .eq("user_id", user.id)
      .eq("test_id", testId)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .maybeSingle();

    if (existingAttempt) {
      attempt = existingAttempt;
    } else {
      const { data: newAttempt, error: insertError } = await adminClient
        .from("attempts")
        .insert({
          user_id: user.id,
          test_id: testId,
          status: "in_progress",
          started_at: new Date().toISOString(),
          answers_draft: {},
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      attempt = newAttempt;
    }

    // 5. Fetch sections
    const { data: sections } = await adminClient
      .from("sections")
      .select("*")
      .eq("test_id", testId)
      .order("sort_order", { ascending: true });

    // 6. Fetch questions WITHOUT any correct answers or explanations (SECURITY RULE 5)
    const { data: questions, error: qError } = await adminClient
      .from("questions")
      .select("id, test_id, section_id, type, stem, image_url, options, topic, difficulty, source_ref, sort_order")
      .eq("test_id", testId)
      .order("sort_order", { ascending: true });

    if (qError) {
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    return NextResponse.json({
      attempt,
      test,
      sections: sections || [],
      questions: questions || [],
    });
  } catch (err: any) {
    console.error("[Start Exam Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

