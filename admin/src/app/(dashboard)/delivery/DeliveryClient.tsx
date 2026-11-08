"use client";

import React, { useState, useTransition } from "react";
import { updateDeliveryMethod, toggleDeliveryMethodEnabled } from "@/app/actions/deliveryActions";
import type { Database } from "@shared/types/database.types";
import {
  Truck,
  Building2,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

type DeliveryMethodRow = Database["public"]["Tables"]["delivery_methods"]["Row"];

export default function DeliveryClient({
  initialMethods,
}: {
  initialMethods: DeliveryMethodRow[];
}) {
  const [methods, setMethods] = useState<DeliveryMethodRow[]>(initialMethods);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<number>(0);
  const [freeAboveInput, setFreeAboveInput] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const startEdit = (method: DeliveryMethodRow) => {
    setEditingId(method.id);
    setPriceInput(Number(method.price_usd || 0));
    setFreeAboveInput(method.free_above_usd ? String(method.free_above_usd) : "");
    setSaveMessage(null);
  };

  const handleToggleEnabled = (method: DeliveryMethodRow) => {
    const nextState = !method.is_enabled;
    startTransition(async () => {
      const res = await toggleDeliveryMethodEnabled(method.id, nextState);
      if (res.success) {
        setMethods((prev) =>
          prev.map((m) => (m.id === method.id ? { ...m, is_enabled: nextState } : m))
        );
      }
    });
  };

  const handleSave = (id: string, isEnabled: boolean) => {
    startTransition(async () => {
      const res = await updateDeliveryMethod(id, {
        price_usd: priceInput,
        free_above_usd: freeAboveInput ? Number(freeAboveInput) : null,
        is_enabled: isEnabled,
      });

      if (res.success) {
        setMethods((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  price_usd: priceInput,
                  free_above_usd: freeAboveInput ? Number(freeAboveInput) : null,
                }
              : m
          )
        );
        setEditingId(null);
        setSaveMessage("Muvaffaqiyatli saqlandi!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => {
          const isEditing = editingId === method.id;
          const isPickup = method.delivery_type === "pickup";

          return (
            <div
              key={method.id}
              className={`p-6 rounded-2xl border transition-all ${
                method.is_enabled
                  ? "bg-[#13171d] border-white/[0.08]"
                  : "bg-[#0d0f12]/60 border-white/[0.04] opacity-80"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#D4AF37]">
                    {isPickup ? <Building2 className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{method.name_uz}</h3>
                    <p className="text-xs text-zinc-400">{method.name_ru}</p>
                  </div>
                </div>

                {/* Enable toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(method)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${
                    method.is_enabled
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {method.is_enabled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Faol</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Nofaol</span>
                    </>
                  )}
                </button>
              </div>

              {/* Content / Edit form */}
              <div className="py-4 space-y-4 text-xs font-mono">
                {!method.is_enabled && !isPickup && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Do&apos;kon egasi tarifni belgilagach faollashtiriladi</span>
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px] uppercase tracking-wider">
                        Tarif ($ USD)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={priceInput}
                        onChange={(e) => setPriceInput(Number(e.target.value))}
                        className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {!isPickup && (
                      <div>
                        <label className="block text-zinc-400 mb-1 text-[11px] uppercase tracking-wider">
                          Ushbu summadan yuqori bo&apos;lsa bepul ($ USD)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={freeAboveInput}
                          onChange={(e) => setFreeAboveInput(e.target.value)}
                          placeholder="Mavjud emas"
                          className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSave(method.id, method.is_enabled)}
                        className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#090909] font-medium rounded-lg flex items-center gap-1.5"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Saqlash</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>Tarif miqdori:</span>
                      <strong className="text-white font-medium">
                        {method.price_usd === 0 ? "Bepul ($0)" : `$${method.price_usd} USD`}
                      </strong>
                    </div>

                    {!isPickup && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Bepul yetkazish chegarasi:</span>
                        <strong className="text-zinc-300">
                          {method.free_above_usd ? `$${method.free_above_usd} USD dan yuqori` : "Belgilanmagan"}
                        </strong>
                      </div>
                    )}

                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => startEdit(method)}
                        className="text-xs text-[#D4AF37] hover:underline"
                      >
                        O&apos;zgartirish &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
