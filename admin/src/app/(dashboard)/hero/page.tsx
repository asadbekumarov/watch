import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import HeroForm from "./HeroForm";
import { getDevHero } from "@shared/devStore";
import type { Database } from "@shared/types/database.types";

type HeroRow = Database["public"]["Tables"]["hero_banners"]["Row"];

export default async function HeroPage() {
  await requireAuth(["owner", "manager"]);
  let hero: HeroRow | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("hero_banners")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    hero = data;
  } catch (err) {
    console.warn("Hero fetch warning in dev:", err);
  }

  if (!hero && process.env.NODE_ENV === "development") {
    hero = getDevHero();
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-xl font-medium text-white">Hero banner matnlari</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Bosh sahifadagi kirish animatsiyasi va bosh sarlavhalar matnini tahrirlash
        </p>
      </div>

      <HeroForm hero={hero} />
    </div>
  );
}

