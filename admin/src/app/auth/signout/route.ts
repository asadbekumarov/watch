import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut().catch(() => {});
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"), {
    status: 302,
  });
  res.cookies.delete("swp_dev_admin_session");
  return res;
}

