import { MetadataRoute } from "next";

// Block all web crawlers from indexing this demo pitch site
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
