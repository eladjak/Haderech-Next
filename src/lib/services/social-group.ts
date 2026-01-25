import { createClient } from "@supabase/supabase-js";
import type { Activity } from "@/types/social";
import type { Database, SocialGroup } from "@/types/supabase";
import { logger } from "@/lib/utils/logger";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const createSocialGroup = async (
  name: string,
  description: string,
  creatorId: string
): Promise<SocialGroup> => {
  try {
    const { data: group, error } = await supabase
      .from("social_groups")
      .insert({
        name,
        description,
        members: [creatorId],
        activities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    if (!group) throw new Error("Failed to create social group");

    return group;
  } catch (error) {
    logger.error("Error creating social group:", error);
    throw new Error("שגיאה ביצירת קבוצה חברתית");
  }
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
    logger.error("Error adding member to group:", error);
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
    logger.error("Error adding activity to group:", error);
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
    logger.error("Error fetching group activities:", error);
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
    logger.error("Error joining activity:", error);
    throw new Error("שגיאה בהצטרפות לפעילות");
  }
};
