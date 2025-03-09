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
import { useAuth } from "@/contexts/auth-context";
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
  const { register } = useAuth();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isFacebookLoading, setIsFacebookLoading] =
    React.useState<boolean>(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] =
    React.useState<boolean>(false);

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
      // Call the register function from AuthContext
      await register(data.email, data.password, data.name);

      // Success message with toast
      toast.success("נרשמת בהצלחה!", {
        description: "ברוך הבא להדרך, המסע האישי שלך מתחיל כעת.",
      });

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("הרשמה נכשלה", {
        description: error.message || "אנא בדוק את פרטיך ונסה שוב",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Social registration handlers
  const handleSocialRegister = async (provider: string) => {
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
      // Simulate OAuth redirect - in real implementation would call an API endpoint
      window.location.href = `/api/auth/${provider}`;
      // Note: the following code won't execute due to the redirect
      toast.success(`נרשמת בהצלחה עם ${provider}`);
    } catch (error) {
      toast.error(`הרשמה באמצעות ${provider} נכשלה`, {
        description: "אנא נסה שוב מאוחר יותר",
      });
      // Reset loading state
      setIsGoogleLoading(false);
      setIsFacebookLoading(false);
      setIsMicrosoftLoading(false);
    }
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
                    onCheckedChange={(checked) => field.onChange(!!checked)}
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

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isGoogleLoading}
          onClick={() => handleSocialRegister("google")}
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
          onClick={() => handleSocialRegister("facebook")}
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
          onClick={() => handleSocialRegister("microsoft")}
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
