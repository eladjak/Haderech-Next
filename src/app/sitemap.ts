import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const staticPages = [
    "",
    "/about",
    "/courses",
    "/blog",
    "/pricing",
    "/faq",
    "/help",
    "/contact",
    "/chat",
    "/simulator",
    "/community",
    "/mentoring",
    "/tools",
    "/stories",
    "/search",
    "/course-safety",
  ];

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/courses" ? 0.9 : 0.7,
  }));
}
