/**
 * @file forum/views/route.ts
 * @description API routes for managing forum post views. Provides endpoints for tracking
 * and updating view counts for forum posts. Includes authentication checks and validation.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/database";

/**
 * POST /api/forum/views
 *
 * Creates or updates a view record for a post and increments the post's view count.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the view record or error message
 */
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const json = await request.json();
    const { post_id } = json;

    if (!post_id) {
      return NextResponse.json({ error: "נדרש מזהה פוסט" }, { status: 400 });
    }

    // בדיקה שהפוסט קיים
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("id", post_id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "הפוסט לא נמצא" }, { status: 404 });
    }

    // בדיקה אם המשתמש כבר צפה בפוסט
    const { data: existingView, error: _viewError } = await supabase
      .from("forum_views")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", post_id)
      .single();

    if (existingView) {
      // עדכון זמן הצפייה האחרון
      const { error: updateError } = await supabase
        .from("forum_views")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", existingView.id);

      if (updateError) {
        return NextResponse.json(
          { error: "שגיאה בעדכון הצפייה" },
          { status: 500 }
        );
      }

      return NextResponse.json({ view: existingView });
    }

    // יצירת צפייה חדשה
    const { data: view, error } = await supabase
      .from("forum_views")
      .insert([
        {
          user_id: user.id,
          post_id: post_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה ביצירת הצפייה" },
        { status: 500 }
      );
    }

    // עדכון מספר הצפיות בפוסט
    const { error: updateError } = await supabase
      .from("forum_posts")
      .update({ views: post.views + 1 })
      .eq("id", post_id);

    if (updateError) {
      return NextResponse.json(
        { error: "שגיאה בעדכון מספר הצפיות" },
        { status: 500 }
      );
    }

    return NextResponse.json({ view });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
