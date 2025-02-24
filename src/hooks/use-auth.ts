/**
 * @file use-auth.ts
 * @description Custom hook for managing authentication state and user session
 */

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { User as SupabaseUser } from "@supabase/supabase-js";

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/api";
import { createSupabaseClient } from "@/lib/services/supabase";
import { setError, setLoading, setUser } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { User } from "@/types/models";

interface AuthState {
  user: SupabaseUser | null;
  loading: boolean;
  error: Error | null;
}

interface UseAuth {
  user: SupabaseUser | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Helper function to safely use Redux
const useReduxDispatch = () => {
  try {
    // This will throw during SSG if Redux is not available
    return { dispatch: useAppDispatch(), isClient: true };
  } catch (e) {
    // Return a no-op dispatch function for SSG
    return {
      dispatch: () => ({}),
      isClient: false,
    };
  }
};

// Helper to convert Supabase User to app User type expected by Redux
const convertToAppUser = (user: SupabaseUser | null): User | null => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.user_metadata?.name || "",
    email: user.email || "",
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "user",
    points: 0,
    level: 1,
    badges: [],
    achievements: [],
    preferences: {
      theme: "system",
      language: "he",
      notifications: {
        email: true,
        push: true,
        desktop: true,
      },
      simulator: {
        difficulty: "beginner",
        language: "he",
        feedback_frequency: "high",
        auto_suggestions: true,
        theme: "system",
      },
    },
    progress: {
      id: user.id,
      user_id: user.id,
      points: 0,
      level: 1,
      xp: 0,
      next_level_xp: 1000,
      badges: [],
      achievements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completedLessons: [],
      courseProgress: {},
      courses: {
        completed: [],
        in_progress: [],
        bookmarked: [],
      },
      lessons: {
        completed: [],
        in_progress: [],
      },
      simulator: {
        completed_scenarios: [],
        results: [],
        stats: {
          total_sessions: 0,
          average_score: 0,
          time_spent: 0,
        },
      },
      forum: {
        posts: [],
        comments: [],
        likes: [],
        bookmarks: [],
      },
    },
    created_at: user.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

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
  const { dispatch, isClient } = useReduxDispatch();
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
          // Update Redux state only in browser environment
          if (isClient) {
            dispatch(setError(error.message));
            dispatch(setLoading(false));
          }
          return;
        }

        setState((prev) => ({ ...prev, user, loading: false }));
        // Update Redux state only in browser environment
        if (isClient) {
          dispatch(setUser(convertToAppUser(user)));
          dispatch(setLoading(false));
        }
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
        // Update Redux state only in browser environment
        if (isClient) {
          dispatch(
            setError(
              error instanceof Error
                ? error.message
                : "An unexpected error occurred"
            )
          );
          dispatch(setLoading(false));
        }
      }
    };

    void getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setState((prev) => ({ ...prev, user }));
      // Update Redux state only in browser environment
      if (isClient) {
        dispatch(setUser(convertToAppUser(user)));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, dispatch, isClient]);

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
    [supabase.auth, router, toast]
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
    [supabase.auth, router, toast]
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
    [supabase.auth, router, toast]
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
