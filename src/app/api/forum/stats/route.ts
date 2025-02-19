/**
 * @file forum/stats/route.ts
 * @description API route for retrieving forum statistics. Provides endpoints for getting
 * various forum metrics like post counts, active users, trending tags, etc.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/database";
import type { ForumStats, ForumTag } from "@/types/forum";

/**
 * GET /api/forum/stats
 *
 * Retrieves forum statistics including post counts, active users, trending tags, etc.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the forum stats or error message
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // קבלת מספר הפוסטים הכולל
    const { data: postsCount, error: postsError } = await supabase
      .from("forum_posts")
      .select("id", { count: "exact" });

    if (postsError) {
      console.error("Error in GET /api/forum/stats (posts count):", postsError);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    // קבלת מספר התגובות הכולל
    const { data: commentsCount, error: commentsError } = await supabase
      .from("forum_comments")
      .select("id", { count: "exact" });

    if (commentsError) {
      console.error(
        "Error in GET /api/forum/stats (comments count):",
        commentsError
      );
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    // קבלת מספר הצפיות הכולל
    const { data: viewsCount, error: viewsError } = await supabase
      .from("forum_views")
      .select("id", { count: "exact" });

    if (viewsError) {
      console.error("Error in GET /api/forum/stats (views count):", viewsError);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    // קבלת מספר הלייקים הכולל
    const { data: likesCount, error: likesError } = await supabase
      .from("forum_likes")
      .select("id", { count: "exact" });

    if (likesError) {
      console.error("Error in GET /api/forum/stats (likes count):", likesError);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    // קבלת מספר המשתמשים הפעילים
    const { data: activeUsers, error: usersError } = await supabase
      .from("forum_posts")
      .select("author_id")
      .gte(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      )
      .limit(1000);

    if (usersError) {
      console.error(
        "Error in GET /api/forum/stats (active users):",
        usersError
      );
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    // קבלת מספר הפוסטים מהיום
    const { data: todayPosts, error: todayError } = await supabase
      .from("forum_posts")
      .select("id", { count: "exact" })
      .gte(
        "created_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );

    if (todayError) {
      console.error("Error in GET /api/forum/stats (today posts):", todayError);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    // קבלת התגיות הפופולריות
    const { data: tags, error: tagsError } = await supabase
      .from("forum_post_tags")
      .select(
        `
        tag:forum_tags (
          id,
          name,
          description,
          color
        )
      `
      )
      .limit(1000);

    if (tagsError) {
      console.error("Error in GET /api/forum/stats (tags):", tagsError);
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    // עיבוד התגיות
    const tagCounts = new Map<string, { tag: ForumTag; count: number }>();
    tags.forEach((post) => {
      if (post.tag) {
        const existingTag = tagCounts.get(post.tag.id);
        if (existingTag) {
          existingTag.count += 1;
        } else {
          tagCounts.set(post.tag.id, { tag: post.tag, count: 1 });
        }
      }
    });

    const trendingTags = Array.from(tagCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // קבלת התורמים המובילים
    const { data: contributors, error: contributorsError } = await supabase
      .from("forum_posts")
      .select(
        `
        author:users (
          id,
          name,
          username,
          full_name,
          avatar_url,
          image,
          role
        ),
        author_id,
        id
      `
      )
      .limit(1000);

    if (contributorsError) {
      console.error(
        "Error in GET /api/forum/stats (contributors):",
        contributorsError
      );
      return NextResponse.json({ error: "שגיאת מסד נתונים" }, { status: 500 });
    }

    // עיבוד התורמים
    const contributorCounts = new Map<string, { author: any; count: number }>();
    contributors.forEach((post) => {
      const current = contributorCounts.get(post.author_id) || {
        author: post.author,
        count: 0,
      };
      contributorCounts.set(post.author_id, {
        author: post.author,
        count: current.count + 1,
      });
    });

    const topContributors = Array.from(contributorCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ author, count }) => ({
        author,
        posts_count: count,
        likes_received: 0, // נצטרך להוסיף שאילתה נפרדת בשביל זה
      }));

    const stats: ForumStats = {
      total_posts: postsCount?.length || 0,
      total_comments: commentsCount?.length || 0,
      total_views: viewsCount?.length || 0,
      total_likes: likesCount?.length || 0,
      active_users: new Set(activeUsers?.map((u) => u.author_id)).size,
      posts_today: todayPosts?.length || 0,
      trending_tags: trendingTags,
      top_contributors: topContributors,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (_error) {
    console.error("Error in GET /api/forum/stats:", _error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
