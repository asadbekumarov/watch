import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@shared/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

  return createBrowserClient(supabaseUrl, supabaseAnonKey) as unknown as SupabaseClient<Database>;
}
