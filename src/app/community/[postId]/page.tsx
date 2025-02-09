"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const formSchema = z.object({
  content: z
    .string()
    .min(2, {
      message: "התגובה חייבת להכיל לפחות 2 תווים",
    })
    .max(1000, {
      message: "התגובה יכולה להכיל עד 1000 תווים",
    }),
});

interface PageProps {
  params: {
    postId: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  postId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  comments: Comment[];
}

export default function Page({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
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
        const response = await fetch(`/api/posts/${params.postId}`);
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
  }, [params.postId, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/posts/${params.postId}/comments`, {
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

      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [comment, ...prev.comments],
        };
      });
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

  if (!post) {
    return (
      <div className="container py-8">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage
                src={post.user.image}
                alt={post.user.name}
              />
              <AvatarFallback>
                {post.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                {format(new Date(post.createdAt), "dd בMMMM yyyy", {
                  locale: he,
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>תגובות</CardTitle>
          <CardDescription>
            הוסף את התגובה שלך לדיון או קרא תגובות של אחרים
          </CardDescription>
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
                        placeholder="כתוב את התגובה שלך כאן..."
                        className="h-24 resize-none"
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
                  {isLoading ? "שולח..." : "שלח תגובה"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {post.comments.map((comment) => (
          <Card key={comment.id}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <Avatar>
                <AvatarImage
                  src={comment.user.image}
                  alt={comment.user.name}
                />
                <AvatarFallback>
                  {comment.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-base">{comment.user.name}</CardTitle>
                <CardDescription>
                  {format(new Date(comment.createdAt), "dd בMMMM yyyy", {
                    locale: he,
                  })}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
