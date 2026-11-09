import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate student
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId, questionId, selected } = await request.json();

    if (!attemptId || !questionId || !Array.isArray(selected) || selected.length === 0) {
      return NextResponse.json(
        { error: "attemptId, questionId, and selected option array are required." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 2. Fetch attempt and verify ownership
    const { data: attempt, error: attemptError } = await adminClient
      .from("attempts")
      .select("*, test:tests(*)")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Attempt not found or unauthorized." }, { status: 404 });
    }

    if (attempt.status !== "in_progress") {
      return NextResponse.json(
        { error: "This attempt has already been submitted or expired." },
        { status: 400 }
      );
    }

    const test = attempt.test;

    // 3. Rule B & Rule A.3: Instant feedback is strictly restricted to practice mode
    const isPractice =
      test?.kind === "practice" || test?.mode_config?.instant_feedback === true;

    if (!isPractice) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Instant feedback is disabled in Mock Exam mode. Full explanations are revealed only after submission.",
        },
        { status: 403 }
      );
    }

    // 4. Fetch Question & Question Key securely
    const { data: question, error: qError } = await adminClient
      .from("questions")
      .select("id, type, stem, source_ref, section_id")
      .eq("id", questionId)
      .eq("test_id", attempt.test_id)
      .single();

    if (qError || !question) {
      return NextResponse.json({ error: "Question not found in this test." }, { status: 404 });
    }

    const { data: key, error: keyError } = await adminClient
      .from("question_keys")
      .select("correct, accepted_answers, explanation")
      .eq("question_id", questionId)
      .single();

    if (keyError || !key) {
      return NextResponse.json({ error: "Question key record missing." }, { status: 500 });
    }

    // 5. Evaluate correctness
    const correctIndices = (key.correct as number[]) || [];
    const isCorrect =
      selected.length > 0 &&
      correctIndices.length > 0 &&
      selected[0] === correctIndices[0];

    const marks = isCorrect ? 1 : 0;

    // 6. Upsert into attempt_answers
    await adminClient.from("attempt_answers").upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected,
        is_correct: isCorrect,
        marks,
        correct_snapshot: key.correct,
        explanation_snapshot: key.explanation,
      },
      { onConflict: "attempt_id,question_id" }
    );

    // 7. Update draft in attempts table
    const currentDraft = attempt.answers_draft || {};
    const updatedDraft = {
      ...currentDraft,
      [questionId]: {
        selected,
        is_correct: isCorrect,
        checked: true,
      },
    };

    await adminClient
      .from("attempts")
      .update({ answers_draft: updatedDraft })
      .eq("id", attemptId);

    // 8. Return feedback for THAT ONE question only
    return NextResponse.json({
      success: true,
      questionId,
      is_correct: isCorrect,
      correct: key.correct,
      explanation: key.explanation,
      source_ref: question.source_ref,
    });
  } catch (err: any) {
    console.error("[Check Answer Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
