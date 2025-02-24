import React from "react";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";
import { Metadata } from "next";

import { LatestForumPosts } from "@/components/latest-forum-posts";
import { RecommendedCoursesPreview } from "@/components/recommended-courses-preview";
import { ReferralManagement } from "@/components/referral-management";
import { SocialRecommendations } from "@/components/social-recommendations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { courses } from "@/constants/courses";
import { posts } from "@/constants/posts";
import { users } from "@/constants/users";

function HomeActions(): React.ReactElement {
  return (
    <div className="flex flex-col justify-center gap-4 sm:flex-row">
      <Button
        size="lg"
        className="bg-gradient-to-r from-primary to-blue-600 transition-all duration-300 hover:from-primary/90 hover:to-blue-500"
      >
        <Link href="/courses">
          <span className="flex items-center">
            התחל ללמוד
            <ChevronRight className="ml-2 h-4 w-4" />
          </span>
        </Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="border-primary text-primary transition-all duration-300 hover:bg-primary/10"
      >
        <Link href="/courses">
          <span className="flex items-center">
            גלה קורסים
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </Link>
      </Button>
    </div>
  );
}

function SocialSection(): React.ReactElement {
  return (
    <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
      <CardHeader className="relative">
        <div className="absolute right-4 top-4 rounded-full bg-blue-100 p-2">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        <CardTitle className="text-xl font-bold">קהילה תומכת</CardTitle>
        <CardDescription>התחבר עם אחרים במסעות דומים</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <SocialRecommendations users={users} />
      </CardContent>
      <CardFooter className="relative">
        <Button variant="ghost" size="sm" className="ml-auto text-blue-600">
          <span className="flex items-center">
            להצטרף לקהילה
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ReferralSection(): React.ReactElement {
  return (
    <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>
      <CardHeader className="relative">
        <div className="absolute right-4 top-4 rounded-full bg-purple-100 p-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <CardTitle className="text-xl font-bold">תרגול וצמיחה</CardTitle>
        <CardDescription>
          תרחישים אינטראקטיביים ויישומים מהעולם האמיתי
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ReferralManagement referralCode="ABC123" />
      </CardContent>
      <CardFooter className="relative">
        <Button variant="ghost" size="sm" className="ml-auto text-purple-600">
          <span className="flex items-center">
            לסימולטור התרגול
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}

const HeroSection = (): React.ReactElement => {
  return (
    <section className="relative mb-12 overflow-hidden py-20 text-center">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-70"></div>
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative">
        <h1 className="mb-4 bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          ברוכים הבאים להדרך
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          המסע שלך ליצירת מערכות יחסים טובות יותר מתחיל כאן
        </p>
        <HomeActions />
      </div>
    </section>
  );
};

const FeaturesSection = (): React.ReactElement => {
  return (
    <section className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
        <CardHeader className="relative">
          <div className="absolute right-4 top-4 rounded-full bg-green-100 p-2">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold">
            למידה מונעת בינה מלאכותית
          </CardTitle>
          <CardDescription>
            המלצות קורסים מותאמות אישית ומסלולי למידה אדפטיביים
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <RecommendedCoursesPreview courses={courses} />
        </CardContent>
        <CardFooter className="relative">
          <Button variant="ghost" size="sm" className="ml-auto text-green-600">
            <span className="flex items-center">
              למסלולי למידה מותאמים
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </CardFooter>
      </Card>

      <SocialSection />
      <ReferralSection />
    </section>
  );
};

const TestimonialsSection = (): React.ReactElement => {
  return (
    <section className="mb-12">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-40"></div>
        <CardHeader className="relative">
          <CardTitle>דיונים אחרונים בקהילה</CardTitle>
          <CardDescription>הצטרף לשיחה ושתף את החוויות שלך</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <LatestForumPosts posts={posts} />
        </CardContent>
        <CardFooter className="relative">
          <Button variant="ghost" size="sm" className="ml-auto text-orange-600">
            <span className="flex items-center">
              לפורום הקהילה
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
};

export const metadata: Metadata = {
  title: "הדרך - פלטפורמת הלימוד המובילה לזוגיות ומערכות יחסים",
  description:
    "הדרך היא פלטפורמת הלימוד המובילה בישראל לזוגיות ומערכות יחסים. למדו מהמומחים המובילים בתחום, קבלו כלים פרקטיים ושפרו את חיי הזוגיות שלכם.",
  keywords:
    "זוגיות, מערכות יחסים, לימוד, קורסים, פורום, קהילה, ייעוץ זוגי, תקשורת זוגית",
};

export default function Home(): React.ReactElement {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Grid */}
      <FeaturesSection />

      {/* Latest Forum Posts */}
      <TestimonialsSection />
    </main>
  );
}
