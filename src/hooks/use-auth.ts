/**
 * @file use-auth.ts
 * @description Custom hook for managing authentication state and user session
 */

import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase";

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/api";
import { setUser, setLoading, setError } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface UseAuth {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

/**
 * Custom hook that provides authentication state and user session management
 *
 * @returns Object containing user state and auth methods
 */
export const useAuth = (): UseAuth => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const getUser = async (): Promise<void> => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error.message);
          setState((prev) => ({ ...prev, error, loading: false }));
          return;
        }

        setState((prev) => ({ ...prev, user, loading: false }));
      } catch (error) {
        console.error("Unexpected error fetching user:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error
              : new Error("An unexpected error occurred"),
          loading: false,
        }));
      }
    };

    void getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, user: session?.user ?? null }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Error signing in:", error.message);
          setState((prev) => ({ ...prev, error }));
          toast({
            title: "שגיאה בהתחברות",
            description: error.message,
          });
          return;
        }

        toast({
          title: "התחברת בהצלחה",
          description: "ברוך הבא חזרה!",
        });
        router.push("/dashboard");
      } catch (error) {
        console.error("Unexpected error during sign in:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(errorMessage),
        }));
        toast({
          title: "שגיאה בהתחברות",
          description: errorMessage,
        });
      }
    },
    [supabase.auth, router, toast],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          console.error("Error signing up:", error.message);
          setState((prev) => ({ ...prev, error }));
          toast({
            title: "שגיאה בהרשמה",
            description: error.message,
          });
          return;
        }

        toast({
          title: "נרשמת בהצלחה",
          description: "נשלח אליך מייל אימות",
        });
        router.push("/verify-email");
      } catch (error) {
        console.error("Unexpected error during sign up:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(errorMessage),
        }));
        toast({
          title: "שגיאה בהרשמה",
          description: errorMessage,
        });
      }
    },
    [supabase.auth, router, toast],
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error.message);
        setState((prev) => ({ ...prev, error }));
        toast({
          title: "שגיאה בהתנתקות",
          description: error.message,
        });
        return;
      }

      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!",
      });
      router.push("/");
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));
      toast({
        title: "שגיאה בהתנתקות",
        description: errorMessage,
      });
    }
  }, [supabase.auth, router, toast]);

  const resetPassword = useCallback(
    async (email: string): Promise<void> => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
          console.error("Error resetting password:", error.message);
          setState((prev) => ({ ...prev, error }));
          toast({
            title: "שגיאה באיפוס סיסמה",
            description: error.message,
          });
          return;
        }

        toast({
          title: "נשלח מייל איפוס סיסמה",
          description: "בדוק את תיבת הדואר שלך",
        });
        router.push("/check-email");
      } catch (error) {
        console.error("Unexpected error during password reset:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(errorMessage),
        }));
        toast({
          title: "שגיאה באיפוס סיסמה",
          description: errorMessage,
        });
      }
    },
    [supabase.auth, router, toast],
  );

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};
