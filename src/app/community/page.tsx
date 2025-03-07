import type { Metadata } from "next";
import React from "react";
import { Forum } from "@/components/forum/Forum";
import { mockPosts } from "@/lib/data/mock-posts";

const forumData = {
  posts: mockPosts,
  categories: [
    { id: "1", name: "כללי", count: 120 },
    { id: "2", name: "טיפים", count: 85 },
    { id: "3", name: "שאלות", count: 65 },
    { id: "4", name: "חדשות", count: 42 },
  ],
  tags: [
    { id: "1", name: "JavaScript" },
    { id: "2", name: "React" },
    { id: "3", name: "Next.js" },
    { id: "4", name: "TypeScript" },
  ],
  stats: {
    total_posts: 312,
    total_comments: 1840,
    total_users: 528,
  },
  top_contributors: [],
  trending_tags: [],
};

export const metadata: Metadata = {
  title: "קהילה",
  description: "הקהילה שלנו",
};

export default function CommunityPage() {
  const categoriesForForum = forumData.categories.map(({ id, name }) => ({
    id,
    name,
  }));

  return (
    <div className="container mx-auto py-8">
      <Forum
        posts={forumData.posts}
        categories={categoriesForForum}
        tags={forumData.tags}
      />
    </div>
  );
}
