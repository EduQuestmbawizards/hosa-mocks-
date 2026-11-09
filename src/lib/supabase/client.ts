import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a browser-side Supabase client using public keys.
 * Safe to use in Client Components.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

