import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/emailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, phone, city, password, events } = result.data;
    const supabase = createAdminClient();

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const alreadyExists = existingUser.users.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (alreadyExists) {
      // Avoid user enumeration
      return NextResponse.json(
        { error: "An account with this email already exists or is pending review. Please log in." },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        city,
        events,
      },
    });

    if (authError) {
      console.error("[Signup API Error]:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create account" },
        { status: 400 }
      );
    }

    // Explicit profile upsert to guarantee persistence
    if (authData.user) {
      await supabase.from("profiles").upsert(
        {
          id: authData.user.id,
          full_name: fullName,
          email,
          phone,
          city,
          events,
          role: "student",
          status: "pending",
        },
        { onConflict: "id" }
      );

      await supabase.from("access_requests").upsert(
        {
          user_id: authData.user.id,
          status: "pending",
        },
        { onConflict: "user_id" }
      );

      // Trigger email alert to admin rupali.eduquest@gmail.com
      const adminEmail = process.env.ADMIN_EMAIL || "rupali.eduquest@gmail.com";
      sendEmail({
        to: adminEmail,
        template: "new_signup_admin",
        data: {
          fullName,
          email,
          phone,
          city,
          events,
        },
      }).catch((e) => console.error("Admin signup email alert error:", e));
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully! You can take the Free Mock right now, and all other mocks will unlock once approved by MBA Wizards.",
    });
  } catch (err: any) {
    console.error("[Signup Internal Error]:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup." },
      { status: 500 }
    );
  }
}

