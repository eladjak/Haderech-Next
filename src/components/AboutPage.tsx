"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "אברהם ישראלי",
      role: 'מייסד ומנכ"ל',
      bio: "בוגר מדעי המחשב עם 15 שנות ניסיון בפיתוח תוכנה ואלגוריתמיקה. מאמין בחינוך טכנולוגי נגיש לכולם.",
      image: "/images/team/member1.png",
    },
    {
      name: "שרה כהן",
      role: "ראש צוות פדגוגי",
      bio: "דוקטורט בחינוך ומומחית בפיתוח תכניות לימוד אינטראקטיביות. מובילה את פיתוח מסלולי הלימוד באקדמיה.",
      image: "/images/team/member2.png",
    },
    {
      name: "יוסף לוי",
      role: "ראש מחלקת פיתוח",
      bio: "מהנדס תוכנה בכיר עם התמחות בפיתוח מערכות למידה חכמות מבוססות בינה מלאכותית.",
      image: "/images/team/member3.png",
    },
  ];

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-center text-4xl font-bold">אודות הדרך</h1>
      <p className="mb-12 text-center text-xl text-muted-foreground">
        המקום להתפתחות אישית ומקצועית בעולם התכנות והטכנולוגיה
      </p>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">החזון שלנו</h2>
          <p className="text-muted-foreground">
            הדרך נוסדה ב-2023 במטרה להנגיש לימודי תכנות ופיתוח תוכנה ברמה הגבוהה
            ביותר לכל אחד ואחת. אנו מאמינים שהכשרה טכנולוגית איכותית צריכה להיות
            זמינה, נגישה ומותאמת אישית.
          </p>
          <p className="mt-4 text-muted-foreground">
            המטרה שלנו היא להכשיר את הדור הבא של מפתחי התוכנה בישראל, תוך דגש על
            פרקטיקה, ניסיון מעשי ורכישת כלים רלוונטיים לשוק העבודה המשתנה
            במהירות.
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">השיטה שלנו</h2>
          <p className="text-muted-foreground">
            אנו מיישמים גישת למידה אדפטיבית המשלבת תיאוריה עם פרקטיקה, ומשתמשים
            בטכנולוגיה מתקדמת כדי להתאים את תהליך הלמידה לקצב ולסגנון של כל
            סטודנט.
          </p>
          <p className="mt-4 text-muted-foreground">
            בשונה משיטות הוראה מסורתיות, הלמידה בהדרך מבוססת על פרויקטים מעשיים,
            סימולציות אמת ומשוב מתמיד, המבטיחים שתרכשו לא רק ידע תיאורטי אלא גם
            יכולות מעשיות וניסיון רלוונטי.
          </p>
        </div>
      </div>

      <h2 className="mb-6 text-center text-3xl font-bold">הצוות שלנו</h2>
      <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.name}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-12 rounded-lg bg-muted p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">הצטרפו אלינו למסע</h2>
        <p className="mb-6 text-muted-foreground">
          גלו כיצד הדרך יכולה לעזור לכם לפתח את הקריירה שלכם בעולם הטכנולוגיה
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/courses">לקורסים שלנו</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/contact">יצירת קשר</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
