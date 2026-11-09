/// <reference path="../types.d.ts" />
// Supabase Edge Function: check-answer
// Evaluates a single question answer in Practice Mode only
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { attemptId, questionId, selected } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch attempt
    const { data: attempt } = await supabase
      .from("attempts")
      .select("*, test:tests(*)")
      .eq("id", attemptId)
      .single();

    if (!attempt) {
      return new Response(JSON.stringify({ error: "Attempt not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const test = attempt.test;
    const isPractice =
      test?.kind === "practice" || test?.mode_config?.instant_feedback === true;

    if (!isPractice) {
      return new Response(
        JSON.stringify({ error: "Instant feedback disabled for Mock exams." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Fetch question key
    const { data: key } = await supabase
      .from("question_keys")
      .select("correct, explanation")
      .eq("question_id", questionId)
      .single();

    const { data: q } = await supabase
      .from("questions")
      .select("source_ref")
      .eq("id", questionId)
      .single();

    const isCorrect =
      selected?.length > 0 &&
      key?.correct?.length > 0 &&
      selected[0] === key.correct[0];

    return new Response(
      JSON.stringify({
        success: true,
        is_correct: isCorrect,
        correct: key?.correct,
        explanation: key?.explanation,
        source_ref: q?.source_ref,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

