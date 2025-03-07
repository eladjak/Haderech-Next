#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט זה מתמקד בתיקון שגיאות פרסינג בקבצי הפורום
מטפל ספציפית ברכיבים CreatePost, ForumComment, ForumPost והקשורים אליהם
"""

import os
import re
import glob
from typing import List, Dict, Optional

def read_file(file_path):
    """קורא את תוכן הקובץ"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"שגיאה בקריאת הקובץ {file_path}: {e}")
        return None

def write_file(file_path, content):
    """כותב תוכן לקובץ"""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        return True
    except Exception as e:
        print(f"שגיאה בכתיבה לקובץ {file_path}: {e}")
        return False

def get_createpost_template():
    """מחזיר תבנית מתוקנת לרכיב CreatePost"""
    return '''
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export interface CreatePostProps {
  onSubmit?: (post: { title: string; content: string; category?: string }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  categories?: { id: string; name: string }[];
}

export function CreatePost({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  categories = [] 
}: CreatePostProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "שדות חסרים",
        description: "יש למלא כותרת ותוכן",
        variant: "destructive",
      });
      return;
    }

    if (onSubmit) {
      onSubmit({ title, content, category });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">יצירת פוסט חדש</h2>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="font-medium">
              כותרת
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת הפוסט"
              required
            />
          </div>
          
          {categories.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="category" className="font-medium">
                קטגוריה
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">בחר קטגוריה</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="content" className="font-medium">
              תוכן
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="תוכן הפוסט"
              rows={8}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              ביטול
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "שולח..." : "פרסם"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
'''

def get_forumcomment_template():
    """מחזיר תבנית מתוקנת לרכיב ForumComment"""
    return '''
"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

export interface ForumCommentProps {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  onReply?: () => void;
  onLike?: () => void;
  likesCount?: number;
  isLiked?: boolean;
}

export function ForumComment({
  content,
  author,
  createdAt,
  onReply,
  onLike,
  likesCount = 0,
  isLiked = false,
}: ForumCommentProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: he,
  });

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{author.name}</p>
                <p className="text-sm text-gray-500">{timeAgo}</p>
              </div>
            </div>
            <div className="mt-2">
              <p>{content}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={isLiked ? "text-blue-600" : ""}
        >
          {likesCount} לייקים
        </Button>
        {onReply && (
          <Button variant="outline" size="sm" onClick={onReply}>
            הגב
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
'''

def get_forumpost_template():
    """מחזיר תבנית מתוקנת לרכיב ForumPost"""
    return '''
"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

export interface ForumPostProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  category?: string;
  createdAt: string;
  commentsCount?: number;
  likesCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

export function ForumPost({
  id,
  title,
  content,
  author,
  category,
  createdAt,
  commentsCount = 0,
  likesCount = 0,
  isLiked = false,
  onLike,
  isBookmarked = false,
  onBookmark,
}: ForumPostProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: he,
  });

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/forum/${id}`} className="hover:underline">
              <h3 className="text-xl font-bold">{title}</h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{author.name}</span>
              <span>•</span>
              <span>{timeAgo}</span>
              {category && (
                <>
                  <span>•</span>
                  <Badge variant="outline">{category}</Badge>
                </>
              )}
            </div>
          </div>
        </div>
        {onBookmark && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBookmark}
            className={isBookmarked ? "text-yellow-500" : ""}
          >
            {isBookmarked ? "★" : "☆"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={isLiked ? "text-blue-600" : ""}
          >
            {likesCount} לייקים
          </Button>
          <Link href={`/forum/${id}`}>
            <Button variant="ghost" size="sm">
              {commentsCount} תגובות
            </Button>
          </Link>
        </div>
        <Link href={`/forum/${id}`}>
          <Button variant="outline" size="sm">
            הצג פוסט
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
'''

def get_forumfilters_template():
    """מחזיר תבנית מתוקנת לרכיב ForumFilters"""
    return '''
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ForumFiltersProps {
  onSearch: (query: string) => void;
  onFilterByTag?: (tag: string) => void;
  onFilterByCategory?: (category: string) => void;
  onClearFilters?: () => void;
  tags?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  selectedTags?: string[];
  selectedCategories?: string[];
}

export function ForumFilters({
  onSearch,
  onFilterByTag,
  onFilterByCategory,
  onClearFilters,
  tags = [],
  categories = [],
  selectedTags = [],
  selectedCategories = [],
}: ForumFiltersProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="חיפוש בפורום..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">חפש</Button>
      </form>

      {(tags.length > 0 || categories.length > 0) && (
        <div className="space-y-3">
          {tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">תגיות</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onFilterByTag && onFilterByTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">קטגוריות</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onFilterByCategory && onFilterByCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {(selectedTags.length > 0 || selectedCategories.length > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="mt-2"
            >
              נקה סינון
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
'''

def get_forum_template():
    """מחזיר תבנית מתוקנת לרכיב Forum"""
    return '''
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForumPost, ForumPostProps } from "./ForumPost";
import { ForumFilters } from "./ForumFilters";

export interface ForumProps {
  posts: ForumPostProps[];
  categories?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
}

export function Forum({ posts = [], categories = [], tags = [] }: ForumProps) {
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

  const applyFilters = (query: string, tagIds: string[], categoryIds: string[]) => {
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
      // בהנחה שיש מאפיין tags לפוסטים
      result = result.filter((post) => {
        const postTags = post.tags || [];
        return tagIds.some((tagId) => postTags.includes(tagId));
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
      <div className="flex justify-between items-center">
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
          filteredPosts.map((post) => (
            <ForumPost key={post.id} {...post} />
          ))
        ) : (
          <div className="text-center py-10">
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
'''

