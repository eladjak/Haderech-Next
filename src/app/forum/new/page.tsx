import type { Metadata } from "next";
import React from "react";
import { CreatePost } from "@/components/forum/CreatePost";

export const metadata: Metadata = {
  title: "יצירת פוסט חדש - הדרך",
  description: "צור פוסט חדש בפורום הדרך",
};

export default function NewPostPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">יצירת פוסט חדש</h1>
      <CreatePost />
    </div>
  );
}
