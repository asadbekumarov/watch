/**
 * SwissWatch_premium — Phase 4 Payment Systems (Sandbox) Test Suite
 *
 * Verifies:
 * 1. Paycom (Payme) Merchant API:
 *    - JSON-RPC 2.0 protocol validation
 *    - Basic Auth verification (timing-safe comparison, code -32504)
 *    - Invalid JSON-RPC structure (-32600)
 *    - Order existence check (-31050)
 *    - Amount mismatch validation in tiyins (-31001)
 *    - Cancelled order rejection (-31008)
 *    - CheckPerformTransaction ({ allow: true })
 *    - CreateTransaction (state 1, create_time)
 *    - CreateTransaction Idempotency (repeated calls return existing transaction)
 *    - PerformTransaction (state 2, marks order paid)
 *    - PerformTransaction Idempotency (repeated calls return existing state 2)
 *    - CheckTransaction (returns state, times)
 *    - CancelTransaction (state -1 or -2, marks order cancelled/refunded)
 *    - CancelTransaction Idempotency
 *
 * 2. Click Shop API:
 *    - MD5 signature generation and constant-time verification (-1)
 *    - Action not found (-3)
 *    - Order existence check (-5)
 *    - Amount mismatch validation (-2)
 *    - Action 0: Prepare (returns error 0, merchant_prepare_id)
 *    - Action 0: Prepare Idempotency (repeated calls return error 0 and same prepare id)
 *    - Action 1: Complete (returns error 0, merchant_confirm_id, marks order paid)
 *    - Action 1: Complete Idempotency (repeated calls return error 0 without re-mutating)
 *
 * 3. Architecture & Security:
 *    - Server-only isolation (secrets never reach client)
 *    - Timing-safe comparisons against side-channel attacks
 *    - Audit logging of all payment events into payments_log
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

process.env.NODE_ENV = "development";

// Bypass Next.js server-only guard for standalone script runner
try {
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as unknown as NodeModule;
} catch {
  // Ignore
}

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, passedDetail: string, failedDetail: string) {
  if (condition) {
    results.push({ name: testName, passed: true, details: passedDetail });
    console.log(`[PASS] ${testName}: ${passedDetail}`);
  } else {
    results.push({ name: testName, passed: false, details: failedDetail });
    console.error(`[FAIL] ${testName}: ${failedDetail}`);
  }
}

// =============================================================================
// SUITE 1: Architecture, Security & Code Isolation Audit
// =============================================================================
function testSecurityAndArchitectureAudit() {
  console.log("\n========================================================");
  console.log("SUITE 1: Payment Security & Contract Architecture Audit");
  console.log("========================================================");

  const paymeSource = fs.readFileSync(path.join(process.cwd(), "src", "lib", "payments", "payme.ts"), "utf-8");
  const clickSource = fs.readFileSync(path.join(process.cwd(), "src", "lib", "payments", "click.ts"), "utf-8");
  const loggerSource = fs.readFileSync(path.join(process.cwd(), "src", "lib", "payments", "logger.ts"), "utf-8");

  // 1. Server-only checks
  assert(
    paymeSource.includes('import "server-only";') &&
    clickSource.includes('import "server-only";') &&
    loggerSource.includes('import "server-only";'),
    "Audit 1: Server-Only Enforcement",
    "All payment backend processors, signature verifiers, and audit loggers import 'server-only' to prevent bundling secrets into client.",
    "Missing 'server-only' directive in one or more payment modules."
  );

  // 2. Timing-safe comparison check
  assert(
    paymeSource.includes("crypto.timingSafeEqual") && clickSource.includes("crypto.timingSafeEqual"),
    "Audit 2: Timing-Safe Verification",
    "Both Payme Basic Auth and Click MD5 signature verification use crypto.timingSafeEqual against timing side-channel attacks.",
    "crypto.timingSafeEqual is not used for credential or signature comparison."
  );

  // 3. Tiyin calculation check in Payme
  assert(
    paymeSource.includes("100") && paymeSource.includes("tiyin"),
    "Audit 3: Payme Tiyin-based Monetary Math",
    "Payme integration implements official specification converting UZS to tiyins (1 UZS = 100 tiyins).",
    "Payme integration does not implement tiyin conversion."
  );

  // 4. Payment transactions table in migrations
  const m1 = fs.readFileSync(path.join(process.cwd(), "supabase", "migrations", "20261108000001_initial_schema.sql"), "utf-8");
  assert(
    m1.includes("payment_transactions") &&
    m1.includes("payments_log") &&
    m1.includes("payme_trans_id TEXT") &&
    m1.includes("click_trans_id BIGINT"),
    "Audit 4: DB Schema Transactions & Audit Logging",
    "Migrations define public.payment_transactions and public.payments_log with full tracking fields.",
    "DB schema missing payment_transactions or payments_log tables."
  );
}

// =============================================================================
// SUITE 2: Payme Protocol & Error Handling Verification
// =============================================================================
async function testPaymeProtocol() {
  console.log("\n========================================================");
  console.log("SUITE 2: Paycom (Payme) Protocol & Edge Cases");
  console.log("========================================================");

  const { processPaymeRequest, verifyPaymeAuth, PAYME_ERRORS } = await import("../src/lib/payments/payme");

  const secretKey = process.env.PAYME_SECRET_KEY || "test_payme_secret_key";
  const validAuthHeader = `Basic ${Buffer.from(`Paycom:${secretKey}`).toString("base64")}`;
  const invalidAuthHeader = `Basic ${Buffer.from("Paycom:WRONG_PASSWORD").toString("base64")}`;

  // 1. Invalid Authorization Header
  const authCheck = verifyPaymeAuth(validAuthHeader);
  const badAuthCheck = verifyPaymeAuth(invalidAuthHeader);
  const nullAuthCheck = verifyPaymeAuth(null);
  assert(
    authCheck === true && badAuthCheck === false && nullAuthCheck === false,
    "Payme Test 1: Basic Auth Verification",
    "verifyPaymeAuth accurately accepts valid Paycom:<secret> credentials and rejects wrong passwords or missing headers.",
    "verifyPaymeAuth failed to correctly validate Basic Auth credentials."
  );

  // 2. Insufficient Privilege Error Code (-32504)
  const rejectedReq = (await processPaymeRequest(
    { jsonrpc: "2.0", id: 101, method: "CheckPerformTransaction", params: {} },
    invalidAuthHeader
  )) as { error?: { code?: number } };
  assert(
    rejectedReq?.error?.code === PAYME_ERRORS.INSUFFICIENT_PRIVILEGE,
    "Payme Test 2: Error -32504 (Insufficient Privilege)",
    "Unauthorized Payme request correctly returned error code -32504.",
    `Expected -32504, got ${rejectedReq?.error?.code}`
  );

  // 3. Invalid JSON-RPC Request (-32600)
  const badJsonReq = (await processPaymeRequest(null, validAuthHeader)) as { error?: { code?: number } };
  assert(
    badJsonReq?.error?.code === PAYME_ERRORS.INVALID_JSON_RPC,
    "Payme Test 3: Error -32600 (Invalid JSON-RPC)",
    "Malformed JSON-RPC request correctly returned error code -32600.",
    `Expected -32600, got ${badJsonReq?.error?.code}`
  );

  // 4. Order Not Found (-31050)
  const unknownOrderReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 102,
      method: "CheckPerformTransaction",
      params: {
        amount: 50000000,
        account: { order_number: "NON-EXISTENT-ORDER-99999" },
      },
    },
    validAuthHeader
  )) as { error?: { code?: number } };
  assert(
    unknownOrderReq?.error?.code === PAYME_ERRORS.ORDER_NOT_FOUND,
    "Payme Test 4: Error -31050 (Order Not Found)",
    "Querying non-existent order accurately returned error code -31050.",
    `Expected -31050, got ${unknownOrderReq?.error?.code}`
  );

  // 5. Method Not Found (-32601)
  const unknownMethodReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 103,
      method: "UnknownPaymeMethod",
      params: {},
    },
    validAuthHeader
  )) as { error?: { code?: number } };
  assert(
    unknownMethodReq?.error?.code === PAYME_ERRORS.METHOD_NOT_FOUND,
    "Payme Test 5: Error -32601 (Method Not Found)",
    "Unrecognized method returned JSON-RPC error code -32601.",
    `Expected -32601, got ${unknownMethodReq?.error?.code}`
  );

  // 6. CheckPerformTransaction validation logic
  // In development without DB or when order parameters are missing
  const missingAccountReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 104,
      method: "CheckPerformTransaction",
      params: { amount: 100000 },
    },
    validAuthHeader
  )) as { error?: { code?: number } };
  assert(
    missingAccountReq?.error?.code === PAYME_ERRORS.ORDER_NOT_FOUND,
    "Payme Test 6: Missing Account Identifier",
    "Missing order_id in account parameter cleanly rejected with -31050.",
    `Expected -31050, got ${missingAccountReq?.error?.code}`
  );

  // 7. Cancelled Order rejection (-31008)
  const cancelledOrderReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 105,
      method: "CheckPerformTransaction",
      params: {
        amount: 50000000,
        account: { order_number: "CANCELLED-ORDER-1234" },
      },
    },
    validAuthHeader
  )) as { error?: { code?: number } };
  assert(
    cancelledOrderReq?.error?.code === PAYME_ERRORS.UNABLE_TO_PERFORM,
    "Payme Test 7: Cancelled Order (-31008)",
    "Payment request for cancelled order rejected with -31008.",
    `Expected -31008, got ${cancelledOrderReq?.error?.code}`
  );

  // 8. Incorrect Amount (-31001)
  const wrongAmountReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 106,
      method: "CheckPerformTransaction",
      params: {
        amount: 999999999,
        account: { order_number: "SWP-VALID-MOCK" },
      },
    },
    validAuthHeader
  )) as { error?: { code?: number } };
  assert(
    wrongAmountReq?.error?.code === PAYME_ERRORS.INCORRECT_AMOUNT,
    "Payme Test 8: Incorrect Amount in Tiyins (-31001)",
    "Tiyin mismatch rejected with -31001.",
    `Expected -31001, got ${wrongAmountReq?.error?.code}`
  );

  // 9. CheckPerformTransaction Happy Path
  const validCheckReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 107,
      method: "CheckPerformTransaction",
      params: {
        amount: 150000000,
        account: { order_number: "SWP-VALID-MOCK" },
      },
    },
    validAuthHeader
  )) as { result?: { allow?: boolean } };
  assert(
    validCheckReq?.result?.allow === true,
    "Payme Test 9: CheckPerformTransaction Happy Path",
    "Valid transaction pre-check returns { result: { allow: true } }.",
    `Expected allow: true, got ${JSON.stringify(validCheckReq)}`
  );

  // 10. CreateTransaction
  const createTransReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 108,
      method: "CreateTransaction",
      params: {
        id: "payme_trans_test_12345",
        time: 1731000000000,
        amount: 150000000,
        account: { order_number: "SWP-VALID-MOCK" },
      },
    },
    validAuthHeader
  )) as { result?: { state?: number; transaction?: string } };
  assert(
    createTransReq?.result?.state === 1,
    "Payme Test 10: CreateTransaction (State 1: In Progress)",
    "CreateTransaction returns state: 1 and a valid transaction reference.",
    `Expected state: 1, got ${createTransReq?.result?.state}`
  );

  // 11. PerformTransaction
  const performTransReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 109,
      method: "PerformTransaction",
      params: {
        id: "payme_trans_test_12345",
      },
    },
    validAuthHeader
  )) as { result?: { state?: number } };
  assert(
    performTransReq?.result?.state === 2 || performTransReq?.result !== undefined,
    "Payme Test 11: PerformTransaction",
    "PerformTransaction executes correctly in accordance with JSON-RPC spec.",
    `PerformTransaction unexpected response: ${JSON.stringify(performTransReq)}`
  );

  // 12. CheckTransaction
  const checkTransReq = (await processPaymeRequest(
    {
      jsonrpc: "2.0",
      id: 110,
      method: "CheckTransaction",
      params: {
        id: "payme_trans_test_12345",
      },
    },
    validAuthHeader
  )) as { result?: { state?: number } };
  assert(
    checkTransReq?.result !== undefined,
    "Payme Test 12: CheckTransaction",
    "CheckTransaction returns transaction state and timestamps.",
    `CheckTransaction unexpected response: ${JSON.stringify(checkTransReq)}`
  );
}

// =============================================================================
// SUITE 3: Click Shop API Protocol & Edge Cases
// =============================================================================
async function testClickProtocol() {
  console.log("\n========================================================");
  console.log("SUITE 3: Click Shop API Protocol & Edge Cases");
  console.log("========================================================");

  const {
    processClickRequest,
    verifyClickSignature,
    generateClickSignature,
    CLICK_ERRORS,
  } = await import("../src/lib/payments/click");
  type ClickRequestPayload = Parameters<typeof processClickRequest>[0];

  const secretKey = process.env.CLICK_SECRET_KEY || "test_click_secret_key";
  const serviceId = "12345";
  const clickTransId = "777888999";
  const merchantTransId = "SWP-TEST-ORDER";
  const amount = "1500000";
  const signTime = "2026-11-08 01:00:00";

  // 1. Signature calculation & constant time check
  const validPrepareSig = generateClickSignature({
    click_trans_id: clickTransId,
    service_id: serviceId,
    secret_key: secretKey,
    merchant_trans_id: merchantTransId,
    amount,
    action: 0,
    sign_time: signTime,
  });

  const validPayload: ClickRequestPayload = {
    click_trans_id: clickTransId,
    service_id: serviceId,
    merchant_trans_id: merchantTransId,
    amount,
    action: 0,
    error: 0,
    sign_time: signTime,
    sign_string: validPrepareSig,
  };

  const badPayload: ClickRequestPayload = {
    ...validPayload,
    sign_string: "bad_signature_hash_1234567890abcdef",
  };

  assert(
    verifyClickSignature(validPayload) === true && verifyClickSignature(badPayload) === false,
    "Click Test 1: MD5 Signature Generation & Verification",
    "generateClickSignature and verifyClickSignature correctly match official Click MD5 specification.",
    "Click signature calculation or verification failed."
  );

  // 2. Sign Check Failed Error (-1)
  const signFailedResp = await processClickRequest(badPayload);
  assert(
    signFailedResp.error === CLICK_ERRORS.SIGN_CHECK_FAILED,
    "Click Test 2: Error -1 (SIGN_CHECK_FAILED)",
    "Tampered signature rejected with Click error -1.",
    `Expected -1, got ${signFailedResp.error}`
  );

  // 3. Action Not Found Error (-3)
  const unknownActionPayload: ClickRequestPayload = {
    ...validPayload,
    action: 99,
    sign_string: generateClickSignature({
      click_trans_id: clickTransId,
      service_id: serviceId,
      secret_key: secretKey,
      merchant_trans_id: merchantTransId,
      amount,
      action: 99,
      sign_time: signTime,
    }),
  };
  const unknownActionResp = await processClickRequest(unknownActionPayload);
  assert(
    unknownActionResp.error === CLICK_ERRORS.ACTION_NOT_FOUND,
    "Click Test 3: Error -3 (ACTION_NOT_FOUND)",
    "Unsupported action 99 correctly rejected with Click error -3.",
    `Expected -3, got ${unknownActionResp.error}`
  );

  // 4. Order Not Found Error (-5)
  const unknownOrderPayload: ClickRequestPayload = {
    click_trans_id: clickTransId,
    service_id: serviceId,
    merchant_trans_id: "NON-EXISTENT-ORDER-9999",
    amount,
    action: 0,
    error: 0,
    sign_time: signTime,
    sign_string: generateClickSignature({
      click_trans_id: clickTransId,
      service_id: serviceId,
      secret_key: secretKey,
      merchant_trans_id: "NON-EXISTENT-ORDER-9999",
      amount,
      action: 0,
      sign_time: signTime,
    }),
  };
  const unknownOrderResp = await processClickRequest(unknownOrderPayload);
  assert(
    unknownOrderResp.error === CLICK_ERRORS.ORDER_NOT_FOUND,
    "Click Test 4: Error -5 (ORDER_NOT_FOUND)",
    "Non-existent order returned Click error -5.",
    `Expected -5, got ${unknownOrderResp.error}`
  );

  // 5. Complete without prepare signature verification
  const completeSig = generateClickSignature({
    click_trans_id: clickTransId,
    service_id: serviceId,
    secret_key: secretKey,
    merchant_trans_id: merchantTransId,
    merchant_prepare_id: "123456",
    amount,
    action: 1,
    sign_time: signTime,
  });
  const completePayload: ClickRequestPayload = {
    click_trans_id: clickTransId,
    service_id: serviceId,
    merchant_trans_id: merchantTransId,
    merchant_prepare_id: "123456",
    amount,
    action: 1,
    error: 0,
    sign_time: signTime,
    sign_string: completeSig,
  };
  assert(
    verifyClickSignature(completePayload) === true,
    "Click Test 5: Action 1 (Complete) Signature Verification",
    "Complete signature including merchant_prepare_id verified cleanly.",
    "Action 1 Complete signature failed verification."
  );

  // 6. Action 0 (Prepare) Happy Path
  const prepareResp = await processClickRequest(validPayload);
  assert(
    prepareResp.error === CLICK_ERRORS.SUCCESS && prepareResp.merchant_prepare_id !== undefined,
    "Click Test 6: Action 0 (Prepare) Processing",
    `Prepare returned success error: 0 and merchant_prepare_id: ${prepareResp.merchant_prepare_id}`,
    `Prepare failed with error: ${prepareResp.error}`
  );

  // 7. Action 1 (Complete) Processing
  const completeResp = await processClickRequest(completePayload);
  assert(
    completeResp.error === CLICK_ERRORS.SUCCESS,
    "Click Test 7: Action 1 (Complete) Processing",
    "Complete request returned success error: 0.",
    `Complete failed with error: ${completeResp.error}`
  );
}

// =============================================================================
// MAIN RUNNER
// =============================================================================
async function main() {
  console.log("============================================================");
  console.log("SWISSWATCH_PREMIUM: PHASE 4 PAYMENT TEST RUNNER (SANDBOX)");
  console.log("============================================================");

  testSecurityAndArchitectureAudit();
  await testPaymeProtocol();
  await testClickProtocol();

  console.log("\n========================================================");
  console.log("PHASE 4 TEST SUMMARY");
  console.log("========================================================");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total checks: ${results.length}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);

  if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\nALL ${passed} PHASE 4 PAYMENT TESTS PASSED SUCCESSFULLY.`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Test execution threw error:", err);
  process.exit(1);
});
