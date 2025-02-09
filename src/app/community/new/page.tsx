"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
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
    .min(2, {
      message: "הכותרת חייבת להכיל לפחות 2 תווים",
    })
    .max(100, {
      message: "הכותרת יכולה להכיל עד 100 תווים",
    }),
  content: z
    .string()
    .min(2, {
      message: "התוכן חייב להכיל לפחות 2 תווים",
    })
    .max(1000, {
      message: "התוכן יכול להכיל עד 1000 תווים",
    }),
});

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response?.ok) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשליחת הפוסט",
          variant: "destructive",
        });
        return;
      }

      const post = await response.json();

      router.push(`/community/${post.id}`);

      toast({
        title: "הפוסט נשלח בהצלחה",
        description: "הפוסט שלך נוסף לקהילה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת הפוסט",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">פוסט חדש</h1>
        <p className="mt-2 text-muted-foreground">
          שתף את המחשבות שלך עם הקהילה
        </p>
      </div>

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
                        placeholder="כותרת"
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
                        className="h-32 resize-none"
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
                  {isLoading ? "שולח..." : "פרסם"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
