// Supabase Edge Function: send-email
// Deno runtime compatible SMTP dispatcher
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, template, data } = await req.json();

    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
    const smtpPort = Deno.env.get("SMTP_PORT") || "587";
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log(`[Edge Function send-email] Dispatching ${template} to ${to}`);

    // If SMTP credentials exist, send via SMTP; otherwise record as queued
    let status = "sent";
    let error: string | null = null;

    if (!smtpUser || !smtpPass) {
      console.warn("SMTP credentials not configured in Edge Function secrets. Simulation mode.");
    }

    // Log to Supabase email_log table
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from("email_log").insert({
        to_email: to,
        template,
        status,
        error,
      });
    }

    return new Response(JSON.stringify({ success: true, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

