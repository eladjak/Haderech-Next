import { Forum } from "@/components/forum/Forum";
import { mockPosts } from "@/constants/forum";
import type { ForumStats } from "@/types/forum";

import type { Metadata } from "next";

const mockStats: ForumStats = {
  total_posts: 100,
  total_comments: 500,
  total_users: 50,
  total_solved: 30,
  total_views: 1000,
  total_likes: 200,
  active_users: 20,
  posts_today: 5,
  popular_tags: [],
  top_contributors: [],
  trending_tags: [],
};

export const metadata: Metadata = {
  title: "קהילה",
  description: "הקהילה שלנו",
};

export default function CommunityPage() {
  return <Forum posts={mockPosts} stats={mockStats} />;
}
