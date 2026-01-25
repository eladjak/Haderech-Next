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
import { _getForumPost, createForumComment } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ForumComment, ForumPost } from "@/types/forum";

const formSchema = z.object({
  content: z.string().min(1, {
    message: "התגובה לא יכולה להיות ריקה",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ForumPostPageProps {
  params: {
    postId: string;
  };
}

export default function ForumPostPage({ params }: ForumPostPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [isLoading, _setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const loadPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/forum/posts/${params.postId}`);
      if (!response.ok) {
        throw new Error("Failed to load post");
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הפוסט",
        variant: "destructive",
      });
      router.push("/community");
    }
  }, [params.postId, router, toast]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await createForumComment({
        postId: params.postId,
        content: data.content,
      });
      form.reset();
      void loadPost();
      toast({
        title: "התגובה נוספה בהצלחה",
        description: "התגובה שלך נוספה לדיון",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "אירעה שגיאה בהוספת התגובה";
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={post.author.avatar_url || post.author.image || undefined}
                alt={`תמונת הפרופיל של ${post.author.name}`}
              />
              <AvatarFallback>
                {post.author.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="mr-2">{post.author.name}</span>
          </div>
          <span>•</span>
          <time>{format(new Date(post.created_at), "PP", { locale: he })}</time>
        </div>
      </div>

      <div className="prose prose-stone max-w-none dark:prose-invert">
        {post.content}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">תגובות</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="הוסף תגובה..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className={cn(isSubmitting && "cursor-not-allowed opacity-50")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "שולח תגובה..." : "שלח תגובה"}
            </Button>
          </form>
        </Form>

        <div className="space-y-4">
          {post.comments?.map((comment: ForumComment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        comment.author.avatar_url ||
                        comment.author.image ||
                        undefined
                      }
                      alt={`תמונת הפרופיל של ${comment.author.name}`}
                    />
                    <AvatarFallback>
                      {comment.author.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{comment.author.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(comment.created_at), "PP", {
                        locale: he,
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
