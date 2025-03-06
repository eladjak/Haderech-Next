"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface CreatePostProps {
  forumId?: string;
  className?: string;
  onComplete?: () => void;
}

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "כותרת חייבת להכיל לפחות 5 תווים" })
    .max(100, { message: "כותרת יכולה להכיל עד 100 תווים" }),
  content: z
    .string()
    .min(10, { message: "תוכן חייב להכיל לפחות 10 תווים" })
    .max(5000, { message: "תוכן יכול להכיל עד 5000 תווים" }),
});

export function CreatePost({
  forumId,
  className,
  onComplete,
}: CreatePostProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // בשלב זה יש להוסיף קריאת API ליצירת פוסט חדש
      console.log("Creating post:", values, "in forum:", forumId);

      // דוגמה לקריאת API:
      // await createPost({
      //   ...values,
      //   forumId,
      // });

      // לצורך הדוגמה, נדמה השהייה של פעולת השרת
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("הפוסט נוצר בהצלחה!");

      // אפשרות לניתוב לדף הפוסט החדש
      // router.push(`/forum/${forumId}/post/${newPostId}`);

      // ניקוי הטופס
      form.reset();

      // הפעלת פונקציית השלמה אם סופקה
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("שגיאה ביצירת הפוסט. נסה שוב מאוחר יותר.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <h2 className="mb-4 text-2xl font-bold">יצירת פוסט חדש</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>כותרת</FormLabel>
                <FormControl>
                  <Input
                    placeholder="הזן כותרת לפוסט שלך"
                    {...field}
                    disabled={isSubmitting}
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
                <FormLabel>תוכן</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="שתף את המחשבות, השאלות או הרעיונות שלך..."
                    className="min-h-[200px]"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                שולח...
              </>
            ) : (
              "פרסם פוסט"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
