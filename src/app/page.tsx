import React, { Suspense } from "react";
import ScrollCanvas from "@/components/ScrollCanvas";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCartBar from "@/components/FloatingCartBar";
import HomeHero from "@/components/home/HomeHero";
import HomeCollection from "@/components/home/HomeCollection";
import HomeTrustSections from "@/components/home/HomeTrustSections";
import HomeFaq from "@/components/home/HomeFaq";
import { getStoreProducts, getStoreFaqs, getHeroBanner } from "@/lib/db/queries";

// Opt out of instant static shell validation for the interactive canvas scroll landing page
// As documented in Next.js 16 (node_modules/next/dist/docs/.../instant.md):
// Disables static shell validation when cacheComponents is enabled.
export const instant = false;

function HomeCollectionSkeleton() {
  return (
    <section id="collection" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-96 bg-white/[0.04] rounded-lg" />
        <div className="h-12 w-full bg-white/[0.02] rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-[#111111] rounded-xl border border-white/[0.05]" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const [products, faqs, heroBanner] = await Promise.all([
    getStoreProducts(),
    getStoreFaqs(),
    getHeroBanner(),
  ]);

  return (
    <>
      {/* ──── 240-KADRLI KINEMATIK SCROLL CANVAS (Client Component) ──── */}
      <ScrollCanvas frameCount={239} folderPath="/frames" />

      {/* ──── NAVBAR ──── */}
      <Navbar />

      {/* ──── SCROLL BOSQICHI (ORQA FON SHAFFOF) ──── */}
      <div id="scroll-stage" className="relative z-10 bg-transparent text-[#FFFFFF]">
        {/* 01: Hero Section (Interactive GSAP Client Island) */}
        <HomeHero banner={heroBanner} />

        {/* 02: Watch Collection & Filters (Interactive Client Island with Suspense for URL params) */}
        <Suspense fallback={<HomeCollectionSkeleton />}>
          <HomeCollection initialProducts={products} />
        </Suspense>

        {/* 03 & 04 & 06: Trust, Guarantee & Showroom (100% Server Rendered HTML) */}
        <HomeTrustSections />

        {/* 05: FAQ Accordion (Lightweight Client Island) */}
        <HomeFaq items={faqs} />

        {/* ──── FOOTER ──── */}
        <Footer />
      </div>

      {/* ──── FLOATING BOTTOM CART BAR ──── */}
      <FloatingCartBar />
    </>
  );
}
