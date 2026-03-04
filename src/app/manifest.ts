import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "הדרך - אומנות הקשר",
    short_name: "הדרך",
    description: "פלטפורמה ללמידת דייטינג וזוגיות באונליין",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E85D75",
    dir: "rtl",
    lang: "he",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
