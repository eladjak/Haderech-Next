/**
 * Forum Comment Component
 *
 * A component for displaying individual forum comments with user information
 * and like functionality. Supports RTL and includes accessibility features.
 *
 * @example
 * ```tsx
 * <ForumComment
 *   comment={comment}
 *   isLiked={true}
 *   onLike={(id) => handleLike(id)}
 * />
 * ```
 */

"use client";

import { format } from "date-fns";
import { he } from "date-fns/locale";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ForumCommentProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  };
  className?: string;
}

export function ForumComment({ comment, className }: ForumCommentProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar>
          <AvatarImage
            src={comment.user.image}
            alt={comment.user.name}
          />
          <AvatarFallback>
            {comment.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base">{comment.user.name}</CardTitle>
          <CardDescription>
            {format(new Date(comment.createdAt), "dd בMMMM yyyy", {
              locale: he,
            })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {comment.content}
        </p>
      </CardContent>
    </Card>
  );
}
