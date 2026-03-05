import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "הדרך - אומנות הקשר",
    short_name: "הדרך",
    description: "תוכנית 12 שבועות לזוגיות - אומנות הקשר",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1E3A5F",
    dir: "rtl",
    lang: "he",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/images/haderech-icon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/images/haderech-logo-square.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
    categories: ["education", "lifestyle"],
  };
}
