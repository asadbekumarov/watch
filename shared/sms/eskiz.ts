/**
 * SwissWatch_premium — Eskiz.uz SMS API Client
 * Official documentation followed:
 * - Login: POST https://notify.eskiz.uz/api/auth/login (email + password)
 * - Refresh: PATCH https://notify.eskiz.uz/api/auth/refresh (Bearer token)
 * - Send SMS: POST https://notify.eskiz.uz/api/message/sms/send (mobile_phone, message, from)
 * - Token Lifetime: 30 days (cached in memory with automatic refresh & retry on 401)
 */

interface EskizTokenCache {
  token: string | null;
  expiresAt: number;
}

const tokenCache: EskizTokenCache = {
  token: null,
  expiresAt: 0,
};

export function cleanPhoneForEskiz(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return digits;
  }
  if (digits.length === 9) {
    return `998${digits}`;
  }
  return digits;
}

/**
 * Log into Eskiz.uz to retrieve a fresh JWT Bearer token
 */
export async function getEskizToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  // Return cached token if valid for at least 5 minutes
  if (!forceRefresh && tokenCache.token && tokenCache.expiresAt > now + 300000) {
    return tokenCache.token;
  }

  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;

  if (!email || !password || email === "your_eskiz_email" || password === "your_eskiz_password") {
    throw new Error("[Eskiz] Credentials (ESKIZ_EMAIL or ESKIZ_PASSWORD) not configured or are placeholder.");
  }

  // Attempt refresh if token exists and forceRefresh requested
  if (forceRefresh && tokenCache.token) {
    try {
      const refreshRes = await fetch("https://notify.eskiz.uz/api/auth/refresh", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenCache.token}`,
        },
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken = refreshData?.data?.token;
        if (newToken) {
          tokenCache.token = newToken;
          tokenCache.expiresAt = Date.now() + 29 * 24 * 60 * 60 * 1000;
          return newToken;
        }
      }
    } catch {
      // Fallback to full login if refresh fails
    }
  }

  // Full login
  const res = await fetch("https://notify.eskiz.uz/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`[Eskiz] Login failed with HTTP status ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const token = data?.data?.token;

  if (!token) {
    throw new Error("[Eskiz] Login response did not contain a valid JWT token.");
  }

  // Cache token for 29 days (Eskiz tokens are 30 days)
  tokenCache.token = token;
  tokenCache.expiresAt = Date.now() + 29 * 24 * 60 * 60 * 1000;

  return token;
}

export interface SendEskizSmsParams {
  phone: string;
  message: string;
  from?: string;
}

export interface SendEskizSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Send an SMS message via Eskiz.uz
 */
export async function sendEskizSms(params: SendEskizSmsParams): Promise<SendEskizSmsResult> {
  const cleanPhone = cleanPhoneForEskiz(params.phone);
  const senderNick = params.from || process.env.ESKIZ_FROM || "4546";

  let token: string;
  try {
    token = await getEskizToken();
  } catch (authErr: unknown) {
    const message = authErr instanceof Error ? authErr.message : "Eskiz autentifikatsiya xatosi";
    return { success: false, error: message };
  }

  const executeSend = async (authToken: string) => {
    const formData = new URLSearchParams();
    formData.append("mobile_phone", cleanPhone);
    formData.append("message", params.message);
    formData.append("from", senderNick);

    return fetch("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
  };

  try {
    let res = await executeSend(token);

    // If 401 Unauthorized, refresh token once and retry
    if (res.status === 401) {
      token = await getEskizToken(true);
      res = await executeSend(token);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        success: false,
        statusCode: res.status,
        error: `Eskiz API qaytardi HTTP ${res.status}: ${errText}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      messageId: String(data?.id || data?.data?.id || "eskiz_sent"),
      statusCode: 200,
    };
  } catch (networkErr: unknown) {
    const message = networkErr instanceof Error ? networkErr.message : "Eskiz tarmoq xatoligi";
    return { success: false, error: message };
  }
}

