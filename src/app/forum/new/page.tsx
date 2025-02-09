import type { Metadata } from "next";
import React from "react";

import { CreatePost } from "@/components/forum/CreatePost";

export const metadata: Metadata = {
  title: "יצירת פוסט חדש - הדרך",
  description: "צור פוסט חדש בפורום הדרך",
};

export default function NewForumPostPage(): React.ReactElement {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">יצירת פוסט חדש</h1>
          <p className="text-muted-foreground">
            שתף את המחשבות והתובנות שלך עם קהילת הדרך
          </p>
        </div>
        <CreatePost />
      </div>
    </div>
  );
}
