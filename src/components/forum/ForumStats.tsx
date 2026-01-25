import React from "react";
import {
  Award,
  Eye,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ForumStats as ForumStatsType } from "@/types/forum";

interface ForumStatsProps {
  stats: ForumStatsType;
  className?: string;
}

const defaultStats: ForumStatsType = {
  active_users: 0,
  posts_today: 0,
  total_posts: 0,
  total_comments: 0,
  total_views: 0,
  total_likes: 0,
  total_users: 0,
  total_solved: 0,
  trending_tags: [],
  popular_tags: [],
  top_contributors: [],
};

export function ForumStats({
  stats = defaultStats,
  className,
}: ForumStatsProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>סטטיסטיקות פורום</CardTitle>
        <CardDescription>נתונים כלליים על הפעילות בפורום</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">סה&quot;כ פוסטים</p>
            <p className="text-2xl font-bold">{stats.total_posts}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">סה&quot;כ תגובות</p>
            <p className="text-2xl font-bold">{stats.total_comments}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">סה&quot;כ משתמשים</p>
            <p className="text-2xl font-bold">{stats.total_users}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">פוסטים שנפתרו</p>
            <p className="text-2xl font-bold">{stats.total_solved}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">סה&quot;כ צפיות</p>
            <p className="text-2xl font-bold">{stats.total_views}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">סה&quot;כ לייקים</p>
            <p className="text-2xl font-bold">{stats.total_likes}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">משתמשים פעילים</p>
            <p className="text-2xl font-bold">{stats.active_users}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">פוסטים היום</p>
            <p className="text-2xl font-bold">{stats.posts_today}</p>
          </div>
        </div>

        {/* Popular Tags */}
        {stats.popular_tags && stats.popular_tags.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold">תגיות פופולריות</h3>
            <div className="flex flex-wrap gap-2">
              {stats.popular_tags.map(({ tag, count }) => (
                <div
                  key={tag.id}
                  className="rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {tag.name} ({count})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tags */}
        {stats.trending_tags && stats.trending_tags.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold">תגיות במגמת עלייה</h3>
            <div className="flex flex-wrap gap-2">
              {stats.trending_tags.map(({ tag, count }) => (
                <div
                  key={tag.id}
                  className="rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {tag.name} ({count})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Contributors */}
        {stats.top_contributors && stats.top_contributors.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold">תורמים מובילים</h3>
            <div className="space-y-2">
              {stats.top_contributors.map((contributor) => (
                <div
                  key={contributor.id}
                  className="flex items-center justify-between rounded-lg bg-muted p-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{contributor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contributor.posts_count} פוסטים,{" "}
                        {contributor.likes_received} לייקים
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
