import { getSupabaseAdminClient } from "./supabase/admin";

export async function checkServerlessRateLimit(
  ip: string,
  action: string,
  maxCount: number = 20,
  windowSeconds: number = 60
): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    // In development mode without Supabase connection, allow
    return true;
  }

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_ip: ip,
      p_action: action,
      p_max_count: maxCount,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.warn("[RateLimit] Supabase rate limit error, defaulting to allow:", error.message);
      return true;
    }

    return Boolean(data);
  } catch (err) {
    console.warn("[RateLimit] Error calling check_rate_limit:", err);
    return true;
  }
}

