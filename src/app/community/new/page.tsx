import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createForumPost } from "@/lib/api";

"use client";






import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  _FormLabel,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";





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
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await createForumPost(data);
      if (response && response.id) {
        toast({
          title: "פוסט נוצר בהצלחה",
          description: "הפוסט שלך נוצר בהצלחה בפורום",
        });
        router.push(`/community/${response.id}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "אירעה שגיאה ביצירת הפוסט";
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="כותרת" {...field} />
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
                <Button type="submit">פרסם</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
