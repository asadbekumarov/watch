import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    throw new Error(
      "[SwissWatch] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in production!"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

