import { createClient } from "./supabase/server";
import { isSupabaseDevFallback } from "./supabase/devFallback";
import { saveDevAuditLog } from "@shared/devStore";
import type { Json } from "@shared/types/database.types";

interface LogAuditParams {
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Json;
  newValues?: Json;
  ipAddress?: string | null;
}

export async function logAuditEvent({
  action,
  entityType,
  entityId,
  oldValues = null,
  newValues = null,
  ipAddress = null,
}: LogAuditParams) {
  try {
    if (isSupabaseDevFallback()) {
      saveDevAuditLog({
        actor_id: "dev-owner-id",
        actor_email: "watch@gmail.com",
        actor_role: "owner",
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress || "127.0.0.1",
      });
      return;
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("audit_log").insert({
      user_id: user?.id || null,
      user_email: user?.email || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      saveDevAuditLog({
        actor_id: "dev-owner-id",
        actor_email: "watch@gmail.com",
        actor_role: "owner",
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress || "127.0.0.1",
      });
      return;
    }
    console.error("[AuditLog] Failed to record audit log:", err);
  }
}
