/**
 * On-Demand Cache Revalidation Route Handler
 *
 * Implements cache revalidation following the official Next.js 16 documentation:
 * - revalidateTag: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md
 *   "revalidateTag(tag: string, profile: string | { expire?: number }): void;
 *   Calling revalidateTag marks the tagged data as stale... profile='max' (recommended)"
 * - revalidatePath: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md
 *   "revalidatePath(path: string, type?: 'page' | 'layout'): void;"
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "crypto";

// Timing-safe secret comparison to prevent side-channel timing attacks
function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) {
    // Constant time dummy check to avoid length leak
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  try {
    const configuredSecret = process.env.REVALIDATION_SECRET;
    if (!configuredSecret) {
      return NextResponse.json(
        { error: "REVALIDATION_SECRET is not configured on the server." },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("x-revalidate-secret") || "";
    if (!timingSafeCompare(authHeader, configuredSecret)) {
      return NextResponse.json(
        { error: "Invalid revalidation secret." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { tag, path, type, slug } = body as {
      tag?: string;
      path?: string;
      type?: "page" | "layout";
      slug?: string;
    };

    // Revalidate by tag if provided
    if (tag) {
      revalidateTag(tag, "max");
    }

    // Revalidate by path if provided
    if (path) {
      if (type) {
        revalidatePath(path, type);
      } else {
        revalidatePath(path);
      }
    }

    // Default revalidation for product or content changes
    if (slug) {
      revalidatePath(`/watch/${slug}`, "page");
    }
    revalidatePath("/", "page");
    revalidatePath("/catalog", "page");

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      details: { tag, path, slug },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Revalidation failed", message },
      { status: 500 }
    );
  }
}
