// Normalize the base URL: env vars set via dashboards/CLI sometimes carry a
// trailing newline or slash, which silently corrupts sitemap.xml, robots.txt
// and every JSON-LD @id built from it (caught live 2026-07-10: the robots.txt
// Sitemap line was split across a newline). Always trim + strip trailing slash.
const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://haderech.ohlove.co.il";

export const siteConfig = {
  url: rawAppUrl.trim().replace(/\/+$/, ""),
  name: "הדרך",
  nameEn: "HaDerech",
  description:
    "פלטפורמה ללמידה אונליין בעברית - קורסים, כלים ושיטות לבניית מערכות יחסים בריאות",
} as const;
