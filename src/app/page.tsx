"use client";

import { ArrowRight, BookOpen, Sparkles, Users } from "lucide-react";
import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Import conditionally to prevent build errors
let motion;
let useInView;
try {
  // Try to import framer-motion
  // @ts-ignore - שימוש ב-dynamic import שלא מזוהה בזמן קומפילציה
  motion = require("framer-motion");
} catch (e) {
  // Fallback if not available
  motion = {
    motion: {
      section: "section",
      div: "div",
      h1: "h1",
      p: "p",
    },
  };
}

try {
  // Try to import react-intersection-observer
  // @ts-ignore - שימוש ב-dynamic import שלא מזוהה בזמן קומפילציה
  const {
    useInView: importedUseInView,
  } = require("react-intersection-observer");
  useInView = importedUseInView;
} catch (e) {
  // Mock implementation if not available
  useInView = () => [null, true];
}

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

// Create wrapper components that fallback to regular HTML if motion isn't available
const MotionSection = motion?.motion?.section || "section";
const MotionDiv = motion?.motion?.div || "div";
const MotionH1 = motion?.motion?.h1 || "h1";
const MotionP = motion?.motion?.p || "p";

export default function HomePage() {
  const [heroRef, heroInView] = useInView
    ? useInView({
        triggerOnce: true,
        threshold: 0.1,
      })
    : [null, true];

  const [featuresRef, featuresInView] = useInView
    ? useInView({
        triggerOnce: true,
        threshold: 0.1,
      })
    : [null, true];

  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <MotionSection
        ref={heroRef}
        initial={{ opacity: 0, y: 20 }}
        animate={heroInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative w-full bg-gradient-to-b from-primary/5 to-background py-20 md:py-32"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <MotionH1
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl lg:text-7xl"
            >
              ברוכים הבאים ל<span className="text-primary">הדרך</span>
            </MotionH1>
            <MotionP
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mx-auto max-w-[700px] text-muted-foreground md:text-xl"
            >
              פלטפורמת למידה חדשנית המותאמת אישית לצמיחה והתפתחות
            </MotionP>
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button asChild size="lg" className="gap-1">
                <Link href="/courses">
                  התחל ללמוד עכשיו
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">קרא עוד</Link>
              </Button>
            </MotionDiv>
          </div>
        </div>
      </MotionSection>

      {/* Features Section */}
      <MotionSection
        ref={featuresRef}
        initial={{ opacity: 0, y: 20 }}
        animate={featuresInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="w-full py-16 md:py-24"
      >
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
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 * index, duration: 0.6 }}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-center text-muted-foreground">
                  {feature.description}
                </p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </MotionSection>

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
}
