"use client";

import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { MessageSquare, ThumbsUp } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ForumPost as ForumPostType } from "@/types/forum";

/**
 * Forum Post Component
 *
 * A comprehensive component for displaying forum posts with rich interactions.
 * Supports comments and sharing functionality.
 *
 * @example
 * ```tsx
 * <ForumPost
 *   post={post}
 *   showFullContent
 *   onShare={(id) => handleShare(id)}
 * />
 * ```
 */

export interface ForumPostProps {
  post: ForumPostType;
  className?: string;
}

export const ForumPost = React.memo(function ForumPost({
  post,
  className,
}: ForumPostProps): React.ReactElement {
  const {
    id,
    title,
    content,
    author,
    created_at,
    likes = 0,
    comments = [],
    category,
    tags = [],
  } = post;

  const avatarUrl = author?.image || author?.avatar_url;
  const authorName = author?.name || "משתמש אנונימי";
  const authorInitial =
    author?.name?.[0] || author?.role?.[0]?.toUpperCase() || "מ";

  const timeAgo = formatDistanceToNow(new Date(created_at || new Date()), {
    addSuffix: true,
    locale: he,
  });

  return (
    <div
      className={cn("space-y-4", className)}
      role="article"
      aria-labelledby={`post-title-${id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage
              src={avatarUrl}
              alt={`תמונת הפרופיל של ${authorName}`}
            />
            <AvatarFallback
              aria-label={`תמונת הפרופיל של ${authorName}`}
              role="img"
            >
              {authorInitial}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/forum/post/${id}`}
              className="font-semibold hover:underline"
              id={`post-title-${id}`}
              data-testid={`post-link-${id}`}
              aria-label={`פוסט: ${title}`}
            >
              {title}
            </Link>
            <div className="text-sm text-muted-foreground">
              נכתב על ידי {authorName} לפני {timeAgo}
            </div>
            {category && (
              <div className="mt-1 text-sm text-muted-foreground">
                קטגוריה: {category.name}
              </div>
            )}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm" aria-label={`תוכן הפוסט: ${content}`}>
        {content}
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
          aria-label={`לייקים (${likes})`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
          aria-label={`תגובות (${comments.length})`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{comments.length}</span>
        </Button>
      </div>
    </div>
  );
});
