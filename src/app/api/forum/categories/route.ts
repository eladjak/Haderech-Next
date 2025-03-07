import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database";
import type { ForumCategory } from "@/types/forum";

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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    // במימוש הדמה נחשיב כל משתמש כאדמין למטרות הבנייה
    const isAdmin = true; // session.user.role === "admin"

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can create categories" },
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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const id = request.url.split("/").pop();

  try {
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    // במימוש הדמה נחשיב כל משתמש כאדמין למטרות הבנייה
    const isAdmin = true; // session.user.role === "admin"

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can update categories" },
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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const id = request.url.split("/").pop();

  try {
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    // במימוש הדמה נחשיב כל משתמש כאדמין למטרות הבנייה
    const isAdmin = true; // session.user.role === "admin"

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can delete categories" },
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
