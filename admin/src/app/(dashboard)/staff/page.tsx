import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import StaffManager from "./StaffManager";
import type { Database } from "@shared/types/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function StaffPage() {
  await requireAuth(["owner"]);
  let staffList: ProfileRow[] = [];

  try {
    const supabase = await createClient();
    const { data: staff } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (staff && staff.length > 0) {
      staffList = staff;
    }
  } catch (err) {
    console.warn("Staff fetch warning in dev:", err);
  }

  if (staffList.length === 0 && (process.env.NODE_ENV === "development" || isSupabaseDevFallback())) {
    staffList = [
      {
        id: "dev-owner-id",
        email: "watch@gmail.com",
        full_name: "Bosh Administrator (Owner)",
        role: "owner",
        is_active: true,
        must_change_password: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-xl font-medium text-white">Xodimlar boshqaruvi</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Tizimga kirish huquqiga ega xodimlarni boshqarish va rollarni belgilash (Faqat Owner)
        </p>
      </div>

      <StaffManager staffList={staffList} />
    </div>
  );
}

