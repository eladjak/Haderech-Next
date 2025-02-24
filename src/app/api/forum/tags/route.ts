/**
 * @file forum/tags/route.ts
 * @description API routes for managing forum tags. Provides endpoints for retrieving,
 * creating, updating, and deleting tags. Includes authentication checks and validation.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/database";
import type { ForumTag } from "@/types/forum";

/**
 * GET /api/forum/tags
 *
 * Retrieves all forum tags.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the tags or error message
 */
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { data: tags, error } = await supabase
      .from("forum_tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת התגיות" },
        { status: 500 }
      );
    }

    return NextResponse.json(tags);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה בטעינת התגיות" }, { status: 500 });
  }
}

/**
 * POST /api/forum/tags
 *
 * Creates a new forum tag.
 *
 * @requires Authentication and Admin role
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created tag or error message
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // בדיקת הרשאות
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "אין לך הרשאה ליצור תגיות" },
        { status: 403 }
      );
    }

    const json = await request.json();

    // בדיקת שדות חובה
    if (!json.name || !json.description || !json.color) {
      return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
    }

    // בדיקה אם התגית כבר קיימת
    const { data: existingTag } = await supabase
      .from("forum_tags")
      .select("id")
      .eq("name", json.name)
      .single();

    if (existingTag) {
      return NextResponse.json(
        { error: "כבר קיימת תגית עם שם זה" },
        { status: 400 }
      );
    }

    // הוספת מזהה המשתמש שיצר את התגית
    const newTag = {
      ...json,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data: tag, error } = await supabase
      .from("forum_tags")
      .insert(newTag)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה ביצירת התגית" },
        { status: 500 }
      );
    }

    return NextResponse.json(tag, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה ביצירת התגית" }, { status: 500 });
  }
}

/**
 * PUT /api/forum/tags/[id]
 *
 * Updates a specific forum tag.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the updated tag or error message
 */
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const json = await request.json();

    const { data: tag, error } = await supabase
      .from("forum_tags")
      .update(json)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בעדכון התגית" },
        { status: 500 }
      );
    }

    return NextResponse.json(tag);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה בעדכון התגית" }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/tags
 *
 * Deletes a specific forum tag.
 *
 * @requires Authentication and Admin role
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or error
 */
export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // בדיקת הרשאות
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "נדרשת הזדהות" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "אין לך הרשאה למחוק תגיות" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { tag_id } = json;

    if (!tag_id) {
      return NextResponse.json({ error: "נדרש מזהה תגית" }, { status: 400 });
    }

    // בדיקה אם התגית קיימת
    const { data: existingTag } = await supabase
      .from("forum_tags")
      .select("id")
      .eq("id", tag_id)
      .single();

    if (!existingTag) {
      return NextResponse.json({ error: "התגית לא נמצאה" }, { status: 404 });
    }

    const { error } = await supabase
      .from("forum_tags")
      .delete()
      .eq("id", tag_id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת התגית" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "התגית נמחקה בהצלחה" });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה במחיקת התגית" }, { status: 500 });
  }
}
