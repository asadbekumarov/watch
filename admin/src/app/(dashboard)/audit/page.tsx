import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { getDevAuditLog } from "@shared/devStore";
import { User, Clock } from "lucide-react";
import type { Database } from "@shared/types/database.types";

type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

export default async function AuditPage() {
  await requireAuth(["owner", "manager"]);
  let logs: AuditLogRow[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    logs = data || [];
  } catch (err) {
    console.warn("Audit logs fetch warning in dev:", err);
  }

  if (logs.length === 0 && (process.env.NODE_ENV === "development" || isSupabaseDevFallback())) {
    logs = getDevAuditLog() as unknown as AuditLogRow[];
  }

  const logList = logs;

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-xl font-medium text-white">Tizim audit jurnali</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Admin paneldagi har bir amal, narx, qoldiq yoki matn o&apos;zgarishlari tarixi (kim, qachon, nima)
        </p>
      </div>

      <div className="space-y-3">
        {logList.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#13171d] border border-white/[0.08] text-center text-xs text-zinc-500">
            Hozircha audit yozuvlari mavjud emas.
          </div>
        ) : (
          logList.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#D4AF37] font-medium bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                    {log.action}
                  </span>
                  <span className="text-zinc-400">
                    {log.entity_type} &rarr; <span className="font-mono text-zinc-200">{log.entity_id}</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-zinc-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{log.user_email || "Tizim"}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(log.created_at).toLocaleString("uz-UZ")}</span>
                  </span>
                </div>
              </div>

              {(log.old_values || log.new_values) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {log.old_values && (
                    <div className="p-2.5 rounded-lg bg-[#0d0f12] border border-white/[0.04]">
                      <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Oldingi qiymat:</p>
                      <pre className="text-[11px] font-mono text-red-300/80 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.old_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.new_values && (
                    <div className="p-2.5 rounded-lg bg-[#0d0f12] border border-white/[0.04]">
                      <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Yangi qiymat:</p>
                      <pre className="text-[11px] font-mono text-emerald-300/80 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
