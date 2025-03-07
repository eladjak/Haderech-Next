import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const formSchema = z.object({
  content: z.string().min(1, {
    message: "תוכן התגובה לא יכול להיות ריק.",
  }),
});

export function CourseComments({
  courseId,
  comments: initialComments,
  className,
}: CourseCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session) {
      toast({
        title: "התחברות נדרשת",
        description: "עליך להתחבר כדי להוסיף תגובה.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const newComment = await response.json();

      // Add the new comment to the comments array
      setComments((prev) => [
        {
          ...newComment,
          user: {
            id: session.user.id,
            name: session.user.name || "",
            email: session.user.email || "",
            image: session.user.image || "",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...prev,
      ]);

      // Reset the form
      form.reset();

      toast({
        title: "תגובה נוספה בהצלחה",
        description: "תודה על התגובה שלך!",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא היה ניתן להוסיף את התגובה שלך. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>תגובות</CardTitle>
          <CardDescription>שתף את דעתך על הקורס או שאל שאלות</CardDescription>
        </CardHeader>
        <CardContent>
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
                        className="min-h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mr-auto">
                שלח תגובה
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Avatar>
                  <AvatarImage
                    src={comment.user.image || ""}
                    alt={comment.user.name}
                  />
                  <AvatarFallback>
                    {comment.user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-semibold">{comment.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            אין תגובות עדיין. היה הראשון להגיב!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
