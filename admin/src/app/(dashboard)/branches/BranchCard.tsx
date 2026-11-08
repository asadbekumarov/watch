"use client";

import React, { useState, useTransition } from "react";
import { updateBranch } from "@/app/actions/branchActions";
import { MapPin, Save, Loader2, CheckCircle2 } from "lucide-react";
import type { Database } from "@shared/types/database.types";

type BranchRow = Database["public"]["Tables"]["branches"]["Row"];

export default function BranchCard({ branch }: { branch: BranchRow }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(false);
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateBranch(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(true);
      }
    });
  };

  return (
    <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">{branch.city_uz} filiali</h2>
            <p className="text-[11px] text-zinc-500 font-mono">ID: {branch.id}</p>
          </div>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saqlandi
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={branch.id} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Manzil (O&apos;zbekcha)</label>
            <input
              type="text"
              name="address_uz"
              required
              defaultValue={branch.address_uz}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Manzil (Ruscha)</label>
            <input
              type="text"
              name="address_ru"
              required
              defaultValue={branch.address_ru}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Mo&apos;ljal (O&apos;zbekcha)</label>
            <input
              type="text"
              name="landmark_uz"
              required
              defaultValue={branch.landmark_uz}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Mo&apos;ljal (Ruscha)</label>
            <input
              type="text"
              name="landmark_ru"
              required
              defaultValue={branch.landmark_ru}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Filial telefoni</label>
            <input
              type="text"
              name="phone"
              defaultValue={branch.phone || ""}
              placeholder="+998 88 500 70 00"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Xarita havolasi (Yandex/Google)</label>
            <input
              type="text"
              name="map_link"
              defaultValue={branch.map_link || ""}
              placeholder="https://maps.yandex.ru/..."
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              name="pickup_enabled"
              defaultChecked={branch.pickup_enabled}
              className="rounded bg-zinc-900 border-zinc-700 text-[#D4AF37]"
            />
            <span>Mijoz ushbu filialdan o&apos;zi olib ketishi (pickup) mumkin</span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Filialni saqlash</span>
          </button>
        </div>
      </form>
    </div>
  );
}
