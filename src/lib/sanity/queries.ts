export const blogPostsQuery = `*[_type == "blogPost"] | order(_createdAt desc) {
  _id, title, "slug": slug.current, excerpt, category, publishedAt, readTime, featured,
  "featuredImage": featuredImage.asset->url
}`;

export const blogPostBySlugQuery = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id, title, "slug": slug.current, excerpt, content, category, publishedAt, readTime, featured,
  "featuredImage": featuredImage.asset->url
}`;

export const blogCategoriesQuery = `*[_type == "blogPost"].category`;
