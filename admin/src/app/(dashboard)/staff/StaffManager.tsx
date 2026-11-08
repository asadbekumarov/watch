"use client";

import React, { useState, useTransition } from "react";
import { createStaffMember, toggleStaffActive } from "@/app/actions/staffActions";
import { UserPlus, Power, Loader2, Save, X } from "lucide-react";
import type { Database } from "@shared/types/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default function StaffManager({ staffList }: { staffList: ProfileRow[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createStaffMember(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsAdding(false);
      }
    });
  };

  const handleToggle = (id: string, active: boolean) => {
    if (active && !confirm("Ushbu xodimning tizimga kirish huquqini to'xtatmoqchimisiz?")) {
      return;
    }
    startTransition(async () => {
      await toggleStaffActive(id, active);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi xodim qo&apos;shish</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Add Staff Form */}
      {isAdding && (
        <div className="p-6 rounded-xl bg-[#13171d] border border-[#D4AF37]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-medium text-white">Yangi xodim akkauntini yaratish</h2>
            <button onClick={() => setIsAdding(false)} className="p-1 rounded text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300">F.I.Sh. (To&apos;liq ism)</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="Ali Valiyev"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300">Email manzil</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="xodim@example.com"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300">Vaqtinchalik parol (kamida 8 belgi)</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300">Tizimdagi roli</label>
                <select
                  name="role"
                  defaultValue="staff"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="staff">Staff (Faqat buyurtmalar bilan ishlash)</option>
                  <option value="manager">Manager (Mahsulotlar va buyurtmalar)</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              * Xodim birinchi marta tizimga kirganda o&apos;z shaxsiy yangi parolini o&apos;rnatishi shart.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-zinc-400 hover:text-white"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Xodimni yaratish</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List Table */}
      <div className="bg-[#13171d] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#0d0f12]/60 text-zinc-400">
              <th className="py-3 px-4 font-medium">Xodim</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Roli</th>
              <th className="py-3 px-4 font-medium">Holati</th>
              <th className="py-3 px-4 font-medium text-right">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {staffList.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-300 font-medium">
                      {member.full_name?.charAt(0) || "U"}
                    </div>
                    <span className="font-medium text-white">{member.full_name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-zinc-300">{member.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                      member.role === "owner"
                        ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30"
                        : member.role === "manager"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                      member.is_active
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? "bg-emerald-400" : "bg-zinc-500"}`} />
                    {member.is_active ? "Faol" : "To'xtatilgan"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {member.role !== "owner" && (
                    <button
                      onClick={() => handleToggle(member.id, member.is_active)}
                      disabled={isPending}
                      title={member.is_active ? "Faoliyatni to'xtatish" : "Faollashtirish"}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        member.is_active
                          ? "text-emerald-400 hover:bg-emerald-500/10"
                          : "text-zinc-500 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
