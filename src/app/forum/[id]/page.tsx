"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ForumComment } from "@/components/forum-comment";
import { ForumPost } from "@/components/forum-post";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import type { ForumPost as ForumPostType } from "@/types/api";

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

const EXAMPLE_POST: ForumPostType = {
  id: "1",
  title: "איך להתחיל ללמוד תכנות?",
  content:
    "אני רוצה להתחיל ללמוד תכנות אבל לא יודע מאיפה להתחיל. אשמח להמלצות!",
  author: {
    id: "1",
    name: "יוסי כהן",
    email: "yossi@example.com",
    avatar_url: null,
    bio: null,
  },
  user: {
    id: "1",
    name: "יוסי כהן",
    email: "yossi@example.com",
    avatar_url: null,
    bio: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: "user",
    settings: {
      notifications: true,
      language: "he",
      theme: "light",
    },
  },
  userId: "1",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  likes: 5,
  likes_count: 5,
  comments_count: 2,
  comments: [],
  tags: ["תכנות", "התחלה", "המלצות"],
  is_liked: false,
};

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, comment],
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
  }

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
                onSubmit={form.handleSubmit(onSubmit)}
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
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "שולח..." : "הוסף תגובה"}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-8 space-y-4">
              {post.comments.map((comment) => (
                <ForumComment
                  key={comment.id}
                  comment={comment}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
