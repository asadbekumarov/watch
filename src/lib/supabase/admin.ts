import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("[SwissWatch] Security violation: Supabase Admin client cannot be instantiated in the browser bundle!");
  }

  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    throw new Error("[SwissWatch] Missing Supabase admin credentials (SUPABASE_SERVICE_ROLE_KEY) in production!");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

