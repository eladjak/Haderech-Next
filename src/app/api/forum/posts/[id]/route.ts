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

    const { data: post, error } = await supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:users(*),
        category:forum_categories(*),
        tags:forum_tags(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת הפוסט" },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json({ error: "הפוסט לא נמצא" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בטעינת הפוסט" }, { status: 500 });
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

    const { data: post, error } = await supabase
      .from("forum_posts")
      .update(json)
      .eq("id", id)
      .select(
        `
        *,
        author:users(*),
        category:forum_categories(*),
        tags:forum_tags(*)
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בעדכון הפוסט" },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json({ error: "הפוסט לא נמצא" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בעדכון הפוסט" }, { status: 500 });
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

    const { error } = await supabase.from("forum_posts").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת הפוסט" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "הפוסט נמחק בהצלחה" });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה במחיקת הפוסט" }, { status: 500 });
  }
}
