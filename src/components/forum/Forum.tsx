/**
 * Forum Component
 *
 * A comprehensive forum component that displays posts and allows for post creation.
 * Includes loading states and error handling.
 *
 * @example
 * ```tsx
 * <Forum posts={posts} isLoading={false} />
 * ```
 */

"use client";

// React and external dependencies
import { useMemo } from "react";

import { ForumFilters } from "@/components/forum/ForumFilters";
// Components
import { ForumPost } from "@/components/forum/ForumPost";
import { ForumStats } from "@/components/forum/ForumStats";
// Utils
import { cn } from "@/lib/utils";
// Types
import type {
  ForumFilters as ForumFiltersType,
  ForumPost as ForumPostType,
  ForumStats as ForumStatsType,
} from "@/types/forum";

import { CreatePost } from "./CreatePost";

export interface ForumProps {
  posts: ForumPostType[];
  stats: ForumStatsType;
  onFilter?: (filters: ForumFiltersType) => void;
  className?: string;
}

export function Forum({
  posts,
  stats,
  onFilter,
  className,
}: ForumProps): React.ReactElement {
  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts]);

  const handleFilter = (filters: ForumFiltersType) => {
    if (onFilter) {
      onFilter(filters);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <div className="w-full md:w-3/4">
          <div className="mb-4">
            <CreatePost />
          </div>
          <ForumFilters onFilter={handleFilter} />
          <div className="mt-8 space-y-4">
            {sortedPosts.map((post: ForumPostType) => (
              <ForumPost key={post.id} post={post} />
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/4">
          <ForumStats stats={stats} />
        </div>
      </div>
    </div>
  );
}

function _PostSkeleton() {
  return (
    <div
      className="animate-pulse space-y-4"
      data-testid="post-skeleton"
      role="presentation"
    >
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-[250px] rounded-md bg-muted" />
          <div className="h-4 w-[200px] rounded-md bg-muted" />
        </div>
      </div>
      <div className="h-20 rounded-md bg-muted" />
    </div>
  );
}
