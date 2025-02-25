"use client";

import { BarChart, ChevronRight, GraduationCap, Users } from "lucide-react";
import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  // האפקט הבא יופעל רק בצד הלקוח ויטפל בבעיות הידרציה
  useEffect(() => {
    // קוד רק לצד לקוח לאחר הידרציה מלאה
    console.log("Client-side code executed after hydration");

    // טיפול בבעיות הידרציה פוטנציאליות
    const rootElement = document.documentElement;
    if (rootElement && !rootElement.hasAttribute("data-hydrated")) {
      rootElement.setAttribute("data-hydrated", "true");
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-8 md:px-16 md:py-24">
        <div className="container flex max-w-6xl flex-col items-center justify-center gap-4 py-8 md:py-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              הדרך - פלטפורמת למידה מתקדמת
            </h1>
            <p className="mx-auto max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
              למד, תרגל ושפר את היכולות שלך בסביבה חדשנית ואינטראקטיבית
            </p>
          </div>

          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/courses">התחל ללמוד</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">
                למד עוד <ChevronRight className="mr-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  קורסים מקצועיים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  למד ממגוון קורסים מעמיקים שנבנו על ידי מומחים בתחום, עם תכנים
                  עשירים ותרגולים מעשיים.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  קהילה תומכת
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  הצטרף לקהילה פעילה של לומדים ומומחים, שתף ידע, שאל שאלות וקבל
                  עזרה בזמן אמת.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  מעקב התקדמות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  עקוב אחר ההתקדמות שלך באמצעות כלי מעקב חכמים, קבל תובנות
                  אישיות ומשוב מותאם אישית.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
