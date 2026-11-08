export function isSupabaseDevFallback(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return process.env.NODE_ENV === "development" && (!url || url.includes("placeholder"));
}

