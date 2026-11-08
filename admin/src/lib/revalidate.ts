export async function triggerStorefrontRevalidation(params: {
  tag?: string;
  path?: string;
  slug?: string;
}) {
  const storefrontUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const revalSecret = process.env.REVALIDATION_SECRET;

  if (!revalSecret) {
    console.warn("[Admin] REVALIDATION_SECRET not configured, skipping storefront revalidation call.");
    return;
  }

  try {
    const res = await fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": revalSecret,
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      console.warn("[Admin] Storefront revalidation failed:", await res.text());
    }
  } catch (err) {
    console.warn("[Admin] Could not connect to storefront revalidation API:", err);
  }
}

