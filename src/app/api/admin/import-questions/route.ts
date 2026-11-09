import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const OFFICIAL_ST_MOCK_SPLIT: Record<string, number> = {
  "Profession of CST": 5,
  "Physical Environment and Safety Standards": 5,
  "Surgical Asepsis and Sterility": 10,
  "Instrumentation, Equipment, and Supplies": 15,
  "Hemostasis, Wound Healing, and Wound Closure": 5,
  "Surgical Anatomy & Physiology": 10,
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify admin
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

    const body = await request.json();
    const { testSlug, test_slug, test_meta, questions, dryRun = false } = body;

    const slug = test_slug || testSlug || test_meta?.slug;

    if (!slug) {
      return NextResponse.json({ error: "Test slug is required." }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Questions array is missing or empty." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 2. Validate Questions (Row-level validation)
    const errors: Array<{ row: number; error: string }> = [];
    const warnings: string[] = [];
    const categoryCountMap: Record<string, number> = {};

    questions.forEach((q: any, idx: number) => {
      const rowNum = idx + 1;

      if (!q.stem || typeof q.stem !== "string" || !q.stem.trim()) {
        errors.push({ row: rowNum, error: "Question stem is empty or invalid." });
      }

      if (q.type === "mcq_single" || !q.type) {
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          errors.push({
            row: rowNum,
            error: `mcq_single must have exactly 4 options. Found ${q.options?.length ?? 0}.`,
          });
        }

        if (!Array.isArray(q.correct) || q.correct.length === 0) {
          errors.push({ row: rowNum, error: "'correct' array is missing or empty." });
        } else {
          const correctIdx = q.correct[0];
          if (
            typeof correctIdx !== "number" ||
            correctIdx < 0 ||
            correctIdx >= (q.options?.length || 4)
          ) {
            errors.push({
              row: rowNum,
              error: `'correct' index ${correctIdx} is out of bounds for options length ${q.options?.length || 0}.`,
            });
          }
        }
      }

      const secName = (q.section || "General").trim();
      categoryCountMap[secName] = (categoryCountMap[secName] || 0) + 1;
    });

    // 3. Mock vs Practice Validation (§D)
    const kind = test_meta?.kind || (questions.length === 50 ? "mock" : "practice");
    const event = test_meta?.event || (slug.startsWith("st-") ? "ST" : "HCIE");

    if (kind === "mock") {
      if (questions.length !== 50) {
        warnings.push(`Official HOSA mock tests must have exactly 50 questions (Found ${questions.length}).`);
      }

      if (event === "ST") {
        // Verify 5/5/10/15/5/10 split
        for (const [catName, requiredCount] of Object.entries(OFFICIAL_ST_MOCK_SPLIT)) {
          const actualCount = categoryCountMap[catName] || 0;
          if (actualCount !== requiredCount) {
            warnings.push(
              `ST Mock category '${catName}' has ${actualCount} questions (Expected official split: ${requiredCount}).`
            );
          }
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed with errors.",
          errors,
          warnings,
          dryRun,
        },
        { status: 400 }
      );
    }

    // 4. Return Dry-Run Result if dryRun is true
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Dry-run passed! ${questions.length} questions are valid.`,
        slug,
        kind,
        event,
        totalQuestions: questions.length,
        categoryCounts: categoryCountMap,
        warnings,
      });
    }

    // 5. Commit: Create or Update Test with test_meta & mode_config
    const modeConfig = {
      instant_feedback: test_meta?.instant_feedback ?? (kind === "practice"),
      timer: kind === "practice" ? "optional" : "mandatory",
      suggested_minutes: test_meta?.duration_min || (kind === "practice" ? 48 : 60),
      show_explanation: test_meta?.instant_feedback ?? (kind === "practice"),
      allow_retry: true,
      shuffle_questions: test_meta?.shuffle_questions ?? false,
      shuffle_options: false,
    };

    const { data: test, error: testUpsertErr } = await adminClient
      .from("tests")
      .upsert(
        {
          slug,
          title: test_meta?.title || slug.toUpperCase(),
          event,
          kind,
          total_questions: questions.length,
          duration_min: test_meta?.duration_min || (kind === "practice" ? 48 : 60),
          is_free: test_meta?.is_free ?? false,
          is_published: true,
          mode_config: modeConfig,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (testUpsertErr || !test) {
      return NextResponse.json(
        { error: `Failed to upsert test: ${testUpsertErr?.message}` },
        { status: 500 }
      );
    }

    // 6. Upsert Sections with actual question counts
    const { data: existingSections } = await adminClient
      .from("sections")
      .select("id, name")
      .eq("test_id", test.id);

    const sectionMap = new Map((existingSections || []).map((s) => [s.name.toLowerCase().trim(), s.id]));

    for (const [catName, count] of Object.entries(categoryCountMap)) {
      const cleanName = catName.toLowerCase().trim();
      let secId = sectionMap.get(cleanName);

      if (!secId) {
        const { data: newSec } = await adminClient
          .from("sections")
          .insert({
            test_id: test.id,
            name: catName,
            weight_percent: Math.round((count / questions.length) * 100 * 10) / 10,
            question_count: count,
            sort_order: sectionMap.size + 1,
          })
          .select()
          .single();

        if (newSec) {
          sectionMap.set(cleanName, newSec.id);
        }
      } else {
        await adminClient
          .from("sections")
          .update({
            question_count: count,
            weight_percent: Math.round((count / questions.length) * 100 * 10) / 10,
          })
          .eq("id", secId);
      }
    }

    // 7. Clear old questions for clean replace and re-insert
    await adminClient.from("questions").delete().eq("test_id", test.id);

    let importedCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const secId = sectionMap.get((q.section || "General").toLowerCase().trim());

      const { data: insertedQ, error: qErr } = await adminClient
        .from("questions")
        .insert({
          test_id: test.id,
          section_id: secId || null,
          type: q.type || "mcq_single",
          stem: q.stem,
          image_url: q.image_url || null,
          options: q.options || [],
          topic: q.topic || null,
          difficulty: q.difficulty || "medium",
          source_ref: q.source_ref || null,
          sort_order: q.sort_order ?? i + 1,
        })
        .select()
        .single();

      if (insertedQ) {
        // Map review_note -> question_keys.admin_note (Admin only!)
        await adminClient.from("question_keys").upsert({
          question_id: insertedQ.id,
          correct: Array.isArray(q.correct) ? q.correct : [q.correct],
          accepted_answers: q.accepted_answers || [],
          explanation: q.explanation || null,
          source_url: q.source_url || null,
          admin_note: q.review_note || q.admin_note || null,
        });

        importedCount++;
      } else if (qErr) {
        console.error("Failed to insert question row:", i, qErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} questions into '${slug}'.`,
      slug,
      kind,
      totalQuestions: importedCount,
      categoryCounts: categoryCountMap,
      warnings,
    });
  } catch (err: any) {
    console.error("[Import API Error]:", err);
    return NextResponse.json({ error: "Failed to process question bank." }, { status: 500 });
  }
}
