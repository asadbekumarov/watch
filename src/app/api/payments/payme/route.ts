import { NextRequest, NextResponse } from "next/server";
import { processPaymeRequest } from "@/lib/payments/payme";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json().catch(() => null);

    const response = await processPaymeRequest(body, authHeader);
    return NextResponse.json(response);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32400,
          message: {
            uz: error.message || "Tizim xatoligi.",
            ru: "Системная ошибка.",
          },
        },
      },
      { status: 200 }
    );
  }
}

