import { createClient } from "@supabase/supabase-js";

/**
 * Creates an elevated Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * STRICTLY SERVER-SIDE ONLY.
 * Never call this from client components or leak to the browser bundle.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Ensure they are configured in environment variables."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

