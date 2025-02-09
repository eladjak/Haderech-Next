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
import { cn } from "@/lib/utils";

const formSchema = z.object({
  content: z
    .string()
    .min(2, {
      message: "התגובה חייבת להכיל לפחות 2 תווים",
    })
    .max(500, {
      message: "התגובה יכולה להכיל עד 500 תווים",
    }),
});

interface CourseCommentsProps {
  courseId: string;
  comments: Comment[];
  className?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  courseId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

export function CourseComments({
  courseId,
  comments: initialComments,
  className,
}: CourseCommentsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: values.content,
          courseId,
        }),
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

      setComments((prev) => [comment, ...prev]);
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
    <div className={cn("space-y-4", className)}>
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
        {comments.map((comment) => (
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
