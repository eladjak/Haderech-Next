import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "types/database";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, apiRateLimits } from "@/lib/middleware/rate-limit";

export {};

/**
 * @file route.ts
 * @description API route handlers for user notifications with rate limiting
 */

// Cache configuration: Dynamic content - no cache
// Notifications are user-specific and must always be fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limiters
const getNotificationsLimiter = rateLimit(apiRateLimits.standard);
const createNotificationLimiter = rateLimit(apiRateLimits.strict);
const updateNotificationLimiter = rateLimit(apiRateLimits.strict);
const deleteNotificationLimiter = rateLimit(apiRateLimits.strict);

/**
 * GET handler for retrieving user notifications
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = await getNotificationsLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new notification
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await createNotificationLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = await request.json();

    const { error } = await supabase.from("notifications").insert([
      {
        ...notification,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Notification created successfully" });
  } catch (error) {
    console.error("Notifications POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating notification status (e.g., marking as read)
 */
export async function PATCH(request: NextRequest) {
  const rateLimitResponse = await updateNotificationLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { id } = json;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // בדיקה שההתראה קיימת ושייכת למשתמש
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (notificationError || !notification) {
      return NextResponse.json(
        { error: "Notification not found or unauthorized" },
        { status: 404 }
      );
    }

    // סימון ההתראה כנקראה
    const { data: updatedNotification, error: updateError } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimitResponse = await deleteNotificationLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { id } = json;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // בדיקה שההתראה קיימת ושייכת למשתמש
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (notificationError || !notification) {
      return NextResponse.json(
        { error: "Notification not found or unauthorized" },
        { status: 404 }
      );
    }

    // מחיקת ההתראה
    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
