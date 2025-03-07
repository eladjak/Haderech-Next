"use client";

import React from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";

// דף פרופיל פשוט ללא נתונים אמיתיים (עבור בדיקת בנייה)
export default function ProfilePage() {
  // מידע דמה לרכיבי הפרופיל
  const mockProfile = {
    username: "demo_user",
    full_name: "משתמש לדוגמה",
    bio: "זהו פרופיל לדוגמה",
  };

  const mockStats = {
    coursesCompleted: 5,
    totalCourses: 10,
    averageScore: 85,
    totalTime: 1200,
    achievements: 8,
    certificatesEarned: 3,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader
        profile={{
          name: mockProfile.full_name,
          avatarUrl: "/images/avatar.png",
          joinDate: new Date().toISOString(),
          level: 2,
        }}
        isCurrentUser={true}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProfileStats stats={mockStats} />
        <div className="lg:col-span-2">
          <ProfileForm profile={mockProfile} />
        </div>
      </div>
    </div>
  );
}
