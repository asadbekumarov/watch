import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productsData } from "@/data/products";
import { storeData } from "@/data/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchDetailClient from "./WatchDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return productsData.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: `Soat topilmadi | ${storeData.name}`,
    };
  }

  const priceText = `${product.price.toLocaleString("ru-RU")} so'm`;

  return {
    title: `${product.name} | ${storeData.name}`,
    description: `${product.description} Narxi: ${priceText}. O'zbekiston bo'ylab BTS pochtalariga bepul yetkazish va @soatsoz_uzb rasmiy kafolati bilan.`,
    openGraph: {
      title: `${product.name} — ${storeData.name}`,
      description: product.description,
      siteName: storeData.name,
      locale: "uz_UZ",
      type: "website",
      images: [
        {
          url: product.images[0],
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
    },
  };
}

function WatchDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 sm:py-16 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 aspect-square bg-[#111111] rounded-2xl border border-white/[0.05]" />
        <div className="lg:col-span-5 space-y-6">
          <div className="h-4 w-24 bg-white/[0.05] rounded" />
          <div className="h-10 w-3/4 bg-white/[0.05] rounded" />
          <div className="h-6 w-1/3 bg-white/[0.05] rounded" />
          <div className="h-24 w-full bg-white/[0.05] rounded" />
          <div className="h-12 w-full bg-white/[0.05] rounded" />
        </div>
      </div>
    </div>
  );
}

async function WatchContent({ params }: PageProps) {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = productsData
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 3);

  return <WatchDetailClient product={product} relatedProducts={relatedProducts} />;
}

export default function WatchPage({ params }: PageProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#090909]">
        <Suspense fallback={<WatchDetailSkeleton />}>
          <WatchContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
