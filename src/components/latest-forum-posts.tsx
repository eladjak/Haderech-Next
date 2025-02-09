"use client";

import { ForumPost } from "@/components/forum-post";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ForumPost as ForumPostType } from "@/types/api";

interface LatestForumPostsProps {
  posts: ForumPostType[];
  className?: string;
}

export function LatestForumPosts({ posts, className }: LatestForumPostsProps) {
  if (!posts.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>דיונים אחרונים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            אין דיונים להצגה
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>דיונים אחרונים</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {posts.map((post) => (
          <ForumPost
            key={post.id}
            post={post}
          />
        ))}
      </CardContent>
    </Card>
  );
}
