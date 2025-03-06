"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createForumComment } from "@/lib/services/forum";
import { cn } from "@/lib/utils";
import type { Author, ForumComment, ForumPost } from "@/types/forum";

const formSchema = z.object({
  content: z.string().min(1, { message: "התגובה לא יכולה להיות ריקה" }),
});

type FormData = z.infer<typeof formSchema>;

interface ForumPostPageProps {
  params: { postId: string };
}

export default function ForumPostPage({ params }: ForumPostPageProps) {
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const fetchPostData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/${params.postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      const data = await response.json();
      setPost(data);

      const commentsResponse = await fetch(
        `/api/community/${params.postId}/comments`
      );
      if (!commentsResponse.ok) {
        throw new Error("Failed to fetch comments");
      }
      const commentsData = await commentsResponse.json();
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הפוסט והתגובות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [params.postId, toast]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  const onSubmit = async (data: FormData) => {
    try {
      setCommentLoading(true);

      await createForumComment({
        postId: params.postId,
        content: data.content,
      });

      form.reset();

      // עדכון התגובות
      await fetchPostData();

      toast({
        title: "התגובה פורסמה בהצלחה",
        description: "התגובה שלך נוספה לדיון",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בפרסום התגובה",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="h-[200px] w-full" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container flex h-[50vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">הפוסט לא נמצא</h2>
        <p className="text-muted-foreground">הפוסט המבוקש אינו קיים או הוסר</p>
        <Button className="mt-4" onClick={() => router.push("/community")}>
          חזרה לקהילה
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* פרטי הפוסט */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.author.image || ""} alt={post.author.name} />
            <AvatarFallback>{post.author.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{post.author.name}</span>
              <span>•</span>
              <time dateTime={post.createdAt.toString()}>
                {format(new Date(post.createdAt), "d בMMM, yyyy", {
                  locale: he,
                })}
              </time>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            <p>{post.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* תגובות */}
      <h2 className="mb-4 text-xl font-bold">תגובות ({comments.length})</h2>

      <div className="mb-8 space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className={cn("border")}>
            <CardHeader className="flex flex-row items-start gap-4 py-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={comment.author.image || ""}
                  alt={comment.author.name}
                />
                <AvatarFallback>
                  {comment.author.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{comment.author.name}</h3>
                  <time
                    className="text-sm text-muted-foreground"
                    dateTime={comment.createdAt.toString()}
                  >
                    {format(new Date(comment.createdAt), "d בMMM, yyyy", {
                      locale: he,
                    })}
                  </time>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </CardHeader>
          </Card>
        ))}

        {comments.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              עדיין אין תגובות לפוסט זה. היה הראשון להגיב!
            </p>
          </div>
        )}
      </div>

      {/* טופס הוספת תגובה */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">הוספת תגובה</h3>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="כתוב את התגובה שלך כאן..."
                        className="min-h-28"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={commentLoading}>
                  {commentLoading ? "שולח..." : "הוסף תגובה"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
