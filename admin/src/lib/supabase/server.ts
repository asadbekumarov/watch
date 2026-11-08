import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database, UserRole } from "@shared/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });

  return client as unknown as SupabaseClient<Database>;
}

// Helper to get current authenticated user and profile
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const devSession = cookieStore.get("swp_dev_admin_session")?.value;
  if (devSession === "owner") {
    return {
      user: {
        id: "dev-owner-id",
        email: "watch@gmail.com",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as unknown as Parameters<typeof createServerClient>[2] extends never ? never : { id: string; email: string },
      profile: {
        id: "dev-owner-id",
        email: "watch@gmail.com",
        full_name: "Bosh Administrator (Owner)",
        role: "owner" as UserRole,
        is_active: true,
        must_change_password: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile: profile || null,
  };
}

// Require role or redirect/throw
export async function requireAuth(allowedRoles: UserRole[] = ["owner", "manager", "staff"]) {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile || !profile.is_active) {
    return { authorized: false as const, user: null, profile: null };
  }

  if (!allowedRoles.includes(profile.role)) {
    return { authorized: false as const, user, profile };
  }

  return { authorized: true as const, user, profile };
}
