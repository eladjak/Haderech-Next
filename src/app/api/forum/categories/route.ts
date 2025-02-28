import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { _ForumCategory, Database } from "@/types";

("use client");

export {};

/**
 * @file forum/categories/route.ts
 * @description API routes for managing forum categories. Provides endpoints for retrieving,
 * creating, updating, and deleting categories. Includes authentication checks and validation.
 */

/**
 * GET /api/forum/categories
 *
 * Retrieves all forum categories.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the categories or error message
 */
export async function GET(_request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { data: categories, error } = await supabase
      .from("forum_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת הקטגוריות" },
        { status: 500 }
      );
    }

    return NextResponse.json(categories);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * POST /api/forum/categories
 *
 * Creates a new forum category.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created category or error message
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    // בדיקת הרשאות מנהל
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "נדרשות הרשאות מנהל" },
        { status: 403 }
      );
    }

    const json = await request.json();

    const { data: category, error } = await supabase
      .from("forum_categories")
      .insert(json)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה ביצירת הקטגוריה" },
        { status: 500 }
      );
    }

    return NextResponse.json(category);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * PUT /api/forum/categories/[id]
 *
 * Updates a specific forum category.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the updated category or error message
 */
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    // בדיקת הרשאות מנהל
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "נדרשות הרשאות מנהל" },
        { status: 403 }
      );
    }

    const json = await request.json();

    const { data: category, error } = await supabase
      .from("forum_categories")
      .update(json)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בעדכון הקטגוריה" },
        { status: 500 }
      );
    }

    return NextResponse.json(category);
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/categories/[id]
 *
 * Deletes a specific forum category.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or error
 */
export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    // בדיקת הרשאות מנהל
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "נדרשות הרשאות מנהל" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("forum_categories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת הקטגוריה" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