def get_forumstats_template():
    """מחזיר תבנית מתוקנת לרכיב ForumStats"""
    return '''
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ForumStatsProps {
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  trendingTags?: { id: string; name: string; count: number }[];
  className?: string;
}

export function ForumStats({
  totalPosts,
  totalComments,
  activeUsers,
  trendingTags = [],
  className,
}: ForumStatsProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">סך הכל פוסטים</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPosts}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">סך הכל תגובות</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalComments}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">משתמשים פעילים</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeUsers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">תגיות פופולריות</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {trendingTags.length > 0 ? (
              trendingTags.slice(0, 3).map((tag) => (
                <div key={tag.id} className="flex items-center justify-between">
                  <span className="text-sm">{tag.name}</span>
                  <span className="text-sm text-muted-foreground">{tag.count}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">אין תגיות</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'''

def get_about_page_template():
    """מחזיר תבנית מתוקנת לדף אודות"""
    return '''
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">אודות הדרך</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>המשימה שלנו</CardTitle>
            <CardDescription>החזון והמטרות של הדרך</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              פלטפורמת "הדרך" נוצרה במטרה להנגיש ידע טכנולוגי איכותי בעברית לכל אדם. 
              אנו מאמינים שלימודי טכנולוגיה צריכים להיות נגישים, עדכניים ומותאמים 
              לצרכי התעשייה המשתנים במהירות.
            </p>
            <p className="mt-4">
              באמצעות קורסים מובנים, סימולטורים אינטראקטיביים וקהילה תומכת, 
              אנו מספקים חווית למידה עשירה שמאפשרת לכל אחד ללמוד בקצב האישי שלו
              ולרכוש את המיומנויות הדרושות להשתלבות בעולם הטכנולוגי.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>הצוות שלנו</CardTitle>
            <CardDescription>האנשים מאחורי הפלטפורמה</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              הצוות שלנו מורכב ממפתחים, מעצבים ואנשי חינוך עם ניסיון רב בתעשיית 
              ההייטק ובהוראת טכנולוגיה. יחד, אנו פועלים להנגיש את עולם ההייטק לקהל הרחב בישראל.
            </p>
            <p className="mt-4">
              אנו מחוייבים לספק חווית למידה ברמה הגבוהה ביותר, עם תכנים מעודכנים
              והתמקדות בפרקטיקה ומיומנויות מעשיות שנדרשות בשוק העבודה.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>המתודולוגיה שלנו</CardTitle>
            <CardDescription>איך אנחנו מלמדים</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              הגישה החינוכית שלנו מבוססת על עקרונות של למידה אקטיבית, התנסות מעשית ולמידה הדרגתית.
              אנו משלבים תיאוריה עם תרגול מעשי, מציעים פרויקטים אמיתיים, ומאפשרים ללומדים להתקדם
              בקצב המתאים להם.
            </p>
            <p className="mt-4">
              הפלטפורמה שלנו כוללת:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>קורסים מובנים עם שיעורים, תרגילים ופרויקטים</li>
              <li>סימולטורים אינטראקטיביים לתרגול מעשי</li>
              <li>פורום קהילתי לשאלות, תמיכה ושיתוף ידע</li>
              <li>מערכת מעקב אישית אחר התקדמות הלמידה</li>
              <li>הערכות ומשובים לשיפור מתמיד</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/courses">
              <Button>צפה בקורסים שלנו</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">מוכנים להתחיל את המסע?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          הצטרפו עוד היום לאלפי לומדים שכבר בחרו ב"הדרך" כדי להתקדם בעולם הטכנולוגיה.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button size="lg">הרשמה חינם</Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg">גלה קורסים</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
'''

def fix_forum_components():
    """מתקן רכיבי פורום בעייתיים"""
    # רשימת הקבצים והתבניות המתאימות להם
    components = {
        "src/components/forum/CreatePost.tsx": get_createpost_template(),
        "src/components/forum/ForumComment.tsx": get_forumcomment_template(),
        "src/components/forum/ForumPost.tsx": get_forumpost_template(),
        "src/components/forum/ForumFilters.tsx": get_forumfilters_template(),
        "src/components/forum/Forum.tsx": get_forum_template(),
        "src/components/forum/ForumStats.tsx": get_forumstats_template(),
        "src/components/AboutPage.tsx": get_about_page_template()
    }
    
    fixed_count = 0
    
    for file_path, template in components.items():
        # בדיקה אם הקובץ קיים
        if os.path.exists(file_path):
            # כתיבת התבנית החדשה במקום התוכן הקיים
            if write_file(file_path, template.strip()):
                print(f"תוקן: {file_path}")
                fixed_count += 1
        else:
            print(f"קובץ לא קיים: {file_path}")
    
    return fixed_count

if __name__ == "__main__":
    fixed_count = fix_forum_components()
    print(f"\nסך הכל תוקנו {fixed_count} קבצי פורום.") 