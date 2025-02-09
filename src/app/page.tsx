import { Metadata } from "next";
import React from "react";

import { LatestForumPosts } from "@/components/latest-forum-posts";
import { RecommendedCoursesPreview } from "@/components/recommended-courses-preview";
import { ReferralManagement } from "@/components/referral-management";
import { SocialRecommendations } from "@/components/social-recommendations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { courses } from "@/constants/courses";
import { posts } from "@/constants/posts";
import { users } from "@/constants/users";

function HomeActions(): React.ReactElement {
  "use client";
  return (
    <div className="flex justify-center gap-4">
      <Button size="lg">Start Learning</Button>
      <Button
        size="lg"
        variant="outline"
      >
        Explore Courses
      </Button>
    </div>
  );
}

function SocialSection(): React.ReactElement {
  "use client";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Support</CardTitle>
        <CardDescription>
          Connect with others on similar journeys
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SocialRecommendations users={users} />
      </CardContent>
    </Card>
  );
}

function ReferralSection(): React.ReactElement {
  "use client";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice & Growth</CardTitle>
        <CardDescription>
          Interactive scenarios and real-world applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReferralManagement referralCode="ABC123" />
      </CardContent>
    </Card>
  );
}

const HeroSection = (): React.ReactElement => {
  return (
    <section className="mb-12 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">
        Welcome to HaDerech
      </h1>
      <p className="mb-8 text-xl text-muted-foreground">
        Your journey to better relationships starts here
      </p>
      <HomeActions />
    </section>
  );
};

const FeaturesSection = (): React.ReactElement => {
  return (
    <section className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Learning</CardTitle>
          <CardDescription>
            Personalized course recommendations and adaptive learning paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecommendedCoursesPreview courses={courses} />
        </CardContent>
      </Card>

      <SocialSection />
      <ReferralSection />
    </section>
  );
};

const TestimonialsSection = (): React.ReactElement => {
  return (
    <section className="mb-12">
      <Card>
        <CardHeader>
          <CardTitle>Latest Community Discussions</CardTitle>
          <CardDescription>
            Join the conversation and share your experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LatestForumPosts posts={posts} />
        </CardContent>
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
