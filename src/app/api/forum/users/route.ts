import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "@/lib/utils";
import type { Database } from "@/types";
import type { _Author } from "@/types/forum";

("use client");

export {};

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
export async function GET(_request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const searchParams = _request.nextUrl.searchParams;
    const query = searchParams.get("query");

    let dbQuery = supabase
      .from("users")
      .select("id, full_name, avatar_url, role")
      .order("full_name", { ascending: true });

    if (query) {
      dbQuery = dbQuery.ilike("full_name", `%${query}%`);
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
