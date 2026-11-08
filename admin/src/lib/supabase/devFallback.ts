export function isSupabaseDevFallback(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPlaceholder = !url || url.includes("placeholder") || !anonKey || anonKey.includes("placeholder");
  return process.env.NODE_ENV === "development" || isPlaceholder;
}

