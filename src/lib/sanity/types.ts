export interface SanityBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  publishedAt?: string;
  readTime?: string;
  featured?: boolean;
  featuredImage?: string;
}
