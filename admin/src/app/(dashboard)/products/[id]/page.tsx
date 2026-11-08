import React from "react";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { getDevProducts } from "@shared/devStore";
import type { Database } from "@shared/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  await requireAuth(["owner", "manager"]);
  const { id } = await params;
  let product: ProductRow | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    product = (data as ProductRow) || null;
  } catch (err) {
    console.warn("EditProductPage fetch warning in dev:", err);
  }

  if (!product && (process.env.NODE_ENV === "development" || isSupabaseDevFallback())) {
    product = getDevProducts().find((p) => p.id === id || p.slug === id) || null;
  }

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} isNew={false} />;
}

