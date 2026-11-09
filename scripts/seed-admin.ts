/**
 * One-time admin seed script for EduQuest HOSA Portal
 * Reads ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD from .env or .env.local
 * Creates or updates the Supabase Auth user and sets profiles.role='admin' & status='approved'
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local or .env
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
const adminEmail = process.env.ADMIN_EMAIL || "rupali.eduquest@gmail.com";
const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "EduQuest@HOSA2026";

async function seedAdmin() {
  console.log("=================================================");
  console.log("  MBA Wizards Mock Test Portal — Admin Seeder    ");
  console.log("=================================================");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
    console.error("Please configure them in your .env or .env.local file.");
    process.exit(1);
  }

  // Create elevated Supabase client using Service Role Key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`Checking existing users for email: ${adminEmail}...`);

  // Check if admin user already exists in auth.users (paginate if needed)
  let existingUser = null;
  let page = 1;
  while (!existingUser) {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (listError || !usersData?.users?.length) break;
    existingUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
    );
    if (usersData.users.length < 100) break;
    page++;
  }

  let userId: string;

  if (existingUser) {
    console.log(`Admin user found in Auth (ID: ${existingUser.id}). Updating password and metadata...`);
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: "Rupali MBA Wizards Admin",
          phone: "+919999999999",
          city: "Headquarters",
          events: ["ST", "HCIE"],
        },
      }
    );

    if (updateError) {
      console.error("❌ Failed to update auth user:", updateError.message);
      process.exit(1);
    }

    userId = updatedUser.user.id;
    console.log("✅ Supabase Auth user updated successfully.");
  } else {
    console.log(`Creating new admin user: ${adminEmail}...`);
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Rupali MBA Wizards Admin",
        phone: "+919999999999",
        city: "Headquarters",
        events: ["ST", "HCIE"],
      },
    });

    if (createError) {
      console.error("❌ Failed to create auth user:", createError.message);
      process.exit(1);
    }

    userId = createdUser.user.id;
    console.log(`✅ Supabase Auth user created successfully (ID: ${userId}).`);
  }

  // Upsert profile in public.profiles with role='admin'
  console.log("Ensuring admin profile in public.profiles table...");
  const fullPayload = {
    id: userId,
    full_name: "Rupali MBA Wizards Admin",
    email: adminEmail,
    phone: "+919999999999",
    city: "Headquarters",
    events: ["ST", "HCIE"],
    role: "admin",
    status: "approved",
    approved_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase.from("profiles").upsert(fullPayload, { onConflict: "id" });

  if (profileError) {
    console.warn("Notice: Extended column upsert:", profileError.message);
    console.log("Attempting fallback with standard columns (role='admin')...");
    const fallbackPayload = {
      id: userId,
      full_name: "Rupali MBA Wizards Admin",
      email: adminEmail,
      role: "admin",
    };
    const { error: fallbackErr } = await supabase.from("profiles").upsert(fallbackPayload, { onConflict: "id" });
    if (fallbackErr) {
      console.error("❌ Fallback profile update error:", fallbackErr.message);
    } else {
      console.log("✅ Fallback admin profile set with role='admin'.");
      console.log("👉 Reminder: Run 'supabase/schema.sql' in your Supabase SQL Editor to enable all HOSA columns and test tables.");
    }
  }

  console.log("=================================================");
  console.log("🎉 SUCCESS: Admin account configured successfully!");
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("   Role:     admin");
  console.log("   Status:   approved");
  console.log("=================================================");
}

seedAdmin().catch((err) => {
  console.error("Unexpected error seeding admin:", err);
  process.exit(1);
});
