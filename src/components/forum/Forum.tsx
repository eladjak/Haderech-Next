/**
 * Forum Component
 *
 * The main forum component that displays a list of posts with search functionality
 * and post creation. Manages post interactions like likes, saves, and sharing.
 *
 * Features:
 * - Search posts by title, content, or tags
 * - Create new posts
 * - Like, save, and share posts
 * - Responsive design
 * - RTL support
 *
 * @example
 * ```tsx
 * <Forum
 *   posts={posts}
 *   onCreatePost={handleCreate}
 *   onLikePost={handleLike}
 *   onSavePost={handleSave}
 *   onSharePost={handleShare}
 *   savedPosts={userSavedPosts}
 *   likedPosts={userLikedPosts}
 * />
 * ```
 */

"use client";

import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CreatePost } from "./CreatePost";
import { ForumPost } from "@/components/forum/ForumPost";
import { useToast } from "@/components/ui/use-toast";
import type { ForumPost as ForumPostType } from "@/types/forum";
import { Skeleton } from "@/components/ui/skeleton";

interface ForumProps {
  /** רשימת הפוסטים */
  posts: Array<{
    id: string;
    title: string;
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
    _count: {
      comments: number;
    };
  }>;
  /** האם בטעינה */
  isLoading?: boolean;
  /** פונקציה ליצירת פוסט חדש */
  onCreatePost?: (post: {
    title: string;
    content: string;
    tags: string[];
  }) => Promise<void>;
  className?: string;
}

export function Forum(): React.ReactElement {
  const [posts, setPosts] = useState<ForumPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/forum");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "שגיאה",
          description: "לא הצלחנו לטעון את הפוסטים. אנא נסה שוב מאוחר יותר.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void fetchPosts();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-4"
          >
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-20" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          עדיין אין פוסטים בפורום. היה הראשון ליצור פוסט!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <ForumPost
          key={post.id}
          post={post}
        />
      ))}
    </div>
  );
}
