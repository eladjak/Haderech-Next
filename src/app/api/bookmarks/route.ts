/**
 * @file bookmarks/route.ts
 * @description API endpoints for managing user bookmarks
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { Database } from "@/types/supabase";

/**
 * GET handler for retrieving user bookmarks
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: session } = await supabase.auth.getSession();

    if (!session.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.user.id;
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching bookmarks:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in bookmarks GET:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new bookmark
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: session } = await supabase.auth.getSession();

    if (!session.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.user.id;
    const body = await request.json();

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error("Error creating bookmark:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in bookmarks POST:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a bookmark
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: session } = await supabase.auth.getSession();

    if (!session.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.user.id;
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get("id");

    if (!bookmarkId) {
      return NextResponse.json(
        { error: "Bookmark ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting bookmark:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bookmarks DELETE:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
