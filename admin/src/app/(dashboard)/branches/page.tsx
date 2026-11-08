import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import BranchCard from "./BranchCard";
import { getDevBranches } from "@shared/devStore";
import type { Database } from "@shared/types/database.types";

type BranchRow = Database["public"]["Tables"]["branches"]["Row"];

export default async function BranchesPage() {
  await requireAuth(["owner", "manager"]);
  let branches: BranchRow[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("branches")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      branches = data as BranchRow[];
    }
  } catch (err) {
    console.warn("Branches fetch warning in dev:", err);
  }

  if (branches.length === 0 && (process.env.NODE_ENV === "development" || isSupabaseDevFallback())) {
    branches = getDevBranches();
  }

  const branchList = branches;

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-xl font-medium text-white">Do&apos;kon filiallari</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Toshkent va Namangan shaharlaridagi mavjud ko&apos;rgazma zallari va olib ketish punktlari
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {branchList.map((branch) => (
          <BranchCard key={branch.id} branch={branch} />
        ))}
      </div>
    </div>
  );
}

