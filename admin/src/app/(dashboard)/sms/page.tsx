import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { getDevSmsLog } from "@shared/devStore";
import SmsClient, { SmsLogItem } from "./SmsClient";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "SMS Xabarlar — SwissWatch Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SmsPage() {
  await requireAuth(["owner", "manager", "staff"]);
  let logs: SmsLogItem[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sms_log")
      .select("*, orders(order_number)")
      .order("created_at", { ascending: false })
      .limit(100);

    logs = (data || []) as unknown as SmsLogItem[];
  } catch (err) {
    console.warn("SMS log fetch warning in dev:", err);
  }

  if (logs.length === 0 && (process.env.NODE_ENV === "development" || isSupabaseDevFallback())) {
    logs = getDevSmsLog() as unknown as SmsLogItem[];
  }

  const activeProvider = (process.env.SMS_PROVIDER || "mock").toLowerCase() === "eskiz" ? "Eskiz.uz" : "Mock (Lokal)";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Xabarnomalar</span>
          </div>
          <h1 className="font-serif text-2xl font-normal text-white">SMS Xabarlar Tarixi</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Mijozlarga yuborilgan buyurtma va holat xabarnomalari jurnali
          </p>
        </div>
      </div>

      <SmsClient
        initialLogs={(logs || []) as unknown as SmsLogItem[]}
        activeProvider={activeProvider}
      />
    </div>
  );
}

