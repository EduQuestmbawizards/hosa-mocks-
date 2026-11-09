import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/emailer";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify caller session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify admin role
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!callerProfile || callerProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { userId, decision, note } = await request.json();

    if (!userId || !["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch target user profile
    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Update profiles
    const { error: updateProfileError } = await adminClient
      .from("profiles")
      .update({
        status: decision,
        approved_at: decision === "approved" ? now : null,
        approved_by: decision === "approved" ? user.id : null,
      })
      .eq("id", userId);

    if (updateProfileError) {
      return NextResponse.json({ error: updateProfileError.message }, { status: 500 });
    }

    // Update access_requests
    await adminClient
      .from("access_requests")
      .update({
        status: decision,
        decided_at: now,
        decided_by: user.id,
        note: note || null,
      })
      .eq("user_id", userId);

    // Send email to student
    if (decision === "approved") {
      sendEmail({
        to: targetProfile.email,
        template: "account_approved_student",
        data: {
          fullName: targetProfile.full_name,
          events: targetProfile.events,
        },
      }).catch((e) => console.error("Error sending approval email:", e));
    } else {
      sendEmail({
        to: targetProfile.email,
        template: "account_rejected_student",
        data: {
          fullName: targetProfile.full_name,
          reason: note,
        },
      }).catch((e) => console.error("Error sending rejection email:", e));
    }

    return NextResponse.json({
      success: true,
      message: `User ${targetProfile.full_name} has been ${decision}. Notification email dispatched.`,
    });
  } catch (err: any) {
    console.error("[Decide Access Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

