import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://haderech.ohlove.co.il";

  const staticPages = [
    "",
    "/courses",
    "/blog",
    "/pricing",
    "/faq",
    "/contact",
    "/chat",
    "/simulator",
    "/community",
    "/mentoring",
    "/tools",
    "/stories",
    "/search",
  ];

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/courses" ? 0.9 : 0.7,
  }));
}
