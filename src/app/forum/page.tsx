import type { Metadata } from "next";
import React from "react";

import { CreatePost } from "@/components/forum/CreatePost";
import { Forum } from "@/components/forum/Forum";

export const metadata: Metadata = {
  title: "פורום - הדרך",
  description: "הצטרף לפורום הדרך ושתף את החוויות והתובנות שלך",
};

export default function ForumPage(): React.ReactElement {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">פורום הדרך</h1>
          <p className="text-muted-foreground">
            הצטרף לפורום הדרך ושתף את החוויות והתובנות שלך
          </p>
        </div>
        <CreatePost />
        <Forum />
      </div>
    </div>
  );
}
