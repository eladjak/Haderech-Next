import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Get comments for a post
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const { data: comments, error } = await supabase
      .from("comments")
      .select("*, user:users(id, name, avatar_url)")
      .eq("post_id", params.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 },
      );
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error in GET /api/community/[id]/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Add a new comment
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { content } = await req.json();
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: params.id,
        user_id: session.user.id,
        content,
        created_at: new Date().toISOString(),
      })
      .select("*, user:users(id, name, avatar_url)")
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return NextResponse.json(
        { error: "Failed to add comment" },
        { status: 500 },
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error in POST /api/community/[id]/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
