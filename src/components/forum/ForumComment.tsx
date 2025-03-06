"use client";

import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export interface ForumCommentProps {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  onReply?: () => void;
  onLike?: () => void;
  likesCount?: number;
  isLiked?: boolean;
}

export function ForumComment({
  content,
  author,
  createdAt,
  onReply,
  onLike,
  likesCount = 0,
  isLiked = false,
}: ForumCommentProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: he,
  });

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{author.name}</p>
                <p className="text-sm text-gray-500">{timeAgo}</p>
              </div>
            </div>
            <div className="mt-2">
              <p>{content}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={isLiked ? "text-blue-600" : ""}
        >
          {likesCount} לייקים
        </Button>
        {onReply && (
          <Button variant="outline" size="sm" onClick={onReply}>
            הגב
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
