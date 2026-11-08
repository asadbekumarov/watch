import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseServerClient() {
  const isMissing =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project") ||
    supabaseUrl.includes("placeholder");

  if (isMissing) {
    // In development or build-time fallback when external DB is not connected
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PHASE === "phase-production-build"
    ) {
      return null;
    }
    throw new Error(
      "[SwissWatch] Missing Supabase configuration in production environment!"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
