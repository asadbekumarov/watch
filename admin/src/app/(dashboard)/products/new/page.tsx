import React from "react";
import ProductForm from "@/components/ProductForm";
import { requireAuth } from "@/lib/supabase/server";

export default async function NewProductPage() {
  await requireAuth(["owner", "manager"]);
  return <ProductForm isNew={true} />;
}

