import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const messageSchema = z.object({
  message: z
    .string()
    .min(1, "ההודעה לא יכולה להיות ריקה")
    .max(1000, "ההודעה ארוכה מדי"),
  scenarioId: z.string().min(1, "חסר מזהה תרחיש"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "אין הרשאות גישה" }, { status: 401 });
    }

    const body = await req.json();
    const result = messageSchema.safeParse(body);

    if (!result.success) {
      const error = result.error.issues[0];
      if (!error) {
        return NextResponse.json(
          { error: "שגיאה בבדיקת הקלט" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { message, scenarioId } = result.data;

    // בדיקת הרשאות לתרחיש
    const { data: scenario, error: scenarioError } = await supabase
      .from("simulator_scenarios")
      .select("*")
      .eq("id", scenarioId)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json(
        { error: "שגיאה בבדיקת הרשאות" },
        { status: 404 }
      );
    }

    // בדיקת הרשאות המשתמש
    const { data: userScenario, error: accessError } = await supabase
      .from("simulator_user_settings")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("scenario_id", scenarioId)
      .single();

    if (accessError || !userScenario) {
      return NextResponse.json(
        { error: "אין לך הרשאות לתרחיש זה" },
        { status: 403 }
      );
    }

    // בדיקת אורך ההודעה
    if (message.length > 1000) {
      return NextResponse.json({ error: "ההודעה ארוכה מדי" }, { status: 400 });
    }

    // כאן יבוא הקוד שמטפל בהודעה ומחזיר תשובה
    // לצורך הדוגמה נחזיר תשובה קבועה
    return NextResponse.json({
      response: "תשובה לדוגמה",
      feedback: "משוב לדוגמה",
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
