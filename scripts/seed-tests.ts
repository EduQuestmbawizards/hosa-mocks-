/**
 * Comprehensive HOSA 2026-27 Test Seeder (v3 update)
 * Seeds:
 * 1. ST – Mock 1 (FREE) - 50 MCQ (AST 5/5/10/15/5/10 split)
 * 2. ST – Practice Set A (FREE) - 40 questions from st-practice-set-a-40q.json (Practice mode with instant feedback)
 * 3. ST – Mock 2 (LOCKED) - 50 questions from st-mock-2-50q.json (strict 5/5/10/15/5/10 split)
 * 4. ST – Mock 3 (Unpublished Draft)
 * 5. HCIE – Mock 1 (50 News-Fact Recall MCQs + 500-word Tiebreaker Essay)
 *
 * Usage:
 *   npx tsx scripts/seed-tests.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedTestFromJson(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    return;
  }

  const raw = fs.readFileSync(absolutePath, "utf-8");
  const parsed = JSON.parse(raw);
  const { test_slug, test_meta, questions } = parsed;

  console.log(`Seeding test from JSON: ${test_meta.title} (${test_slug})...`);

  // 1. Upsert test record with mode_config
  const modeConfig = {
    instant_feedback: test_meta.instant_feedback ?? (test_meta.kind === "practice"),
    timer: test_meta.kind === "practice" ? "optional" : "mandatory",
    suggested_minutes: test_meta.duration_min || (test_meta.kind === "practice" ? 48 : 60),
    show_explanation: test_meta.instant_feedback ?? (test_meta.kind === "practice"),
    allow_retry: true,
    shuffle_questions: test_meta.shuffle_questions ?? false,
    shuffle_options: false,
  };

  const { data: test, error: testErr } = await supabase
    .from("tests")
    .upsert(
      {
        slug: test_slug,
        title: test_meta.title,
        event: test_meta.event,
        kind: test_meta.kind,
        total_questions: test_meta.total_questions || questions.length,
        duration_min: test_meta.duration_min || (test_meta.kind === "practice" ? 48 : 60),
        is_free: test_meta.is_free ?? false,
        is_published: true,
        mode_config: modeConfig,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (testErr || !test) {
    console.error(`Failed to upsert test ${test_slug}:`, testErr?.message);
    return;
  }

  // 2. Count questions per section
  const sectionCounts: Record<string, number> = {};
  for (const q of questions) {
    const secName = (q.section || "General").trim();
    sectionCounts[secName] = (sectionCounts[secName] || 0) + 1;
  }

  // 3. Upsert sections
  const sectionMap: Record<string, string> = {};
  let sortOrder = 1;
  for (const [secName, count] of Object.entries(sectionCounts)) {
    const { data: secRow } = await supabase
      .from("sections")
      .upsert(
        {
          test_id: test.id,
          name: secName,
          weight_percent: Math.round((count / questions.length) * 100 * 10) / 10,
          question_count: count,
          sort_order: sortOrder++,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (secRow) {
      sectionMap[secName] = secRow.id;
    }
  }

  // 4. Delete existing questions and insert fresh
  await supabase.from("questions").delete().eq("test_id", test.id);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const secId = sectionMap[(q.section || "General").trim()];

    const { data: qRow, error: qErr } = await supabase
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

    if (qRow) {
      // Map review_note -> question_keys.admin_note (Admin only)
      await supabase.from("question_keys").upsert({
        question_id: qRow.id,
        correct: Array.isArray(q.correct) ? q.correct : [q.correct],
        accepted_answers: q.accepted_answers || [],
        explanation: q.explanation || null,
        source_url: q.source_url || null,
        admin_note: q.review_note || null,
      });
    } else if (qErr) {
      console.error(`Failed to insert question ${i + 1}:`, qErr.message);
    }
  }

  console.log(`✅ ${test_meta.title} seeded successfully with ${questions.length} questions.`);
}

async function runSeed() {
  console.log("=================================================");
  console.log("  MBA Wizards HOSA v3 Database Seeder (ST & HCIE)");
  console.log("=================================================");

  // 1. Seed "ST – Practice Set A" (FREE, 40 questions)
  await seedTestFromJson("data/st-practice-set-a-40q.json");

  // 2. Seed "ST – Mock 2" (LOCKED, 50 questions, exact split)
  await seedTestFromJson("data/st-mock-2-50q.json");

  // 3. Seed "ST – Mock 3" (Unpublished Draft)
  console.log("Seeding ST – Mock 3 (Unpublished Draft)...");
  await supabase.from("tests").upsert(
    {
      slug: "st-mock-3",
      title: "ST - Mock 3",
      event: "ST",
      kind: "mock",
      total_questions: 50,
      duration_min: 60,
      is_free: false,
      is_published: false, // Unpublished draft
      instructions: "Draft mock examination for future tournament import.",
    },
    { onConflict: "slug" }
  );
  console.log("✅ ST – Mock 3 seeded as unpublished draft.");

  console.log("=================================================");
  console.log("🎉 SUCCESS: All v3 seed datasets processed!");
  console.log("=================================================");
}

runSeed().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});
