import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "@/lib/utils";
import type { Database } from "@/types";

("use client");

export {};

/**
 * @file forum/likes/route.ts
 * @description API routes for managing forum post likes. Provides endpoints for retrieving,
 * creating, and deleting likes. Includes authentication checks and validation.
 */

/**
 * GET /api/forum/likes
 *
 * Retrieves all likes for the current user.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the likes or error message
 */
export async function GET(_request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const { data: likes, error } = await supabase
      .from("forum_likes")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת הלייקים" },
        { status: 500 }
      );
    }

    return NextResponse.json({ likes });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * POST /api/forum/likes
 *
 * Creates a new like on a post.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created like or error message
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

    // בדיקה שהמשתמש לא כבר לייק את הפוסט
    const { data: existingLike, error: _likeError } = await supabase
      .from("forum_likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", post_id)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { error: "כבר סימנת לייק לפוסט זה" },
        { status: 400 }
      );
    }

    const { data: like, error } = await supabase
      .from("forum_likes")
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
        { error: "שגיאה ביצירת הלייק" },
        { status: 500 }
      );
    }

    // עדכון מספר הלייקים בפוסט
    const { error: updateError } = await supabase
      .from("forum_posts")
      .update({ likes: post.likes + 1 })
      .eq("id", post_id);

    if (updateError) {
      return NextResponse.json(
        { error: "שגיאה בעדכון הלייקים" },
        { status: 500 }
      );
    }

    return NextResponse.json({ like });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/likes
 *
 * Deletes a like from a post.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or error
 */
export async function DELETE(request: NextRequest) {
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

    const { error } = await supabase
      .from("forum_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", post_id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת הלייק" },
        { status: 500 }
      );
    }

    // עדכון מספר הלייקים בפוסט
    const { error: updateError } = await supabase
      .from("forum_posts")
      .update({ likes: Math.max(0, post.likes - 1) })
      .eq("id", post_id);

    if (updateError) {
      return NextResponse.json(
        { error: "שגיאה בעדכון הלייקים" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
