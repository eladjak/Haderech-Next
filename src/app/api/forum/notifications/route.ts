import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "@/lib/utils";
import type { Database } from "@/types";

("use client");

export {};

/**
 * @file forum/notifications/route.ts
 * @description API routes for managing forum notifications. Provides endpoints for retrieving,
 * marking as read, and managing user notifications. Includes authentication checks and validation.
 */

/**
 * GET /api/forum/notifications
 *
 * Retrieves notifications for the current user.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the notifications or error message
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

    const { data: notifications, error } = await supabase
      .from("forum_notifications")
      .select(
        `
        *,
        post:forum_posts (
          id,
          title
        ),
        comment:forum_comments (
          id,
          content
        ),
        actor:users (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in GET /api/forum/notifications:", error);
      return NextResponse.json(
        { error: "שגיאה בטעינת ההתראות" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications });
  } catch (_error) {
    console.error("Error in GET /api/forum/notifications:", _error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * PATCH /api/forum/notifications
 *
 * Marks notifications as read.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or error
 */
export async function PATCH(request: NextRequest) {
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
    const { notification_ids } = json;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json(
        { error: "נדרשים מזהי התראות תקינים" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("forum_notifications")
      .update({ read: true })
      .in("id", notification_ids)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error in PATCH /api/forum/notifications:", error);
      return NextResponse.json(
        { error: "שגיאה בעדכון ההתראות" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error("Error in PATCH /api/forum/notifications:", _error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/notifications
 *
 * Deletes notifications for the current user.
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
    const { notification_ids } = json;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json(
        { error: "נדרשים מזהי התראות תקינים" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("forum_notifications")
      .delete()
      .in("id", notification_ids)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error in DELETE /api/forum/notifications:", error);
      return NextResponse.json(
        { error: "שגיאה במחיקת ההתראות" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error("Error in DELETE /api/forum/notifications:", _error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
