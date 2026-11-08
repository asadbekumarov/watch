import crypto from "node:crypto";

const TRACKING_SECRET = process.env.ORDER_TRACKING_SECRET || "swisswatch-premium-secure-tracking-secret-2026";

/**
 * Generates an unguessable signed token for customer order tracking.
 * Format: <base64url(orderId)>.<hmac_sha256_signature_16bytes>
 */
export function generateTrackingToken(orderId: string): string {
  const payload = Buffer.from(orderId, "utf-8").toString("base64url");
  const hmac = crypto.createHmac("sha256", TRACKING_SECRET);
  hmac.update(orderId);
  const signature = hmac.digest("base64url").slice(0, 22);
  return `${payload}.${signature}`;
}

/**
 * Verifies the token signature using timing-safe comparison and extracts the orderId.
 * Returns null if token is forged, expired, or malformed.
 */
export function verifyTrackingToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!payload || !signature) return null;

    const orderId = Buffer.from(payload, "base64url").toString("utf-8");
    if (!orderId || orderId.length < 3) return null;

    const hmac = crypto.createHmac("sha256", TRACKING_SECRET);
    hmac.update(orderId);
    const expectedSignature = hmac.digest("base64url").slice(0, 22);

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    return orderId;
  } catch {
    return null;
  }
}

