import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import SettingsForm from "./SettingsForm";
import { getDevSettings } from "@shared/devStore";
import type { Database } from "@shared/types/database.types";

type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

export default async function SettingsPage() {
  await requireAuth(["owner"]);
  let settings: SiteSettingsRow | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    settings = data;
  } catch (err) {
    console.warn("Settings fetch warning in dev:", err);
  }

  if (!settings && (process.env.NODE_ENV === "development" || isSupabaseDevFallback())) {
    settings = getDevSettings();
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-xl font-medium text-white">Do&apos;kon sozlamalari</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Do&apos;kon nomi, aloqa ma&apos;lumotlari, ish vaqti va rasmiy USD/UZS kursi
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}

