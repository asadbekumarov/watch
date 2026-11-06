import { MetadataRoute } from "next";
import { productsData } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://alfajr.uz";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  const productPages: MetadataRoute.Sitemap = productsData.map((p) => ({
    url: `${baseUrl}/watch/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
