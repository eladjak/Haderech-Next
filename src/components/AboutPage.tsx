"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  Target,
  Users,
} from "lucide-react";

export default function AboutPage() {
  // מצב מוגן מפני שגיאות הידרציה
  const [isMounted, setIsMounted] = useState(false);

  // האפקט הבא יופעל רק בצד הלקוח ויטפל בבעיות הידרציה
  useEffect(() => {
    // סמן שהקומפוננטה ממופה כדי למנוע רנדור כפול
    setIsMounted(true);

    // טיפול בבעיות הידרציה פוטנציאליות
    try {
      console.log("AboutPage client-side code executed");
    } catch (error) {
      console.error("Error in client-side initialization:", error);
    }
  }, []);

  // אם הקומפוננטה לא מורכבת עדיין, נציג ממשק פשוט יותר כדי למנוע שגיאות הידרציה
  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">אודות פלטפורמת הדרך</h1>
        </div>
      </div>
    );
  }

  // הרנדור המלא יקרה רק בצד הלקוח אחרי שהקומפוננטה מורכבת
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-8 md:px-16 md:py-24">
        <div className="container flex max-w-6xl flex-col items-center justify-center gap-8 py-8 md:py-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              אודות פלטפורמת הדרך
            </h1>
            <p className="mx-auto max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
              פלטפורמת הלמידה המתקדמת לפיתוח ושיפור מיומנויות בינאישיות
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  החזון שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  אנו שואפים ליצור עולם בו כל אדם יכול לשפר את איכות מערכות
                  היחסים שלו ולהגיע לתקשורת בריאה יותר, דרך למידה מותאמת אישית
                  ותרגול מעשי.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  המטרה שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  לספק את הכלים הטובים ביותר לפיתוח מיומנויות בינאישיות ותקשורת
                  אפקטיבית, באמצעות טכנולוגיה חדשנית ושיטות פדגוגיות מתקדמות.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5" />
                  הערכים שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  אנו מאמינים באמפתיה, כנות, למידה מתמדת, שיתוף ידע וקהילתיות.
                  ערכים אלו מנחים אותנו בכל היבט של הפלטפורמה ותוכן הקורסים.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  הקורסים שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  מגוון רחב של קורסים מעשיים בנושאים כמו תקשורת זוגית, יחסי
                  הורים-ילדים, פתרון קונפליקטים, תקשורת לא אלימה, והקשבה
                  אקטיבית.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  הסימולטור
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  סימולטור אינטראקטיבי המאפשר לתרגל תרחישי תקשורת מאתגרים בסביבה
                  בטוחה, לקבל משוב בזמן אמת ולשפר מיומנויות בצורה מעשית.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  הקהילה שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  קהילה תומכת של לומדים ומומחים, שיתוף ידע וניסיון, קבוצות דיון
                  ותמיכה הדדית בתהליך השיפור והצמיחה האישית.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Button asChild size="lg" className="mt-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              חזרה לדף הבית
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}