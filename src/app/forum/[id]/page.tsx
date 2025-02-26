import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ForumComment } from "@/components/forum-comment";
import { ForumPost } from "@/components/forum-post";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/";\nimport { Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/";\nimport { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { Author, ForumPost as ForumPostType, ForumTag,

"use client";










import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";


import type {
  Author,
  ForumPost as ForumPostType,
  ForumTag,} from "@/types/forum";

const formSchema = z.object({
  content: z
    .string()
    .min(2, {
      message: "התוכן חייב להכיל לפחות 2 תווים",
    })
    .max(1000, {
      message: "התוכן יכול להכיל עד 1000 תווים",
    }),
});

const mockAuthor: Author = {
  id: "1",
  name: "משתמש בדיקה",
  email: "test@test.com",
  username: "testuser",
  role: "user",
  points: 100,
  level: 1,
  badges: [],
  achievements: [],
  full_name: "משתמש בדיקה",
  avatar_url: undefined,
  bio: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockTags: ForumTag[] = [
  {
    id: "1",
    name: "תכנות",
    description: "נושאי תכנות",
    slug: "programming",
    color: "blue",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "התחלה",
    description: "שאלות למתחילים",
    slug: "beginners",
    color: "green",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "המלצות",
    description: "המלצות ועצות",
    slug: "recommendations",
    color: "purple",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const EXAMPLE_POST: ForumPostType = {
  id: "1",
  title: "איך להתחיל ללמוד תכנות?",
  content:
    "אני רוצה להתחיל ללמוד תכנות אבל לא יודע מאיפה להתחיל. אשמח להמלצות!",
  author_id: mockAuthor.id,
  category_id: "1",
  category: {
    id: "1",
    name: "כללי",
    description: "דיונים כלליים",
    slug: "general",
    order: 1,
    icon: "MessageSquare",
    color: "blue",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  tags: mockTags,
  pinned: false,
  solved: false,
  likes: 0,
  views: 0,
  last_activity: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: mockAuthor,
  comments: [],
};

const _mockPost = {
  id: "1",
  title: "איך להתחיל ללמוד תכנות?",
  content:
    "אני רוצה להתחיל ללמוד תכנות אבל לא יודע מאיפה להתחיל. אשמח להמלצות!",
  author_id: EXAMPLE_POST.author.id,
  category_id: "1",
  category: {
    id: "1",
    name: "כללי",
    description: "דיונים כלליים",
    slug: "general",
    order: 1,
    icon: "MessageSquare",
    color: "blue",
    posts_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  tags: mockTags,
  pinned: false,
  solved: false,
  likes: 0,
  views: 0,
  last_activity: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: EXAMPLE_POST.author,
  comments: [],
} as ForumPostType;

export default function Page({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<ForumPostType>(EXAMPLE_POST);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הפוסט",
          variant: "destructive",
        });
      }
    }

    fetchPost();
  }, [params.id, toast]);

  const handleSubmit = async (values: { content: string }) => {
    try {
      setIsLoading(true);

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response?.ok) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשליחת התגובה",
          variant: "destructive",
        });
        return;
      }

      const comment = await response.json();

      setPost((prev: ForumPostType) => ({
        ...prev,
        comments: prev.comments ? [...prev.comments, comment] : [comment],
      }));

      form.reset();

      toast({
        title: "התגובה נשלחה בהצלחה",
        description: "התגובה שלך נוספה לדיון",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת התגובה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <ForumPost post={post} />

        <Card>
          <CardHeader>
            <CardTitle>תגובות</CardTitle>
            <CardDescription>הוסף את התגובה שלך לדיון</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="הוסף תגובה..."
                          className="h-32 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "שולח..." : "הוסף תגובה"}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-8 space-y-4">
              {post.comments?.map((comment) => (
                <ForumComment key={comment.id} comment={comment} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
