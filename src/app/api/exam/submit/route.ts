import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/emailer";

export const dynamic = "force-dynamic";

interface SubmissionAnswer {
  questionId: string;
  selected: number[];
  textAnswer?: string;
  timeSpentSec?: number;
  flagged?: boolean;
}

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

    const { attemptId, answers, essayText, clientMeta } = (await request.json()) as {
      attemptId: string;
      answers: Record<string, SubmissionAnswer>;
      essayText?: string;
      clientMeta?: any;
    };

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 });
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
      return NextResponse.json({ error: "Attempt not found or unauthorized" }, { status: 404 });
    }

    if (attempt.status === "submitted") {
      return NextResponse.json(
        { message: "Attempt already submitted", attemptId },
        { status: 200 }
      );
    }

    const test = attempt.test;
    const marking = test?.marking || { marks_correct: 1, marks_wrong: 0, marks_unanswered: 0, pass_percent: 70 };
    const marksCorrect = Number(marking.marks_correct ?? 1);
    const marksWrong = Number(marking.marks_wrong ?? 0);

    // 3. Fetch questions and sections for this test
    const { data: questions, error: qError } = await adminClient
      .from("questions")
      .select("*, section:sections(*)")
      .eq("test_id", attempt.test_id);

    if (qError || !questions) {
      return NextResponse.json({ error: "Failed to fetch exam questions" }, { status: 500 });
    }

    // 4. Fetch secret answer keys using elevated service client
    const questionIds = questions.map((q) => q.id);
    const { data: keys, error: keysError } = await adminClient
      .from("question_keys")
      .select("*")
      .in("question_id", questionIds);

    if (keysError || !keys) {
      return NextResponse.json({ error: "Failed to fetch question keys" }, { status: 500 });
    }

    const keyMap = new Map(keys.map((k) => [k.question_id, k]));

    // 5. Score answers and prepare snapshot rows
    let totalScore = 0;
    const maxScore = questions.length * marksCorrect;
    const sectionScoreMap: Record<
      string,
      { name: string; total: number; correct: number; score: number; weight: number }
    > = {};

    const attemptAnswerInserts = [];

    for (const q of questions) {
      const key = keyMap.get(q.id);
      const studentAns = answers?.[q.id];
      const sectionName = q.section?.name || "General";
      const sectionWeight = q.section?.weight_percent || 0;

      if (!sectionScoreMap[sectionName]) {
        sectionScoreMap[sectionName] = {
          name: sectionName,
          total: 0,
          correct: 0,
          score: 0,
          weight: sectionWeight,
        };
      }
      sectionScoreMap[sectionName].total += 1;

      let isCorrect = false;
      let marksEarned = 0;

      if (q.type === "mcq_single" || q.type === "image_mcq") {
        const correctArray = (key?.correct as number[]) || [];
        const studentSelected = studentAns?.selected || [];
        if (studentSelected.length > 0 && correctArray.length > 0) {
          isCorrect = studentSelected[0] === correctArray[0];
          marksEarned = isCorrect ? marksCorrect : -Math.abs(marksWrong);
        }
      } else if (q.type === "short_text") {
        // Skill I instrument name or terminology
        const accepted = (key?.accepted_answers || []).map((a: string) =>
          a.trim().toLowerCase().replace(/[\s-]/g, "")
        );
        const studentClean = (studentAns?.textAnswer || "").trim().toLowerCase().replace(/[\s-]/g, "");
        if (studentClean && accepted.includes(studentClean)) {
          isCorrect = true;
          marksEarned = marksCorrect;
        }
      } else if (q.type === "essay") {
        // Essay evaluated separately by Admin, doesn't alter MCQ total
        isCorrect = false;
        marksEarned = 0;
      }

      if (isCorrect) {
        sectionScoreMap[sectionName].correct += 1;
        sectionScoreMap[sectionName].score += marksEarned;
      }

      totalScore += marksEarned;

      attemptAnswerInserts.push({
        attempt_id: attempt.id,
        question_id: q.id,
        selected: studentAns?.selected || [],
        text_answer: studentAns?.textAnswer || null,
        is_correct: isCorrect,
        marks: marksEarned,
        time_spent_sec: studentAns?.timeSpentSec || 0,
        flagged: !!studentAns?.flagged,
        correct_snapshot: key?.correct || null,
        explanation_snapshot: key?.explanation || null,
      });
    }

    const percentage = maxScore > 0 ? Math.max(0, Math.round((totalScore / maxScore) * 100 * 10) / 10) : 0;
    const now = new Date();
    const startedAt = new Date(attempt.started_at);
    const durationSec = Math.round((now.getTime() - startedAt.getTime()) / 1000);

    // 6. Delete old draft attempt answers if any, and insert snapshots
    await adminClient.from("attempt_answers").delete().eq("attempt_id", attempt.id);
    const { error: insertAnswersError } = await adminClient
      .from("attempt_answers")
      .insert(attemptAnswerInserts);

    if (insertAnswersError) {
      console.error("Failed to insert attempt answer snapshots:", insertAnswersError);
    }

    // 7. Update attempt to submitted
    const { error: updateAttemptError } = await adminClient
      .from("attempts")
      .update({
        status: "submitted",
        submitted_at: now.toISOString(),
        duration_sec: durationSec,
        score: Math.max(0, totalScore),
        max_score: maxScore,
        percent: percentage,
        section_scores: sectionScoreMap,
        essay_text: essayText || attempt.essay_text,
        client_meta: clientMeta || {},
      })
      .eq("id", attempt.id);

    if (updateAttemptError) {
      return NextResponse.json({ error: updateAttemptError.message }, { status: 500 });
    }

    // 8. Fetch user details to optionally send report ready email
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    if (profile) {
      sendEmail({
        to: profile.email,
        template: "report_ready_student",
        data: {
          fullName: profile.full_name,
          testTitle: test?.title || "HOSA Mock Exam",
          score: Math.max(0, totalScore),
          maxScore,
          percent: percentage,
          attemptId: attempt.id,
        },
      }).catch((e) => console.error("Report email dispatch error:", e));
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: Math.max(0, totalScore),
      maxScore,
      percent: percentage,
      sectionScores: sectionScoreMap,
    });
  } catch (err: any) {
    console.error("[Submit Exam Error]:", err);
    return NextResponse.json({ error: "Failed to submit exam attempt" }, { status: 500 });
  }
}

