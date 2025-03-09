"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Define the register form schema with zod
const registerSchema = z.object({
  name: z.string().min(2, {
    message: "השם חייב להכיל לפחות 2 תווים",
  }),
  email: z.string().email({
    message: "כתובת אימייל לא תקינה",
  }),
  password: z.string().min(8, {
    message: "הסיסמה חייבת להכיל לפחות 8 תווים",
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: "יש לאשר את תנאי השימוש",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isFacebookLoading, setIsFacebookLoading] =
    React.useState<boolean>(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] =
    React.useState<boolean>(false);
  const [isGithubLoading, setIsGithubLoading] = React.useState<boolean>(false);

  // Define form with react-hook-form and zod validation
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  // Registration form submission handler
  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    try {
      // כאן יתבצע תהליך ההרשמה מול השרת
      console.log("נרשם עם:", data);

      // דוגמה: מדמה הרשמה מוצלחת
      setTimeout(() => {
        toast.success("נרשמת בהצלחה!", {
          description: "ברוך הבא להדרך, המסע האישי שלך מתחיל כעת.",
        });
        router.push("/dashboard");
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      toast.error("שגיאה בהרשמה. אנא נסה שוב.");
      setIsLoading(false);
    }
  }

  // Social registration handlers
  const handleGoogleRegister = () => {
    setIsGoogleLoading(true);
    // Simulate Google registration
    setTimeout(() => {
      setIsGoogleLoading(false);
      toast.success("נרשמת בהצלחה עם Google");
      router.push("/dashboard");
    }, 1500);
  };

  const handleFacebookRegister = () => {
    setIsFacebookLoading(true);
    // Simulate Facebook registration
    setTimeout(() => {
      setIsFacebookLoading(false);
      toast.success("נרשמת בהצלחה עם Facebook");
      router.push("/dashboard");
    }, 1500);
  };

  const handleMicrosoftRegister = () => {
    setIsMicrosoftLoading(true);
    // Simulate Microsoft registration
    setTimeout(() => {
      setIsMicrosoftLoading(false);
      toast.success("נרשמת בהצלחה עם Microsoft");
      router.push("/dashboard");
    }, 1500);
  };

  const handleGithubRegister = () => {
    setIsGithubLoading(true);
    // Simulate GitHub registration
    setTimeout(() => {
      setIsGithubLoading(false);
      toast.success("נרשמת בהצלחה עם GitHub");
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שם מלא</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ישראל ישראלי"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>אימייל</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סיסמה</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="סיסמה חזקה"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rtl:space-x-reverse">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <FormLabel className="mr-2 font-normal">
                  אני מאשר/ת את{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    תנאי השימוש
                  </Link>{" "}
                  ואת{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    מדיניות הפרטיות
                  </Link>
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
            ) : null}
            הרשמה
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            או הירשם באמצעות
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isGoogleLoading}
          onClick={handleGoogleRegister}
        >
          {isGoogleLoading ? (
            <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="ml-2 h-4 w-4" />
          )}
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isFacebookLoading}
          onClick={handleFacebookRegister}
        >
          {isFacebookLoading ? (
            <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.facebook className="ml-2 h-4 w-4" />
          )}
          Facebook
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isMicrosoftLoading}
          onClick={handleMicrosoftRegister}
        >
          {isMicrosoftLoading ? (
            <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.microsoft className="ml-2 h-4 w-4" />
          )}
          Microsoft
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isGithubLoading}
          onClick={handleGithubRegister}
        >
          {isGithubLoading ? (
            <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="ml-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  );
}
