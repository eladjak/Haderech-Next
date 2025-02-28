import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "@/lib/utils";
import type { Database, ForumStats } from "@/types";
import type { ForumPost, ForumTag } from "@/types/forum";

("use client");

export {};

/**
 * @file forum/stats/route.ts
 * @description API route for retrieving forum statistics. Provides endpoints for getting
 * various forum metrics like post counts, active users, trending tags, etc.
 */

/**
 * GET /api/forum/stats
 *
 * Retrieves forum statistics including post counts, active users, trending tags, etc.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the forum stats or error message
 */
export async function GET(_request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // Get total posts
    const { data: postsData, error: postsError } = await supabase
      .from("forum_posts")
      .select("*");

    if (postsError) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    // Get total comments
    const { data: commentsData, error: commentsError } = await supabase
      .from("forum_comments")
      .select("*");

    if (commentsError) {
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Get total users
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*");

    if (usersError) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Get total views
    const totalViews = postsData.reduce(
      (acc: number, post: ForumPost) => acc + post.views,
      0
    );

    // Get total likes
    const totalLikes = postsData.reduce(
      (acc: number, post: ForumPost) => acc + post.likes,
      0
    );

    // Get total solved posts
    const totalSolved = postsData.filter(
      (post: ForumPost) => post.solved
    ).length;

    // Get active users (users who posted in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = new Set(
      postsData
        .filter((post: ForumPost) => new Date(post.created_at) > thirtyDaysAgo)
        .map((post: ForumPost) => post.author_id)
    ).size;

    // Get posts created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const postsToday = postsData.filter(
      (post: ForumPost) => new Date(post.created_at) > today
    ).length;

    // Get trending tags
    const tagCounts = new Map<string, { tag: ForumTag; count: number }>();

    postsData.forEach((post: ForumPost) => {
      if (post.tags && post.tags.length > 0) {
        const existingTag = tagCounts.get(post.tags[0].id);
        if (existingTag) {
          existingTag.count++;
        } else {
          tagCounts.set(post.tags[0].id, { tag: post.tags[0], count: 1 });
        }
      }
    });

    const trendingTags = Array.from(tagCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get popular tags (all-time)
    const popularTags = Array.from(tagCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top contributors
    const userPostCounts = new Map<string, number>();
    const userLikesReceived = new Map<string, number>();

    postsData.forEach((post: ForumPost) => {
      const postCount = userPostCounts.get(post.author_id) || 0;
      userPostCounts.set(post.author_id, postCount + 1);

      const likesReceived = userLikesReceived.get(post.author_id) || 0;
      userLikesReceived.set(post.author_id, likesReceived + post.likes);
    });

    const topContributors = await Promise.all(
      Array.from(userPostCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(async ([userId, posts_count]) => {
          const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

          return {
            author: user,
            posts_count,
            likes_received: userLikesReceived.get(userId) || 0,
          };
        })
    );

    const stats: ForumStats = {
      total_posts: postsData.length,
      total_comments: commentsData.length,
      total_users: usersData.length,
      total_views: totalViews,
      total_likes: totalLikes,
      total_solved: totalSolved,
      active_users: activeUsers,
      posts_today: postsToday,
      trending_tags: trendingTags,
      popular_tags: popularTags,
      top_contributors: topContributors.map((contributor) => ({
        ...contributor.author,
        posts_count: contributor.posts_count,
        likes_received: contributor.likes_received,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching forum stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch forum stats" },
      { status: 500 }
    );
  }
}
