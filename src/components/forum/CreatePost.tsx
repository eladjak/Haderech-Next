/**
 * Create Post Component
 *
 * A form component for creating new forum posts with title, content, and tags.
 * Includes validation, loading states, and tag management functionality.
 *
 * @example
 * ```tsx
 * <CreatePost
 *   onSubmit={async (post) => {
 *     await createPost(post);
 *   }}
 *   isLoading={false}
 * />
 * ```
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const formSchema = z.object({
  title: z
    .string()
    .min(3, "כותרת חייבת להכיל לפחות 3 תווים")
    .max(100, "כותרת יכולה להכיל עד 100 תווים"),
  content: z
    .string()
    .min(10, "תוכן חייב להכיל לפחות 10 תווים")
    .max(1000, "תוכן יכול להכיל עד 1000 תווים"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePost(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      toast({
        title: "הפוסט נוצר בהצלחה",
        description: "הפוסט שלך פורסם בפורום",
      });

      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו ליצור את הפוסט. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>פוסט חדש</CardTitle>
        <CardDescription>שתף את המחשבות שלך עם הקהילה</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="כותרת הפוסט"
                      {...field}
                      disabled={isLoading}
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
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
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
                className="w-full"
              >
                {isLoading ? "יוצר פוסט..." : "פרסם פוסט"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
