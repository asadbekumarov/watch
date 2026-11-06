import React from "react";
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
    description: `${product.description} Narxi: ${priceText}. Rasmiy COSC xronometr sertifikati va 5 yillik xalqaro kafolat bilan.`,
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

export default async function WatchPage({ params }: PageProps) {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = productsData
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#090909]">
        <WatchDetailClient product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </>
  );
}
