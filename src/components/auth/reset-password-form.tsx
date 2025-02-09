"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

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
import { useAuth } from "@/hooks/use-auth";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/lib/validations/auth";
import { Icons } from "@/components/icons";

export function ResetPasswordForm(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אימייל</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && (
            <Icons.spinner
              className="ml-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          )}
          שלח קישור לאיפוס סיסמה
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link
          href="/login"
          className="text-primary hover:underline"
        >
          חזרה להתחברות
        </Link>
      </div>
    </Form>
  );
}
