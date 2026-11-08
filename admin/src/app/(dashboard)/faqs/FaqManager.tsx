"use client";

import React, { useState, useTransition } from "react";
import { saveFaq, deleteFaq } from "@/app/actions/faqActions";
import { Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react";
import type { Database } from "@shared/types/database.types";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

export default function FaqManager({ initialFaqs }: { initialFaqs: FaqRow[] }) {
  const [editingFaq, setEditingFaq] = useState<FaqRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveFaq(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setEditingFaq(null);
        setIsAdding(false);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Haqiqatan ham bu savolni o'chirmoqchimisiz?")) return;
    startTransition(async () => {
      await deleteFaq(id);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isAdding && !editingFaq && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi savol qo&apos;shish</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Create / Edit Form */}
      {(isAdding || editingFaq) && (
        <div className="p-6 rounded-xl bg-[#13171d] border border-[#D4AF37]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-medium text-white">
              {editingFaq ? "Savolni tahrirlash" : "Yangi FAQ savoli"}
            </h2>
            <button
              onClick={() => {
                setEditingFaq(null);
                setIsAdding(false);
              }}
              className="p-1 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {editingFaq && <input type="hidden" name="id" value={editingFaq.id} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300">Savol (O&apos;zbekcha)</label>
                <input
                  type="text"
                  name="question_uz"
                  required
                  defaultValue={editingFaq?.question_uz || ""}
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300">Savol (Ruscha)</label>
                <input
                  type="text"
                  name="question_ru"
                  required
                  defaultValue={editingFaq?.question_ru || ""}
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-zinc-300">Javob (O&apos;zbekcha)</label>
                <textarea
                  name="answer_uz"
                  required
                  rows={3}
                  defaultValue={editingFaq?.answer_uz || ""}
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-zinc-300">Javob (Ruscha)</label>
                <textarea
                  name="answer_ru"
                  required
                  rows={3}
                  defaultValue={editingFaq?.answer_ru || ""}
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingFaq(null);
                  setIsAdding(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-zinc-400 hover:text-white"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Saqlash</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-3">
        {initialFaqs.map((faq) => (
          <div
            key={faq.id}
            className="p-5 rounded-xl bg-[#13171d] border border-white/[0.08] flex items-start justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#D4AF37]">#{faq.sort_order + 1}</span>
                <h3 className="text-sm font-medium text-white">{faq.question_uz}</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer_uz}</p>
              <p className="text-[11px] text-zinc-500 italic mt-1">{faq.question_ru}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setEditingFaq(faq)}
                className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                title="Tahrirlash"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="p-1.5 rounded-md hover:bg-red-950/30 text-zinc-400 hover:text-red-400 transition-colors"
                title="O'chirish"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
