/**
 * Forum Comment Component
 *
 * A component for displaying individual forum comments with user information
 * and interaction options.
 *
 * @example
 * ```tsx
 * <ForumComment
 *   comment={comment}
 *   onReply={(id) => handleReply(id)}
 * />
 * ```
 */

"use client";

import React from "react";

import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { MessageSquare } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ForumComment as ForumCommentType } from "@/types/forum";

export interface ForumCommentProps {
  comment: ForumCommentType;
  className?: string;
}

export function ForumComment({
  comment,
  className,
}: ForumCommentProps): React.ReactElement {
  const { content, author, created_at, replies = [] } = comment;

  const avatarUrl = author.avatar_url || undefined;

  const timeAgo = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
    locale: he,
  });

  return (
    <div className={cn("space-y-4", className)}>
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
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{author.name}</span>
            <span className="text-sm text-muted-foreground">
              לפני {timeAgo}
            </span>
          </div>
          <p className="mt-1 text-sm">{content}</p>
          <div className="mt-2 flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              aria-label={`תגובות (${replies.length})`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{replies.length}</span>
            </Button>
          </div>
        </div>
      </div>
      {replies.length > 0 && (
        <div className="mr-12 space-y-4">
          {replies.map((reply) => (
            <ForumComment key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
