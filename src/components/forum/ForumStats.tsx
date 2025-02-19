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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForumStats as ForumStatsType } from "@/types/forum";

export interface ForumStatsProps {
  stats: ForumStatsType;
  className?: string;
}

export function ForumStats({
  stats,
  className,
}: ForumStatsProps): React.ReactElement {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              משתמשים פעילים
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div
              className="text-2xl font-bold"
              data-testid="active-users"
              aria-label={`${stats.active_users} משתמשים פעילים`}
            >
              {stats.active_users}
            </div>
            <p className="text-xs text-muted-foreground">
              <span data-testid="posts-today">{stats.posts_today}</span> פוסטים
              היום
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              data-testid="total-posts-title"
            >
              סה״כ פוסטים
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div
              className="text-2xl font-bold"
              data-testid="total-posts"
              aria-label={`סך הכל ${stats.total_posts} פוסטים`}
            >
              {stats.total_posts}
            </div>
            <p className="text-xs text-muted-foreground">
              <span data-testid="total-comments">{stats.total_comments}</span>{" "}
              תגובות
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">צפיות</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div
              className="text-2xl font-bold"
              data-testid="total-views"
              aria-label={`סך הכל ${stats.total_views} צפיות`}
            >
              {stats.total_views}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.total_views / stats.total_posts)} צפיות לפוסט
              בממוצע
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לייקים</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div
              className="text-2xl font-bold"
              data-testid="total-likes"
              aria-label={`סך הכל ${stats.total_likes} לייקים`}
            >
              {stats.total_likes}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.total_likes / stats.total_posts)} לייקים לפוסט
              בממוצע
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              data-testid="trending-tags-title"
            >
              תגיות פופולריות
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex flex-wrap gap-2" data-testid="trending-tags">
              {stats.trending_tags.map(({ tag, count }) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag.name}
                  <span className="text-xs text-muted-foreground">
                    ({count})
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              data-testid="top-contributors-title"
            >
              תורמים מובילים
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4" data-testid="top-contributors">
              {stats.top_contributors.map(
                ({ author, posts_count, likes_received }) => (
                  <div
                    key={author.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{author.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{posts_count} פוסטים</span>
                      <span>{likes_received} לייקים</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
