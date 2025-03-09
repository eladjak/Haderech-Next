"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import * as React from "react";
import Link from "next/link";
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

// Define the login form schema with zod
const loginSchema = z.object({
  email: z.string().email({ message: "כתובת אימייל לא תקינה" }),
  password: z.string().min(8, { message: "סיסמה חייבת להכיל לפחות 8 תווים" }),
  rememberMe: z.boolean().default(false),
});

// List of admin email addresses
const adminEmails = [
  "eladjabes@gmail.com",
  "elad.jabes@gmail.com",
  "eladj@wisdo.com",
  "eladjbnow@gmail.com",
  "elad@haderech.co.il",
  "admin@haderech.co.il",
];

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isFacebookLoading, setIsFacebookLoading] =
    React.useState<boolean>(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] =
    React.useState<boolean>(false);
  const [isGithubLoading, setIsGithubLoading] = React.useState<boolean>(false);

  // Define form with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Login form submission handler
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    // Check if the user is an admin
    const isAdmin = adminEmails.includes(data.email.toLowerCase());

    // Simulate API call with setTimeout
    setTimeout(() => {
      setIsLoading(false);
      // Success message with toast
      toast.success("התחברת בהצלחה!", {
        description: isAdmin
          ? "ברוך הבא, מנהל מערכת!"
          : "ברוך הבא להדרך, מקום שבו הצמיחה האישית שלך מתחילה.",
      });
    }, 1500);
  }

  // Social login handlers
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Simulate Google login
    setTimeout(() => {
      setIsGoogleLoading(false);
      toast.success("התחברת בהצלחה עם Google");
    }, 1500);
  };

  const handleFacebookLogin = () => {
    setIsFacebookLoading(true);
    // Simulate Facebook login
    setTimeout(() => {
      setIsFacebookLoading(false);
      toast.success("התחברת בהצלחה עם Facebook");
    }, 1500);
  };

  const handleMicrosoftLogin = () => {
    setIsMicrosoftLoading(true);
    // Simulate Microsoft login
    setTimeout(() => {
      setIsMicrosoftLoading(false);
      toast.success("התחברת בהצלחה עם Microsoft");
    }, 1500);
  };

  const handleGithubLogin = () => {
    setIsGithubLoading(true);
    // Simulate GitHub login
    setTimeout(() => {
      setIsGithubLoading(false);
      toast.success("התחברת בהצלחה עם GitHub");
    }, 1500);
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>אימייל</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="אימייל שלך"
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
                <div className="flex items-center justify-between">
                  <FormLabel>סיסמה</FormLabel>
                  <Link
                    href="/reset-password"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    שכחת סיסמה?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="הקלד את הסיסמה שלך"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rtl:space-x-reverse">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <FormLabel className="mr-2 font-normal">זכור אותי</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
            ) : null}
            התחברות
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            או התחבר באמצעות
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isGoogleLoading}
          onClick={handleGoogleLogin}
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
          onClick={handleFacebookLogin}
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
          onClick={handleMicrosoftLogin}
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
          onClick={handleGithubLogin}
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
