"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
import { useAuth } from "@/contexts/auth-context";
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
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isFacebookLoading, setIsFacebookLoading] =
    React.useState<boolean>(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] =
    React.useState<boolean>(false);
  const supabase = createClientComponentClient();

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

    try {
      // Check if the user is an admin
      const isAdmin = adminEmails.includes(data.email.toLowerCase());

      // Call the login function from AuthContext
      await login(data.email, data.password);

      // Success message with toast
      toast.success("התחברת בהצלחה!", {
        description: isAdmin
          ? "ברוך הבא, מנהל מערכת!"
          : "ברוך הבא להדרך, מקום שבו הצמיחה האישית שלך מתחילה.",
      });

      // Navigate to dashboard or admin dashboard
      router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("התחברות נכשלה", {
        description: error.message || "אנא בדוק את פרטיך ונסה שוב",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Social login handlers
  const handleSocialLogin = async (provider: string) => {
    // Set the loading state for the specific provider
    switch (provider) {
      case "google":
        setIsGoogleLoading(true);
        break;
      case "facebook":
        setIsFacebookLoading(true);
        break;
      case "microsoft":
        setIsMicrosoftLoading(true);
        break;
    }

    try {
      // קריאה ישירה ל-Supabase OAuth API
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      // בהצלחה - הדפדפן יועבר אוטומטית לעמוד ההפניה
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast.error(`התחברות באמצעות ${provider} נכשלה`, {
        description: error.message || "אנא נסה שוב מאוחר יותר",
      });

      // Reset loading state
      switch (provider) {
        case "google":
          setIsGoogleLoading(false);
          break;
        case "facebook":
          setIsFacebookLoading(false);
          break;
        case "microsoft":
          setIsMicrosoftLoading(false);
          break;
      }
    }
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

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isGoogleLoading}
          onClick={() => handleSocialLogin("google")}
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
          onClick={() => handleSocialLogin("facebook")}
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
          onClick={() => handleSocialLogin("microsoft")}
        >
          {isMicrosoftLoading ? (
            <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.microsoft className="ml-2 h-4 w-4" />
          )}
          Microsoft
        </Button>
      </div>
    </div>
  );
}
