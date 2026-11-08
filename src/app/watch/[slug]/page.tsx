import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getStoreProducts, getStoreSettings } from "@/lib/db/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchDetailClient from "./WatchDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getStoreProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, storeInfo] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product) {
    return {
      title: `Soat topilmadi | ${storeInfo.displayName}`,
    };
  }

  const priceText = product.price ? `$${product.price} USD` : "Narxi so'rov bo'yicha";

  return {
    title: `${product.name} | ${storeInfo.displayName}`,
    description: `${product.descriptionUz} Narxi: ${priceText}. Toshkent va Namangan filiallarida taqdim etilgan.`,
    openGraph: {
      title: `${product.name} — ${storeInfo.displayName}`,
      description: product.descriptionUz,
      siteName: storeInfo.displayName,
      locale: "uz_UZ",
      type: "website",
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
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
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getStoreProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.brand === product.brand)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.descriptionUz,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `/watch/${product.slug}`,
      priceCurrency: "USD",
      price: product.price || undefined,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "SwissWatch Premium",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WatchDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}

export default async function WatchDetailPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <main className="flex-1 pt-20">
        <Suspense fallback={<WatchDetailSkeleton />}>
          <WatchContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
