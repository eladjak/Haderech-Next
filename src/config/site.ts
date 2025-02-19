export const siteConfig = {
  name: "HaDerech",
  description: "פלטפורמת למידה מתקדמת לפיתוח תוכנה",
  url: process.env["NEXT_PUBLIC_SITE_URL"] as string,
  ogImage: "https://ui.shadcn.com/og.jpg",
  links: {
    twitter: "https://twitter.com/haderech",
    github: "https://github.com/haderech",
  },
  creator: "צוות הדרך",
};

export type SiteConfig = typeof siteConfig;
