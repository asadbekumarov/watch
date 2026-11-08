"use client";

import React, { useState, useTransition } from "react";
import {
  createPromoCode,
  togglePromoCodeActive,
  deletePromoCode,
} from "@/app/actions/promoActions";
import type { Database, DiscountType } from "@shared/types/database.types";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Percent,
  DollarSign,
  Loader2,
} from "lucide-react";

type PromoRow = Database["public"]["Tables"]["promo_codes"]["Row"];

export default function PromoClient({ initialPromos }: { initialPromos: PromoRow[] }) {
  const [promos, setPromos] = useState<PromoRow[]>(initialPromos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [nowMs] = useState<number>(() => (typeof window !== "undefined" ? Date.now() : 0));

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percent");
  const [value, setValue] = useState<number>(5);
  const [minOrder, setMinOrder] = useState<number>(1000);
  const [maxDiscount, setMaxDiscount] = useState<string>("");
  const [validFrom, setValidFrom] = useState<string>("");
  const [validTo, setValidTo] = useState<string>("");
  const [totalLimit, setTotalLimit] = useState<string>("100");
  const [perCustomerLimit, setPerCustomerLimit] = useState<number>(1);

  const handleToggleActive = (promo: PromoRow) => {
    const nextState = !promo.is_active;
    startTransition(async () => {
      const res = await togglePromoCodeActive(promo.id, nextState);
      if (res.success) {
        setPromos((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, is_active: nextState } : p))
        );
      }
    });
  };

  const handleDelete = (promo: PromoRow) => {
    if (!confirm(`Haqiqatan ham "${promo.code}" promokodini o'chirmoqchimisiz?`)) return;
    startTransition(async () => {
      const res = await deletePromoCode(promo.id);
      if (res.success) {
        setPromos((prev) => prev.filter((p) => p.id !== promo.id));
      } else {
        alert(res.error);
      }
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await createPromoCode({
        code,
        type,
        value,
        min_order_usd: minOrder,
        max_discount_usd: maxDiscount ? Number(maxDiscount) : null,
        valid_from: validFrom || null,
        valid_to: validTo || null,
        total_usage_limit: totalLimit ? Number(totalLimit) : null,
        per_customer_limit: perCustomerLimit,
        is_active: true,
      });

      if (res.error) {
        setFormError(res.error);
      } else if (res.data) {
        setPromos((prev) => [res.data as PromoRow, ...prev]);
        setIsModalOpen(false);
        // reset form
        setCode("");
        setValue(5);
        setMinOrder(1000);
        setMaxDiscount("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Tag className="w-4 h-4 text-[#D4AF37]" />
          <span>Jami promokodlar soni: <strong>{promos.length}</strong></span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#090909] text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi promokod</span>
        </button>
      </div>

      {/* Promos Table */}
      <div className="bg-[#13171d] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0d0f12]/60 text-zinc-400">
                <th className="py-3 px-4 font-medium">Promokod</th>
                <th className="py-3 px-4 font-medium">Chegirma turi & miqdori</th>
                <th className="py-3 px-4 font-medium">Min. buyurtma</th>
                <th className="py-3 px-4 font-medium">Foydalanish / Limit</th>
                <th className="py-3 px-4 font-medium">Amal qilish muddati</th>
                <th className="py-3 px-4 font-medium">Holat</th>
                <th className="py-3 px-4 font-medium text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Hozircha hech qanday promokod yaratilmagan.
                  </td>
                </tr>
              ) : (
                promos.map((p) => {
                  const isExpired = Boolean(p.valid_to && nowMs > 0 && new Date(p.valid_to).getTime() < nowMs);
                  const isExhausted = p.total_usage_limit !== null && p.usage_count >= p.total_usage_limit;

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-white px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.1]">
                            {p.code}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {p.type === "percent" ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" /> {p.value}%
                            {p.max_discount_usd && (
                              <span className="text-zinc-500 text-[11px]">(maks. ${p.max_discount_usd})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-blue-400 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" /> ${p.value} USD
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        ${p.min_order_usd} USD
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className={isExhausted ? "text-red-400 font-medium" : "text-zinc-300"}>
                          {p.usage_count} / {p.total_usage_limit ?? "∞"}
                        </span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">mijoz boshiga: {p.per_customer_limit}</p>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        {p.valid_to ? (
                          <span className={isExpired ? "text-red-400" : ""}>
                            {new Date(p.valid_to).toLocaleDateString("uz-UZ")} gacha
                          </span>
                        ) : (
                          <span className="text-zinc-600">Cheklovsiz</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                            p.is_active && !isExpired && !isExhausted
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {p.is_active && !isExpired && !isExhausted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Faol</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Nofaol</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#13171d] border border-white/[0.1] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-serif font-medium text-white">Yangi promokod yaratish</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                  Promokod kodi *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="MASALAN: SPRING2026"
                  className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                    Chegirma turi *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="percent">Foizda (%)</option>
                    <option value="fixed">Qat&apos;iy summa ($ USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                    Qiymati ({type === "percent" ? "%" : "$"}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                    Min. buyurtma ($ USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                    Maks. chegirma ($ USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Cheksiz"
                    className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                    Umumiy foydalanish limiti
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={totalLimit}
                    onChange={(e) => setTotalLimit(e.target.value)}
                    placeholder="Cheksiz"
                    className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                    1 mijoz uchun limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={perCustomerLimit}
                    onChange={(e) => setPerCustomerLimit(Number(e.target.value))}
                    className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                    Amal qilish boshlanishi
                  </label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase tracking-wider">
                    Amal qilish tugashi
                  </label>
                  <input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#090909] font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
