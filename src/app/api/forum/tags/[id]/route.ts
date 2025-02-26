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

    const { data: tag, error } = await supabase
      .from("forum_tags")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "שגיאה בטעינת התגית" },
        { status: 500 }
      );
    }

    if (!tag) {
      return NextResponse.json({ error: "התגית לא נמצאה" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בטעינת התגית" }, { status: 500 });
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

    if (!tag) {
      return NextResponse.json({ error: "התגית לא נמצאה" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בעדכון התגית" }, { status: 500 });
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

    const { error } = await supabase.from("forum_tags").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "שגיאה במחיקת התגית" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "התגית נמחקה בהצלחה" });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה במחיקת התגית" }, { status: 500 });
  }
}
