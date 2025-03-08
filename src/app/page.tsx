"use client";

import { ArrowRight, BookOpen, Sparkles, Users } from "lucide-react";
import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// טעינה דינמית של קומפוננטים
const HomePage = () => {
  // נתונים בסיסיים שלא דורשים ספריות חיצוניות
  const features = [
    {
      icon: BookOpen,
      title: "קורסים איכותיים",
      description: "תכנים מקצועיים שנבנו בקפידה על ידי מומחים מובילים בתחומם",
    },
    {
      icon: Users,
      title: "קהילה תומכת",
      description: "פורום פעיל וקהילה תומכת שצועדת יחד איתך בדרך להצלחה",
    },
    {
      icon: Sparkles,
      title: "למידה מותאמת אישית",
      description:
        "מסלולי למידה מותאמים אישית המתפתחים יחד איתך ומתאימים לקצב שלך",
    },
  ];

  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="animate-fadeIn relative w-full bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="animate-fadeInUp text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl lg:text-7xl">
              ברוכים הבאים ל<span className="text-primary">הדרך</span>
            </h1>
            <p className="animate-fadeInUp-delayed mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              פלטפורמת למידה חדשנית המותאמת אישית לצמיחה והתפתחות
            </p>
            <div className="animate-fadeInUp-more-delayed flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-1">
                <Link href="/courses">
                  התחל ללמוד עכשיו
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">קרא עוד</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="animate-fadeIn-delayed w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              למה לבחור ב<span className="text-primary">הדרך</span>?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              אנחנו מאמינים בלמידה מתמשכת והתפתחות אישית דרך קהילה תומכת ותכנים
              איכותיים
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md animate-fadeIn-staggered-${index + 1}`}
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-center text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-primary py-12 text-primary-foreground md:py-16">
        <div className="container flex flex-col items-center gap-6 px-4 text-center md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
            מוכנים להתחיל את המסע שלכם?
          </h2>
          <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
            הצטרפו לאלפי לומדים שכבר גילו את הדרך לצמיחה אישית ומקצועית
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">הצטרפו עכשיו - ללא עלות</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
