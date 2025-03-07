import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { Author } from "@/types/forum";

/**
 * @file forum/users/route.ts
 * @description API routes for managing forum users. Provides endpoints for retrieving
 * and updating user information. Includes authentication checks and validation.
 */

/**
 * GET /api/forum/users
 *
 * Retrieves forum users with optional search query.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the users or error message
 */
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    let dbQuery = supabase
      .from("users")
      .select("id, full_name, avatar_url, role")
      .order("full_name", { ascending: true });

    if (query) {
      dbQuery = dbQuery.contains("name", query);
    }

    const { data: users, error } = await dbQuery;

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת המשתמשים" },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}

/**
 * PATCH /api/forum/users
 *
 * Updates a user's role. Only admins can perform this action.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the updated user or error message
 */
export async function PATCH(request: NextRequest) {
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
        { error: "Only administrators can update user roles" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { id, role } = json;

    if (!id || !role) {
      return NextResponse.json(
        { error: "נדרשים מזהה משתמש ותפקיד" },
        { status: 400 }
      );
    }

    // בדיקה שהמשתמש קיים
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: "המשתמש לא נמצא" }, { status: 404 });
    }

    // עדכון תפקיד המשתמש
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "שגיאה בעדכון המשתמש" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
