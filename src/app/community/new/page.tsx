"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createForumPost } from "@/lib/services/forum";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "כותרת חייבת להכיל לפחות 5 תווים",
    })
    .max(100, {
      message: "כותרת יכולה להכיל עד 100 תווים",
    }),
  content: z
    .string()
    .min(10, {
      message: "תוכן הפוסט חייב להכיל לפחות 10 תווים",
    })
    .max(5000, {
      message: "תוכן הפוסט יכול להכיל עד 5000 תווים",
    }),
  tags: z.string().optional(),
});

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log("Submitting post data:", data);

      // המרת תגיות למערך אם הוזנו
      const formattedTags = data.tags
        ? data.tags.split(",").map((tag) => tag.trim())
        : [];

      const result = await createForumPost({
        title: data.title,
        content: data.content,
        tags: formattedTags,
      });

      console.log("Post created successfully:", result);

      toast({
        title: "פוסט פורסם בהצלחה",
        description: "הפוסט שלך נשמר ופורסם בקהילה.",
      });

      router.push("/community");
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "שגיאה בפרסום הפוסט",
        description: "אירעה שגיאה בעת שמירת הפוסט. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-6 text-3xl font-bold">יצירת פוסט חדש בקהילה</h1>

      <Card>
        <CardHeader>
          <CardTitle>פרסום תוכן חדש</CardTitle>
          <CardDescription>
            שתף את המחשבות, השאלות או הרעיונות שלך עם הקהילה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="כותרת הפוסט"
                        className="text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="תוכן הפוסט"
                        className="min-h-40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="תגיות (מופרדות בפסיקים)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  בטל
                </Button>
                <Button type="submit">פרסם</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
