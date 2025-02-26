import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

/**
 * @file forum/views/route.ts
 * @description API routes for managing forum post views. Provides endpoints for tracking
 * and updating view counts for forum posts. Includes authentication checks and validation.
 */

/**
 * POST /api/forum/views
 *
 * Creates or updates a view record for a post and increments the post's view count.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the view record or error message
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const json = await request.json();
    const { post_id, ip_address, user_agent } = json;

    if (!post_id || !ip_address || !user_agent) {
      return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
    }

    // בדיקה שהפוסט קיים
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("id, views")
      .eq("id", post_id)
      .single();

    if (postError || !post) {
      console.error("Post error:", postError);
      return NextResponse.json({ error: "הפוסט לא נמצא" }, { status: 404 });
    }

    // קבלת המשתמש הנוכחי (אם מחובר)
    const {
      data: { session },
      error: _authError,
    } = await supabase.auth.getSession();

    // יצירת רשומת צפייה חדשה
    const viewData = {
      post_id,
      user_id: session?.user?.id,
      ip_address,
      user_agent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: view, error: viewError } = await supabase
      .from("forum_views")
      .insert([viewData])
      .select()
      .single();

    if (viewError) {
      console.error("View error:", viewError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: viewError.message },
        { status: 500 }
      );
    }

    // עדכון מספר הצפיות בפוסט
    const { error: updateError } = await supabase
      .from("forum_posts")
      .update({
        views: (post.views || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "שגיאת מסד נתונים", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(view, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "שגיאת שרת פנימית",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
