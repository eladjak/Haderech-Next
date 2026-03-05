import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/student/"],
    },
    sitemap: "https://haderech.ohlove.co.il/sitemap.xml",
  };
}
