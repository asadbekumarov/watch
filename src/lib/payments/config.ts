/**
 * SwissWatch_premium — Payment Configuration (Phase 4: Sandbox Only)
 * Official documentation followed:
 * - Paycom Merchant API: JSON-RPC 2.0 (tiyin-based: 1 UZS = 100 tiyins)
 * - Click Shop API: Prepare & Complete (MD5 signature verification)
 */

export const PAYMENTS_CONFIG = {
  isTestMode: process.env.PAYME_TEST_MODE !== "false" && process.env.CLICK_TEST_MODE !== "false",

  payme: {
    merchantId: process.env.PAYME_MERCHANT_ID || "test_payme_merchant_id",
    // Note: secretKey is accessed via server-only modules
    checkoutUrl: process.env.PAYME_TEST_MODE === "false"
      ? "https://checkout.paycom.uz"
      : "https://test.paycom.uz",
  },

  click: {
    serviceId: process.env.CLICK_SERVICE_ID || "test_click_service_id",
    merchantId: process.env.CLICK_MERCHANT_ID || "test_click_merchant_id",
    checkoutUrl: "https://my.click.uz/services/pay",
  },
};

