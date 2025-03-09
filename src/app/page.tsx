"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // נתונים לגבי הקורסים
  const features = [
    {
      icon: BookOpen,
      title: "קורסים איכותיים",
      description: "תכנים מקצועיים שנבנו בקפידה על ידי מומחים מובילים בתחומם",
      color: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Users,
      title: "קהילה תומכת",
      description: "פורום פעיל וקהילה תומכת שצועדת יחד איתך בדרך להצלחה",
      color: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Sparkles,
      title: "למידה מותאמת אישית",
      description:
        "מסלולי למידה מותאמים אישית המתפתחים יחד איתך ומתאימים לקצב שלך",
      color: "bg-amber-100 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  // נתוני הקורסים הפופולריים
  const popularCourses = [
    {
      id: 1,
      title: "פיתוח אישי מתקדם",
      description: "גלה את הפוטנציאל האמיתי שלך דרך תרגולים וכלים פרקטיים",
      image: "/images/course-1.jpg",
      students: 1250,
      lessons: 24,
      level: "מתחילים עד מתקדמים",
    },
    {
      id: 2,
      title: "אמנות התקשורת",
      description: "למד לתקשר בצורה אפקטיבית ולבנות מערכות יחסים בריאות",
      image: "/images/course-2.jpg",
      students: 980,
      lessons: 18,
      level: "לכל הרמות",
    },
    {
      id: 3,
      title: "ניהול זמן ופרודוקטיביות",
      description: "שיטות מוכחות להגביר את הפרודוקטיביות ולמקסם את הזמן שלך",
      image: "/images/course-3.jpg",
      students: 1540,
      lessons: 16,
      level: "מתחילים",
    },
  ];

  // נתוני מעידים
  const testimonials = [
    {
      name: "אילן כהן",
      role: "מנהל פרויקטים",
      content:
        "הקורסים בהדרך שינו את הגישה שלי לעבודה ולחיים. הכלים שרכשתי משמשים אותי כל יום.",
      avatar: "/images/avatar-1.jpg",
    },
    {
      name: "מיכל לוי",
      role: "יזמית",
      content:
        "הקהילה התומכת והתכנים האיכותיים הפכו את תהליך הלמידה לחוויה מעצימה ובעלת ערך.",
      avatar: "/images/avatar-2.jpg",
    },
    {
      name: "דוד אברהם",
      role: "מפתח תוכנה",
      content:
        "ההשקעה בקורסים של הדרך החזירה את עצמה פי כמה. היום אני בטוח יותר ביכולות שלי.",
      avatar: "/images/avatar-3.jpg",
    },
  ];

  // שאלות נפוצות
  const faqs = [
    {
      question: "איך מתחילים?",
      answer:
        "הרשמה פשוטה באתר, בחירת קורס שמעניין אותך, ואתה מוכן להתחיל ללמוד בקצב שלך.",
    },
    {
      question: "האם יש תעודות בסיום הקורסים?",
      answer:
        "כן, בסיום קורסים מסוימים תוכל לקבל תעודה דיגיטלית המעידה על השלמת הלימודים.",
    },
    {
      question: "איך פונים לתמיכה?",
      answer:
        "בכל שאלה או בעיה ניתן לפנות אלינו דרך מערכת הצ'אט באתר או באמצעות טופס יצירת הקשר.",
    },
  ];

  return (
    <main className="flex w-full flex-col items-center overflow-x-hidden">
      {/* Hero Section with Modern Design */}
      <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        {/* Decorative elements */}
        <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl"></div>

        <div className="container z-10 px-4 md:px-6">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <motion.div
              className="flex-1 space-y-6 text-center md:text-right"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                גלה את <span className="text-primary">הדרך</span> שלך
              </h1>
              <p className="mx-auto max-w-[600px] text-xl text-muted-foreground md:mx-0">
                פלטפורמת למידה חדשנית המותאמת אישית לצמיחה והתפתחות. למד בקצב
                שלך, התפתח עם קהילה תומכת.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <Button asChild size="lg" className="gap-1 shadow-lg">
                  <Link href="/courses">
                    התחל ללמוד עכשיו
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-2"
                >
                  <Link href="/about">גלה עוד עלינו</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="relative flex-1 md:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative mx-auto aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border/50 shadow-2xl">
                <Image
                  src="/images/hero-image.jpg"
                  alt="הדרך - פלטפורמת למידה"
                  width={600}
                  height={400}
                  className="object-cover"
                  priority
                  quality={90}
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="text-white">
                    <p className="text-sm font-medium opacity-90">
                      הצטרפו לאלפי אנשים שכבר גילו את הדרך שלהם
                    </p>
                    <div className="mt-2 flex items-center">
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                          <div className="h-full w-full bg-blue-500"></div>
                        </div>
                        <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                          <div className="h-full w-full bg-purple-500"></div>
                        </div>
                        <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                          <div className="h-full w-full bg-amber-500"></div>
                        </div>
                      </div>
                      <span className="mr-2 text-sm font-medium">
                        +3,500 תלמידים
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Status Bar Section */}
      <div className="w-full border-y border-border bg-muted py-4">
        <div className="container flex flex-wrap items-center justify-between gap-4 text-center md:text-right">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">+3,500 תלמידים פעילים</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium">25+ קורסים מקצועיים</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <span className="text-sm font-medium">קהילה של +10,000 אנשים</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span className="text-sm font-medium">תמיכה 24/7</span>
          </div>
        </div>
      </div>

      {/* Features Section with Animation */}
      <section ref={sectionRef} className="w-full py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            className="mb-12 flex flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              למה לבחור ב<span className="text-primary">הדרך</span>?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              אנחנו מאמינים בלמידה מתמשכת והתפתחות אישית דרך קהילה תומכת ותכנים
              איכותיים
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`flex flex-col items-center gap-4 rounded-xl border border-border ${feature.color} p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl`}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div
                  className={`rounded-full ${feature.color} p-3 ring-2 ring-primary/20`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-center text-muted-foreground">
                  {feature.description}
                </p>
                <ul className="mt-2 space-y-2 text-right">
                  {[...Array(3)].map((_, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">יתרון {i + 1} שתקבל</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="w-full bg-muted/50 py-20">
        <div className="container px-4 md:px-6">
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tighter">
                הקורסים הפופולריים
              </h2>
              <p className="max-w-[600px] text-muted-foreground">
                הקורסים המובילים שלנו שכבר עזרו לאלפי אנשים לשפר את חייהם
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link href="/courses">
                לכל הקורסים
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {popularCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="relative aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-800">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute right-4 top-4 rounded-md bg-primary px-2 py-1 text-xs text-white">
                    קורס פופולרי
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold">{course.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {course.description}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students.toLocaleString()} תלמידים</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.lessons} שיעורים</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{course.level}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/courses/${course.id}`}>להרשמה לקורס</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tighter">
              מה אומרים עלינו
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground">
              חוויות של תלמידים שכבר חוו את הדרך שלנו
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  {testimonial.content}
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full bg-blue-500"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-muted/30 py-20">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tighter">
              שאלות נפוצות
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground">
              מצאת את התשובות לשאלות הנפוצות ביותר
            </p>
          </div>

          <div className="mx-auto max-w-3xl divide-y divide-border">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="py-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <h3 className="mb-2 text-xl font-semibold">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-primary to-blue-600 py-16 text-white">
        <div className="container flex flex-col items-center gap-8 px-4 text-center md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tighter md:text-4xl">
              מוכנים להתחיל את המסע שלכם?
            </h2>
            <p className="mx-auto mb-8 max-w-[700px] text-white/90 md:text-xl">
              הצטרפו לאלפי לומדים שכבר גילו את הדרך לצמיחה אישית ומקצועית.
              ההרשמה חינמית!
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="font-bold"
              >
                <Link href="/register">הצטרפו עכשיו - ללא עלות</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/courses">לגלות קורסים</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support Banner */}
      <div className="w-full border-t border-border bg-primary/5 py-4">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              צריכים עזרה? צוות התמיכה שלנו זמין עבורכם 24/7
            </p>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              דברו איתנו
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
