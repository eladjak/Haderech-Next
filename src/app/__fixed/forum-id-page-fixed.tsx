"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ForumComment } from "@/components/forum/ForumComment";
import { ForumPost } from "@/components/forum/ForumPost";
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
import { cn } from "@/lib/utils";
import type {
  Author,
  ForumPost as ForumPostType,
  ForumTag,
} from "@/types/forum";

const formSchema = z.object({
  content: z.string().min(1, {
    message: "התגובה לא יכולה להיות ריקה",
  }),
});

export default function Page({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [post, setPost] = useState<ForumPostType | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/forum/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);

        // Fetch comments for this post
        const commentsResponse = await fetch(
          `/api/forum/${params.id}/comments`
        );
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Error fetching forum post:", error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את הפוסט המבוקש",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
  }, [params.id, toast]);

  const handleSubmit = async (values: { content: string }) => {
    if (!session) {
      toast({
        title: "נדרשת התחברות",
        description: "עליך להתחבר כדי להגיב לפוסטים",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/forum/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: values.content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      // Reset the form
      form.reset();

      // Reload comments
      const commentsResponse = await fetch(`/api/forum/${params.id}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      }

      toast({
        title: "תגובה נוספה",
        description: "התגובה שלך נוספה בהצלחה",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת התגובה",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h1 className="mb-4 text-2xl font-bold">הפוסט לא נמצא</h1>
        <p className="mb-8 text-muted-foreground">
          הפוסט שחיפשת אינו קיים או שהוא הוסר
        </p>
        <Button onClick={() => router.push("/forum")}>חזרה לפורום</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <ForumPost post={post} />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">תגובות ({comments.length})</h2>

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <ForumComment key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              אין עדיין תגובות לפוסט זה. היה הראשון להגיב!
            </p>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>הוסף תגובה</CardTitle>
          <CardDescription>שתף את המחשבות והתובנות שלך בנושא</CardDescription>
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
                        placeholder="כתוב את תגובתך כאן..."
                        className="min-h-32"
                        disabled={!session || submitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                {!session ? (
                  <Button type="button" onClick={() => router.push("/login")}>
                    התחבר כדי להגיב
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "שולח..." : "פרסם תגובה"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
