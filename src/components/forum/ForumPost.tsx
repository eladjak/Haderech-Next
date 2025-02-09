/**
 * Forum Post Component
 *
 * A comprehensive component for displaying forum posts with rich interactions.
 * Supports likes, comments, saves, and sharing functionality.
 *
 * @example
 * ```tsx
 * <ForumPost
 *   post={post}
 *   showFullContent
 *   onLike={(id) => handleLike(id)}
 *   onSave={(id) => handleSave(id)}
 *   onShare={(id) => handleShare(id)}
 *   isLiked={true}
 *   isSaved={false}
 * />
 * ```
 */

"use client";

import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { MessageCircle, ThumbsUp } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ForumPost as ForumPostType } from "@/types/forum";

interface ForumPostProps {
  post: ForumPostType;
  className?: string;
}

export function ForumPost({
  post,
  className,
}: ForumPostProps): React.ReactElement {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage
            src={post.author.avatar_url || ""}
            alt={post.author.name}
          />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Link
            href={`/forum/${post.id}`}
            className="text-lg font-semibold hover:underline"
          >
            {post.title}
          </Link>
          <p className="text-sm text-muted-foreground">
            {post.author.name} •{" "}
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: he,
            })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ThumbsUp className="h-4 w-4" />
          {post.likes_count || 0}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {post.replies_count}
        </Button>
      </CardFooter>
    </Card>
  );
}
