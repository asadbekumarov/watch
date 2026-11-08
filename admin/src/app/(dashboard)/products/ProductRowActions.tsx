"use client";

import React, { useTransition } from "react";
import { toggleProductActive } from "@/app/actions/productActions";
import { Power, Loader2 } from "lucide-react";

export default function ProductRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (isActive && !confirm("Ushbu soatni saytda nofaol holatga o'tkazmoqchimisiz?")) {
      return;
    }
    startTransition(async () => {
      await toggleProductActive(id, isActive);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? "Nofaol qilish" : "Faollashtirish"}
      className={`p-1.5 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed ${
        isActive
          ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
      }`}
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
    </button>
  );
}

