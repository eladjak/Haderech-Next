import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { id } = params;

    const { data: comment, error } = await supabase
      .from("forum_comments")
      .select(
        `
        *,
        author:users(*),
        post:forum_posts(*),
        parent:forum_comments(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת התגובה" },
        { status: 500 }
      );
    }

    if (!comment) {
      return NextResponse.json({ error: "התגובה לא נמצאה" }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בטעינת התגובה" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

  try {
    const json = await request.json();
    const { id } = params;

    const { data: comment, error } = await supabase
      .from("forum_comments")
      .update(json)
      .eq("id", id)
      .select(
        `
        *,
        author:users(*),
        post:forum_posts(*),
        parent:forum_comments(*)
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בעדכון התגובה" },
        { status: 500 }
      );
    }

    if (!comment) {
      return NextResponse.json({ error: "התגובה לא נמצאה" }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בעדכון התגובה" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

  try {
    const { id } = params;

    const { error } = await supabase
      .from("forum_comments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת התגובה" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "התגובה נמחקה בהצלחה" });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה במחיקת התגובה" }, { status: 500 });
  }
}
