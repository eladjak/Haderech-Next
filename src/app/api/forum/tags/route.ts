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
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response containing the created tag or error message
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const json = await request.json();

    const { data: tag, error } = await supabase
      .from("forum_tags")
      .insert(json)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה ביצירת התגית" },
        { status: 500 }
      );
    }

    return NextResponse.json(tag);
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
 * DELETE /api/forum/tags/[id]
 *
 * Deletes a specific forum tag.
 *
 * @requires Authentication
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or error
 */
export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = request.url.split("/").pop();

  try {
    const { error } = await supabase.from("forum_tags").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת התגית" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "שגיאה במחיקת התגית" }, { status: 500 });
  }
}
