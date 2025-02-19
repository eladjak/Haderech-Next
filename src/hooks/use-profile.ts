/**
 * @file use-profile.ts
 * @description Custom hook for managing user profile data and operations
 */

import { useCallback } from "react";

import { createClient } from "@supabase/supabase-js";

import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/types/database";

export type Profile = Tables<"users"> & {
  avatar_url?: string | null;
  bio?: string | null;
};

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Custom hook for managing user profile data and operations
 *
 * @returns Object containing:
 * - fetchProfile: Function to fetch the user's profile
 * - updateProfile: Function to update the user's profile
 * - uploadAvatar: Function to upload a new avatar image
 * - deleteAvatar: Function to delete the current avatar
 */
export function useProfile() {
  const { toast } = useToast();

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;

        return data as Profile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "שגיאה בטעינת הפרופיל",
          description: "אנא נסה שוב מאוחר יותר",
        });
        return null;
      }
    },
    [toast]
  );

  const updateProfile = useCallback(
    async (userId: string, updates: Partial<Profile>) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", userId)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "הפרופיל עודכן בהצלחה",
          description: "השינויים נשמרו",
        });

        return data as Profile;
      } catch (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "שגיאה בעדכון הפרופיל",
          description: "אנא נסה שוב מאוחר יותר",
        });
        return null;
      }
    },
    [toast]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      try {
        const fileExt = file.name.split(".").pop();
        const filePath = `avatars/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        toast({
          title: "התמונה הועלתה בהצלחה",
          description: "התמונה נשמרה בהצלחה",
        });

        return publicUrl;
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast({
          title: "שגיאה בהעלאת התמונה",
          description: "אנא נסה שוב מאוחר יותר",
        });
        return null;
      }
    },
    [toast]
  );

  const deleteAvatar = useCallback(
    async (userId: string) => {
      try {
        const { error } = await supabase.storage
          .from("avatars")
          .remove([`avatars/${userId}`]);

        if (error) throw error;

        toast({
          title: "התמונה נמחקה בהצלחה",
          description: "התמונה הוסרה מהפרופיל",
        });

        return true;
      } catch (error) {
        console.error("Error deleting avatar:", error);
        toast({
          title: "שגיאה במחיקת התמונה",
          description: "אנא נסה שוב מאוחר יותר",
        });
        return false;
      }
    },
    [toast]
  );

  return {
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  };
}
