import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productsData } from "@/data/products";
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
      title: "Soat topilmadi | Vaqt Saroyi",
    };
  }

  const priceText = product.priceHidden
    ? "Narxini so'rang"
    : `${product.price.toLocaleString("ru-RU")} so'm`;

  return {
    title: `${product.brand} ${product.model} | Vaqt Saroyi`,
    description: `${product.description} Narxi: ${priceText}. 24 oylik kafolat, Toshkent bo'ylab bepul yetkazib berish.`,
    openGraph: {
      title: `${product.brand} ${product.model} — Original Qo'l Soati`,
      description: product.description,
      url: `https://vaqtsaroyi.uz/watch/${product.slug}`,
      siteName: "Vaqt Saroyi",
      locale: "uz_UZ",
      type: "website",
      images: [
        {
          url: product.images[0],
          width: 1200,
          height: 1200,
          alt: `${product.brand} ${product.model}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.brand} ${product.model}`,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default async function WatchPage({ params }: PageProps) {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Related watches: same brand or similar price (up to 4, excluding current)
  const relatedProducts = productsData
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      if (a.brand === product.brand && b.brand !== product.brand) return -1;
      if (b.brand === product.brand && a.brand !== product.brand) return 1;
      return Math.abs(a.price - product.price) - Math.abs(b.price - product.price);
    })
    .slice(0, 4);

  // Schema.org Product JSON-LD (Don't mark priceHidden products with a price in the schema)
  const availabilitySchema =
    product.stock === "in_stock"
      ? "https://schema.org/InStock"
      : product.stock === "on_order"
      ? "https://schema.org/PreOrder"
      : "https://schema.org/OutOfStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.model}`,
    image: `https://vaqtsaroyi.uz${product.images[0]}`,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      availability: availabilitySchema,
      priceCurrency: "UZS",
      ...(product.priceHidden ? {} : { price: product.price }),
      url: `https://vaqtsaroyi.uz/watch/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-[#090909]">
        <WatchDetailClient product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </>
  );
}
