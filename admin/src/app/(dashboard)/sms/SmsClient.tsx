"use client";

import React, { useState, useTransition } from "react";
import { resendSmsAction } from "@/app/actions/smsActions";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Search,
  Filter,
  Phone,
  Server,
  AlertCircle,
} from "lucide-react";

export interface SmsLogItem {
  id: number;
  order_id: string | null;
  phone: string;
  message: string;
  provider: string;
  status: "pending" | "sent" | "failed";
  attempt_count: number;
  external_id: string | null;
  error_details: string | null;
  created_at: string;
  orders?: { order_number?: string } | null;
}

interface SmsClientProps {
  initialLogs: SmsLogItem[];
  activeProvider: string;
}

export default function SmsClient({ initialLogs, activeProvider }: SmsClientProps) {
  const [logs, setLogs] = useState<SmsLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "sent" | "failed" | "pending">("all");
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [, startTransition] = useTransition();

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== "all" && log.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchPhone = log.phone.toLowerCase().includes(q);
      const matchMessage = log.message.toLowerCase().includes(q);
      const matchOrder = log.orders?.order_number?.toLowerCase().includes(q);
      return matchPhone || matchMessage || matchOrder;
    }
    return true;
  });

  const totalCount = logs.length;
  const sentCount = logs.filter((l) => l.status === "sent").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;

  const handleResend = (id: number) => {
    setResendingId(id);
    setActionMessage(null);

    startTransition(async () => {
      try {
        const res = await resendSmsAction(id);
        if (res.success) {
          setActionMessage({ text: "SMS muvaffaqiyatli qayta yuborildi." });
          setLogs((prev) =>
            prev.map((l) =>
              l.id === id
                ? {
                    ...l,
                    status: "sent",
                    attempt_count: (l.attempt_count || 1) + 1,
                    error_details: null,
                  }
                : l
            )
          );
        } else {
          setActionMessage({
            text: res.error || "SMS yuborishda xatolik yuz berdi.",
            isError: true,
          });
          setLogs((prev) =>
            prev.map((l) =>
              l.id === id
                ? {
                    ...l,
                    status: "failed",
                    attempt_count: (l.attempt_count || 1) + 1,
                    error_details: res.error || l.error_details,
                  }
                : l
            )
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Tarmoq xatosi";
        setActionMessage({ text: msg, isError: true });
      } finally {
        setResendingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111419] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Jami xabarlar</span>
            <MessageSquare className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-serif text-white">{totalCount}</p>
        </div>

        <div className="bg-[#111419] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Yuborilgan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-serif text-emerald-400">{sentCount}</p>
        </div>

        <div className="bg-[#111419] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-red-400">Xatolik</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="mt-2 text-2xl font-serif text-red-400">{failedCount}</p>
        </div>

        <div className="bg-[#111419] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37]">Provayder</span>
            <Server className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="mt-2 text-sm font-mono text-white uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {activeProvider}
          </p>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            actionMessage.isError
              ? "bg-red-950/40 border-red-500/30 text-red-200"
              : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
          }`}
        >
          {actionMessage.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#111419] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0 ml-1" />
          {(["all", "sent", "failed", "pending"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? "bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]"
                  : "bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white"
              }`}
            >
              {st === "all" ? "Barchasi" : st === "sent" ? "Yuborilgan" : st === "failed" ? "Xatolik" : "Kutilmoqda"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Telefon yoki xabar matni..."
            className="w-full bg-[#0d0f12] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>
      </div>

      {/* SMS Logs Table */}
      <div className="bg-[#111419] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Sana va vaqt</th>
                <th className="py-3 px-4">Qabul qiluvchi</th>
                <th className="py-3 px-4">Xabar matni</th>
                <th className="py-3 px-4">Buyurtma</th>
                <th className="py-3 px-4">Provayder</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4">Urinishlar</th>
                <th className="py-3 px-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                    SMS xabarlar mavjud emas.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isResending = resendingId === log.id;
                  const dateStr = new Date(log.created_at).toLocaleString("uz-UZ", {
                    timeZone: "Asia/Tashkent",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-zinc-400 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          <span>{log.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-zinc-300 max-w-xs truncate" title={log.message}>
                        {log.message}
                        {log.error_details && (
                          <p className="text-[10px] text-red-400 truncate mt-0.5" title={log.error_details}>
                            ⚠️ {log.error_details}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                        {log.orders?.order_number ? (
                          <span className="text-[#D4AF37]">{log.orders.order_number}</span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                          {log.provider}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.status === "sent" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Yuborildi
                          </span>
                        ) : log.status === "failed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                            <XCircle className="w-3 h-3" />
                            Xatolik
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <Clock className="w-3 h-3" />
                            Kutilmoqda
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap text-center">
                        {log.attempt_count || 1}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleResend(log.id)}
                          disabled={isResending}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors disabled:opacity-50 text-[11px]"
                          title="Qayta yuborish"
                        >
                          <RotateCw className={`w-3 h-3 ${isResending ? "animate-spin text-[#D4AF37]" : ""}`} />
                          <span>Qayta yuborish</span>
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
    </div>
  );
}
