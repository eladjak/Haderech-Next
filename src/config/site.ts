export const siteConfig = {
  name: 'הדרך',
  description: 'פלטפורמת למידה חדשנית לשיפור מערכות יחסים',
  url: process.env.NEXT_PUBLIC_SITE_URL as string,
  ogImage: 'https://haderech.co.il/og.jpg',
  links: {
    twitter: 'https://twitter.com/haderech',
    github: 'https://github.com/haderech',
  },
  creator: 'צוות הדרך',
}

export type SiteConfig = typeof siteConfig 