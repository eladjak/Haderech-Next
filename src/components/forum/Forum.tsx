"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForumFilters } from "./ForumFilters";
import { ForumPost, ForumPostProps } from "./ForumPost";

export interface ForumProps {
  posts: ForumPostProps[];
  categories?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
  stats?: any;
}

export function Forum({
  posts = [],
  categories = [],
  tags = [],
  stats,
}: ForumProps) {
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedTags, selectedCategories);
  };

  const handleFilterByTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);
    applyFilters(searchQuery, newSelectedTags, selectedCategories);
  };

  const handleFilterByCategory = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newSelectedCategories);
    applyFilters(searchQuery, selectedTags, newSelectedCategories);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedCategories([]);
    setFilteredPosts(posts);
  };

  const applyFilters = (
    query: string,
    tagIds: string[],
    categoryIds: string[]
  ) => {
    let result = [...posts];

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery)
      );
    }

    if (tagIds.length > 0) {
      // בהנחה שיש מאפיין tags לפוסטים או שהפוסט מגיע דרך מאפיין post
      result = result.filter((post) => {
        // מנסים לגשת לתגיות דרך המאפיין post אם קיים, אחרת ישירות
        const postObject = post.post || post;
        const postTags = postObject.tags || [];

        // אם התגיות הן אובייקטים, מחלצים את ה-ids
        const postTagIds = postTags.map((tag) =>
          typeof tag === "object" ? tag.id : tag
        );

        return tagIds.some((tagId) => postTagIds.includes(tagId));
      });
    }

    if (categoryIds.length > 0) {
      result = result.filter((post) => {
        return post.category && categoryIds.includes(post.category);
      });
    }

    setFilteredPosts(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">פורום</h2>
        <Link href="/forum/new">
          <Button>צור פוסט חדש</Button>
        </Link>
      </div>

      <ForumFilters
        onSearch={handleSearch}
        onFilterByTag={handleFilterByTag}
        onFilterByCategory={handleFilterByCategory}
        onClearFilters={handleClearFilters}
        tags={tags}
        categories={categories}
        selectedTags={selectedTags}
        selectedCategories={selectedCategories}
      />

      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <ForumPost key={post.id} {...post} />)
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">לא נמצאו פוסטים.</p>
            <p className="mt-2">
              <Link href="/forum/new">
                <Button variant="outline" className="mt-2">
                  יצירת פוסט חדש
                </Button>
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
