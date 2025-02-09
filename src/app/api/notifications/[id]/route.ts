/**
 * @file notifications/[id]/route.ts
 * @description API routes for managing individual notifications. Provides endpoints for
 * marking notifications as read and deleting notifications. Includes authentication and
 * authorization checks.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase-server";

import type { Database } from "@/types/supabase";

type Tables = Database["public"]["Tables"];
type Notification = Tables["notifications"]["Row"];
type User = Tables["users"]["Row"];

interface RouteParams {
  params: {
    id: string;
  };
}

interface NotificationWithUser extends Notification {
  user: User;
}

/**
 * PATCH /api/notifications/[id]
 *
 * Marks a notification as read.
 *
 * @requires Authentication & Authorization (Notification Owner)
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the notification ID
 * @returns {Promise<NextResponse>} JSON response containing the updated notification or error message
 */
export async function PATCH(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get notification to verify ownership
    const { data: notification } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    // Verify notification ownership
    if (notification.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this notification" },
        { status: 403 },
      );
    }

    // Mark notification as read
    const { data: updatedNotification, error } = await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(
        `
        *,
        user:users(*)
      `,
      )
      .single();

    if (error) {
      console.error("Error updating notification:", error);
      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedNotification as NotificationWithUser);
  } catch (error) {
    console.error("Error in PATCH /api/notifications/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 *
 * Deletes a notification.
 *
 * @requires Authentication & Authorization (Notification Owner)
 *
 * @param {Request} _ - The request object (unused)
 * @param {RouteParams} params - Route parameters containing the notification ID
 * @returns {Promise<NextResponse>} JSON response indicating success or error message
 */
export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get notification to verify ownership
    const { data: notification } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    // Verify notification ownership
    if (notification.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this notification" },
        { status: 403 },
      );
    }

    // Delete notification
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting notification:", error);
      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/notifications/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
