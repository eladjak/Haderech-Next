"use client";

import { MessageSquare, ThumbsUp, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { ForumComment } from "@/types/forum";

interface ForumCommentProps {
  comment: ForumComment;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  className?: string;
}

export function ForumComment({
  comment,
  onLike,
  onReply,
  className,
}: ForumCommentProps) {
  const formattedDate = new Date(comment.created_at).toLocaleDateString(
    "he-IL",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <Card className={`mb-4 ${className || ""}`}>
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage
            src={comment.author.avatar_url || comment.author.image}
            alt={comment.author.name}
          />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{comment.author.name}</div>
          <div className="text-sm text-gray-500">{formattedDate}</div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">{comment.content}</CardContent>
      <CardFooter className="p-4 pt-0">
        {onLike && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onLike(comment.id)}
          >
            <ThumbsUp
              className={`h-4 w-4 ${
                (comment.likes ?? 0) > 0 ? "fill-primary text-primary" : ""
              }`}
            />
            <span>{comment.likes ?? 0}</span>
          </Button>
        )}
        {onReply && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onReply(comment.id)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>תגובה</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
