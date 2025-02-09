"use client";

import { MessageSquare, ThumbsUp, User } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import type { ForumPost } from "@/types/api";

interface ForumPostProps {
  post: ForumPost;
  onLike?: (postId: string) => void;
  className?: string;
}

export function ForumPost({ post, onLike, className }: ForumPostProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback>
              {post.author?.name?.[0] ?? <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link
              href={`/community/${post.id}`}
              className="font-semibold hover:underline"
            >
              {post.title}
            </Link>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <span>{post.author?.name ?? "משתמש אנונימי"}</span>
              <span>•</span>
              <span>
                {new Date("2024-01-01T00:00:00.000Z").toLocaleDateString(
                  "he-IL",
                )}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{post.content}</div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-4">
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => onLike(post.id)}
            >
              <ThumbsUp
                className={`h-4 w-4 ${
                  post.likes > 0 ? "fill-primary text-primary" : ""
                }`}
              />
              <span>{post.likes}</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            asChild
          >
            <Link href={`/community/${post.id}`}>
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments?.length || 0}</span>
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
