import React, { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CatalogClient from "./CatalogClient";

export const metadata: Metadata = {
  title: "Katalog | Vaqt Saroyi — Original Qo'l Soatlari",
  description:
    "Erkaklar va ayollar uchun original qo'l soatlari katalogi: Aurelia, Norden, Halden, Corvus, Meridiana, Tashqin brendlari. 24 oylik rasmiy kafolat bilan.",
};

export default function CatalogPage() {
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
          <CatalogClient />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}

