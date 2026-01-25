"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

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

const formSchema = z.object({
  title: z
    .string()
    .min(3, "הכותרת חייבת להכיל לפחות 3 תווים")
    .max(100, "הכותרת יכולה להכיל עד 100 תווים"),
  content: z
    .string()
    .min(10, "התוכן חייב להכיל לפחות 10 תווים")
    .max(1000, "התוכן יכול להכיל עד 1000 תווים"),
});

type FormData = z.infer<typeof formSchema>;

interface CreatePostProps {
  onSubmit?: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export function CreatePost({
  onSubmit,
  isLoading = false,
}: CreatePostProps): React.ReactElement {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
        toast({
          title: "הפוסט נוצר בהצלחה",
          description: "הפוסט שלך פורסם בפורום",
        });
        form.reset();
        router.refresh();
      } else {
        const response = await fetch("/api/forum", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage =
            errorData?.error ||
            "לא הצלחנו ליצור את הפוסט. אנא נסה שוב מאוחר יותר.";
          toast({
            title: "שגיאה",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "הפוסט נוצר בהצלחה",
          description: "הפוסט שלך פורסם בפורום",
        });
        form.reset();
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו ליצור את הפוסט. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          פוסט חדש
        </h3>
        <p className="text-sm text-muted-foreground">
          שתף את המחשבות שלך עם הקהילה
        </p>
      </div>
      <div className="p-6 pt-0">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          aria-label="טופס יצירת פוסט חדש"
          noValidate
        >
          <div className="space-y-2">
            <div className="w-full">
              <label htmlFor="post-title" className="sr-only">
                כותרת הפוסט
              </label>
              <input
                {...form.register("title")}
                id="post-title"
                aria-invalid={!!form.formState.errors.title}
                aria-required="true"
                aria-describedby={form.formState.errors.title ? "title-error" : undefined}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-base transition-colors focus:outline-none focus:ring-2",
                  "border focus:border-primary focus:ring-primary/20",
                  form.formState.errors.title &&
                    "border-destructive focus:border-destructive focus:ring-destructive/20"
                )}
                data-testid="title-input"
                disabled={isLoading}
                placeholder="כותרת הפוסט"
                tabIndex={0}
              />
              {form.formState.errors.title && (
                <p
                  id="title-error"
                  className="mt-1 text-sm text-destructive"
                  data-testid="error-message"
                  role="alert"
                  aria-live="polite"
                >
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="post-content" className="sr-only">
              תוכן הפוסט
            </label>
            <textarea
              {...form.register("content")}
              id="post-content"
              aria-invalid={!!form.formState.errors.content}
              aria-required="true"
              aria-describedby={form.formState.errors.content ? "content-error" : undefined}
              className={cn(
                "min-h-[80px] w-full rounded-md border p-3 text-base transition-colors focus:outline-none focus:ring-2",
                "border focus:border-primary focus:ring-primary/20",
                form.formState.errors.content &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20"
              )}
              data-testid="content-input"
              disabled={isLoading}
              placeholder="תוכן הפוסט"
              tabIndex={0}
            />
            {form.formState.errors.content && (
              <p
                id="content-error"
                className="mt-1 text-sm text-destructive"
                data-testid="error-message"
                role="alert"
                aria-live="polite"
              >
                {form.formState.errors.content.message}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={cn(buttonVariants(), "w-full")}
              disabled={isLoading}
              aria-busy={isLoading}
              data-testid="submit-button"
            >
              {isLoading ? "יוצר פוסט..." : "פרסם פוסט"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
