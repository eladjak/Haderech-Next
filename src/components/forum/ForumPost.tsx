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

"use client";

import React from "react";

import Link from "next/link";

import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { MessageSquare, ThumbsUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ForumPost as ForumPostType } from "@/types/forum";

export interface ForumPostProps {
  post: ForumPostType;
  className?: string;
}

export function ForumPost({
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
  } = post;

  const avatarUrl = author.avatar_url || undefined;

  const timeAgo = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
    locale: he,
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage
              src={avatarUrl}
              alt={`תמונת הפרופיל של ${author.name}`}
            />
            <AvatarFallback aria-label={`תמונת הפרופיל של ${author.name}`}>
              {author.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/community/${id}`}
              className="font-semibold hover:underline"
              id={`post-title-${id}`}
              data-testid={`post-link-${id}`}
            >
              {title}
            </Link>
            <div className="text-sm text-muted-foreground">
              נכתב על ידי {author.name} לפני {timeAgo}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm">{content}</div>

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
}
