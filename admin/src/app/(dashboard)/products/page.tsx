import React from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { Plus, Edit, Watch } from "lucide-react";
import ProductRowActions from "./ProductRowActions";
import { getDevProducts } from "@shared/devStore";
import type { Database } from "@shared/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export default async function ProductsPage() {
  await requireAuth(["owner", "manager"]);
  
  let products: ProductRow[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      products = data as ProductRow[];
    }
  } catch (err) {
    console.warn("Products fetch warning in dev:", err);
  }

  if (products.length === 0 && (process.env.NODE_ENV === "development" || isSupabaseDevFallback())) {
    products = getDevProducts();
  }

  const watchList = products;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl font-medium text-white">Soatlar katalogi</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Mavjud modellar, narxlar, qoldiq va ko&apos;rinish holatini boshqarish
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi soat qo&apos;shish</span>
        </Link>
      </div>

      <div className="bg-[#13171d] border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0d0f12]/60 text-zinc-400">
                <th className="py-3 px-4 font-medium">Soat</th>
                <th className="py-3 px-4 font-medium">Brend / Model</th>
                <th className="py-3 px-4 font-medium">Narxi (USD)</th>
                <th className="py-3 px-4 font-medium">Qoldiq</th>
                <th className="py-3 px-4 font-medium">Holati</th>
                <th className="py-3 px-4 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {watchList.map((watch) => {
                const img = watch.images?.[0] || "/placeholder.jpg";
                return (
                  <tr key={watch.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0d0f12] border border-white/[0.06] overflow-hidden relative shrink-0">
                          {watch.images?.[0] ? (
                            <Image
                              src={img}
                              alt={watch.name_uz}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <Watch className="w-5 h-5 text-zinc-600 m-auto mt-2.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white truncate max-w-[220px]">{watch.name_uz}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{watch.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-zinc-200">{watch.brand}</p>
                      <p className="text-[11px] text-zinc-500">{watch.case_diameter} • {watch.movement_type}</p>
                    </td>
                    <td className="py-3 px-4">
                      {watch.price_usd !== null ? (
                        <span className="font-mono text-zinc-200">${watch.price_usd}</span>
                      ) : (
                        <span className="text-amber-400 font-mono text-[11px]">So&apos;rov bo&apos;yicha</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-zinc-300">{watch.stock_quantity} dona</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          watch.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${watch.is_active ? "bg-emerald-400" : "bg-zinc-500"}`} />
                        {watch.is_active ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ProductRowActions id={watch.id} isActive={watch.is_active} />
                        <Link
                          href={`/products/${watch.id}`}
                          className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
