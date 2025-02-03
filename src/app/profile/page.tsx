/**
 * @file profile/page.tsx
 * @description Profile page component that displays and allows editing of user profile information.
 * This is a server component that fetches the initial profile data server-side.
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { UserProfile } from "@/components/user-profile";
import type { User } from "@/types/api";

export const metadata: Metadata = {
  title: "הפרופיל שלי | הדרך",
  description: "צפה בהתקדמות שלך, העדפות והמלצות אישיות",
};

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    notFound();
  }

  const { data: user } = await supabase
    .from("users")
    .select(
      `
      *,
      courses:course_enrollments(
        course:courses(*)
      )
    `,
    )
    .eq("id", session.user.id)
    .single();

  if (!user) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <UserProfile user={user as User} />
        </div>
      </div>
    </div>
  );
}
