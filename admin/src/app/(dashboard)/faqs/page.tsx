import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import FaqManager from "./FaqManager";
import { getDevFaqs } from "@shared/devStore";
import type { Database } from "@shared/types/database.types";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

export default async function FaqsPage() {
  await requireAuth(["owner", "manager"]);
  let faqs: FaqRow[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      faqs = data as FaqRow[];
    }
  } catch (err) {
    console.warn("Faqs fetch warning in dev:", err);
  }

  if (faqs.length === 0 && process.env.NODE_ENV === "development") {
    faqs = getDevFaqs();
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-xl font-medium text-white">Ko&apos;p beriladigan savollar (FAQ)</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Mijozlar uchun ko&apos;rsatiladigan savol-javoblar ro&apos;yxatini boshqarish
        </p>
      </div>

      <FaqManager initialFaqs={faqs} />
    </div>
  );
}

