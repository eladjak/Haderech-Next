"use client";

import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export interface ForumPostProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  category?: string;
  createdAt: string;
  commentsCount?: number;
  likesCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  post?: any; // אופציונלי, לתמיכה בשימושים קיימים
}

export function ForumPost({
  id,
  title,
  content,
  author,
  category,
  createdAt,
  commentsCount = 0,
  likesCount = 0,
  isLiked = false,
  onLike,
  isBookmarked = false,
  onBookmark,
  post,
}: ForumPostProps) {
  // תמיכה בפורמט הישן וגם בפורמט החדש שמעביר post שלם
  const postId = post?.id || id;
  const postTitle = post?.title || title;
  const postContent = post?.content || content;
  const postAuthor = post?.author || author;
  const postCategory = post?.category?.name || post?.category || category;
  const postCreatedAt = post?.created_at || createdAt;
  const postCommentsCount = post?.comments_count || commentsCount;
  const postLikesCount = post?.likes || likesCount;

  const timeAgo = formatDistanceToNow(new Date(postCreatedAt), {
    addSuffix: true,
    locale: he,
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={postAuthor.avatar} alt={postAuthor.name} />
              <AvatarFallback>{postAuthor.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/community/${postId}`} passHref>
                <h3 className="text-xl font-bold hover:text-primary hover:underline">
                  {postTitle}
                </h3>
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{postAuthor.name}</span>
                <span className="text-xs">•</span>
                <span>{timeAgo}</span>
                {postCategory && (
                  <>
                    <span className="text-xs">•</span>
                    <Badge variant="outline" className="px-2 py-0 text-xs">
                      {postCategory}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="line-clamp-3">{postContent}</p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t px-6 py-3">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            className={isLiked ? "text-primary" : ""}
            onClick={onLike}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {postLikesCount}
          </Button>
          <Link href={`/community/${postId}`} passHref>
            <Button variant="ghost" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {postCommentsCount}
            </Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={isBookmarked ? "text-primary" : ""}
          onClick={onBookmark}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
}
