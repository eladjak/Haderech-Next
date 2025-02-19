/**
 * @file forum/bookmarks/route.ts
 * @description API routes for managing forum post bookmarks. Provides endpoints for retrieving,
 * creating, and deleting bookmarks. Includes authentication checks and validation.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/database";

/**
 * GET /api/forum/bookmarks
 *
 * Retrieves all bookmarks for the current user.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the bookmarks or error message
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

    const { data: bookmarks, error } = await supabase
      .from("forum_bookmarks")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת המועדפים" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookmarks });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * POST /api/forum/bookmarks
 *
 * Creates a new bookmark for a post.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created bookmark or error message
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

    // בדיקה שהמשתמש לא כבר סימן את הפוסט
    const { data: existingBookmark, error: _bookmarkError } = await supabase
      .from("forum_bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", post_id)
      .single();

    if (existingBookmark) {
      return NextResponse.json(
        { error: "הפוסט כבר נמצא במועדפים" },
        { status: 400 }
      );
    }

    const { data: bookmark, error } = await supabase
      .from("forum_bookmarks")
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
        { error: "שגיאה בהוספה למועדפים" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookmark });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/bookmarks
 *
 * Deletes a bookmark from a post.
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

    const { error } = await supabase
      .from("forum_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", post_id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בהסרה מהמועדפים" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
