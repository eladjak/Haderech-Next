"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

// הגדרת סוגים פנימיים שחסרים
interface Activity {
  id: string;
  title: string;
  description: string;
  type: "meeting" | "workshop" | "social" | "other";
  date: string;
  location?: string;
  max_participants?: number;
  participants: string[];
  created_at: string;
}

interface SocialGroup {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  members: string[];
  activities: string[];
  created_at: string;
  updated_at: string;
}

const supabase = createClientComponentClient<Database>();

export const createSocialGroup = async (
  name: string,
  description: string,
  creatorId: string
): Promise<SocialGroup> => {
  const { data, error } = await supabase
    .from("social_groups")
    .insert({
      name,
      description,
      creator_id: creatorId,
      members: [creatorId],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return data as unknown as SocialGroup;
};

export const addMemberToGroup = async (
  groupId: string,
  userId: string
): Promise<SocialGroup> => {
  try {
    const { data: group, error: fetchError } = await supabase
      .from("social_groups")
      .select()
      .eq("id", groupId)
      .single();

    if (fetchError) throw fetchError;
    if (!group) throw new Error("קבוצה לא נמצאה");

    const currentMembers = group.members ?? [];
    // Add member if not already in group
    if (!currentMembers.includes(userId)) {
      const { data: updatedGroup, error: updateError } = await supabase
        .from("social_groups")
        .update({
          members: [...currentMembers, userId],
          updated_at: new Date().toISOString(),
        })
        .eq("id", groupId)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!updatedGroup) throw new Error("Failed to update group");

      return updatedGroup;
    }

    return group;
  } catch (error) {
    console.error("Error adding member to group:", error);
    throw new Error("שגיאה בהוספת חבר לקבוצה");
  }
};

export const addActivityToGroup = async (
  groupId: string,
  activity: Omit<Activity, "id" | "created_at">
): Promise<SocialGroup> => {
  try {
    const { data: group, error: fetchError } = await supabase
      .from("social_groups")
      .select()
      .eq("id", groupId)
      .single();

    if (fetchError) throw fetchError;
    if (!group) throw new Error("קבוצה לא נמצאה");

    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const currentActivities = group.activities ?? [];

    const { data: updatedGroup, error: updateError } = await supabase
      .from("social_groups")
      .update({
        activities: [...currentActivities, newActivity],
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updatedGroup) throw new Error("Failed to update group");

    return updatedGroup;
  } catch (error) {
    console.error("Error adding activity to group:", error);
    throw new Error("שגיאה בהוספת פעילות לקבוצה");
  }
};

export const getGroupActivities = async (
  groupId: string
): Promise<Activity[]> => {
  try {
    const { data: group, error } = await supabase
      .from("social_groups")
      .select()
      .eq("id", groupId)
      .single();

    if (error) throw error;
    if (!group) throw new Error("קבוצה לא נמצאה");

    return group.activities ?? [];
  } catch (error) {
    console.error("Error fetching group activities:", error);
    throw new Error("שגיאה בטעינת פעילויות הקבוצה");
  }
};

export const joinActivity = async (
  groupId: string,
  activityId: string,
  userId: string
): Promise<Activity> => {
  try {
    const { data: group, error: fetchError } = await supabase
      .from("social_groups")
      .select()
      .eq("id", groupId)
      .single();

    if (fetchError) throw fetchError;
    if (!group) throw new Error("קבוצה לא נמצאה");

    const activities = group.activities ?? [];
    const activity = activities.find(
      (act: Activity): act is Activity => act.id === activityId
    );

    if (!activity) throw new Error("פעילות לא נמצאה");

    const currentParticipants = activity.participants ?? [];

    // Check if user already joined
    if (currentParticipants.includes(userId)) {
      return activity;
    }

    // Check max participants
    if (
      activity.max_participants &&
      currentParticipants.length >= activity.max_participants
    ) {
      throw new Error("הפעילות מלאה");
    }

    // Add user to participants
    const updatedActivity: Activity = {
      ...activity,
      participants: [...currentParticipants, userId],
    };

    const updatedActivities = activities.map((act: Activity) =>
      act.id === activityId ? updatedActivity : act
    );

    const { error: updateError } = await supabase
      .from("social_groups")
      .update({
        activities: updatedActivities,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId);

    if (updateError) throw updateError;
    return updatedActivity;
  } catch (error) {
    console.error("Error joining activity:", error);
    throw new Error("שגיאה בהצטרפות לפעילות");
  }
};
