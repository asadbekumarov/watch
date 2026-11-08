import React, { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CatalogClient from "./CatalogClient";
import { getStoreProducts, getStoreSettings } from "@/lib/db/queries";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSettings();
  return {
    title: `Soatlar Kolleksiyasi | ${store.displayName} (Toshkent, Namangan)`,
    description:
      "West End Watch va Jacques Philippe soatlari kolleksiyasi. Toshkent va Namangan filiallarida tanishish yoki narxni menejer orqali aniqlash mumkin.",
  };
}

export default async function CatalogPage() {
  const products = await getStoreProducts();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#090909]">
        <Suspense
          fallback={
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-36 pb-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <CatalogClient initialProducts={products} />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
