import { NextRequest, NextResponse } from "next/server";
import { processClickRequest, ClickRequestPayload } from "@/lib/payments/click";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let payload: ClickRequestPayload;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      payload = {
        click_trans_id: formData.get("click_trans_id") as string,
        service_id: formData.get("service_id") as string,
        click_paydoc_id: formData.get("click_paydoc_id") as string,
        merchant_trans_id: formData.get("merchant_trans_id") as string,
        merchant_prepare_id: formData.get("merchant_prepare_id") as string,
        amount: formData.get("amount") as string,
        action: formData.get("action") as string,
        error: formData.get("error") as string,
        error_note: formData.get("error_note") as string,
        sign_time: formData.get("sign_time") as string,
        sign_string: formData.get("sign_string") as string,
      };
    } else {
      payload = await req.json().catch(() => ({} as ClickRequestPayload));
    }

    const response = await processClickRequest(payload);
    return NextResponse.json(response);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({
      error: -8,
      error_note: error.message || "Failed to process request",
    });
  }
}

