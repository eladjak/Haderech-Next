import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecommendedCoursesPreview } from "@/components/recommended-courses-preview";
import { SocialRecommendations } from "@/components/social-recommendations";
import { ReferralManagement } from "@/components/referral-management";
import { LatestForumPosts } from "@/components/latest-forum-posts";
import { courses } from "@/constants/courses";
import { users } from "@/constants/users";
import { posts } from "@/constants/posts";

export const metadata: Metadata = {
  title: "HaDerech - Advanced Learning Platform",
  description:
    "Advanced learning platform for relationship improvement powered by AI",
};

function HomeActions() {
  "use client";
  return (
    <div className="flex justify-center gap-4">
      <Button size="lg">Start Learning</Button>
      <Button size="lg" variant="outline">
        Explore Courses
      </Button>
    </div>
  );
}

function SocialSection() {
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

function ReferralSection() {
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

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Welcome to HaDerech
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Your journey to better relationships starts here
        </p>
        <HomeActions />
      </section>

      {/* Features Grid */}
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

      {/* Latest Forum Posts */}
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
    </main>
  );
}
