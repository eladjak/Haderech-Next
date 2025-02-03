import { createClient } from "@supabase/supabase-js";

interface SocialGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  activities: Activity[];
  created_at: string;
  updated_at: string;
}

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const createSocialGroup = async (
  name: string,
  description: string,
  creatorId: string,
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
    return group;
  } catch (error) {
    console.error("Error creating social group:", error);
    throw new Error("שגיאה ביצירת קבוצה חברתית");
  }
};

export const addMemberToGroup = async (
  groupId: string,
  userId: string,
): Promise<SocialGroup> => {
  try {
    // Get current group members
    const { data: group } = await supabase
      .from("social_groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (!group) throw new Error("קבוצה לא נמצאה");

    // Add member if not already in group
    if (!group.members.includes(userId)) {
      const { data: updatedGroup, error } = await supabase
        .from("social_groups")
        .update({
          members: [...group.members, userId],
          updated_at: new Date().toISOString(),
        })
        .eq("id", groupId)
        .select()
        .single();

      if (error) throw error;
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
  activity: Omit<Activity, "id" | "created_at">,
): Promise<SocialGroup> => {
  try {
    // Get current group activities
    const { data: group } = await supabase
      .from("social_groups")
      .select("activities")
      .eq("id", groupId)
      .single();

    if (!group) throw new Error("קבוצה לא נמצאה");

    const newActivity = {
      ...activity,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const { data: updatedGroup, error } = await supabase
      .from("social_groups")
      .update({
        activities: [...group.activities, newActivity],
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .select()
      .single();

    if (error) throw error;
    return updatedGroup;
  } catch (error) {
    console.error("Error adding activity to group:", error);
    throw new Error("שגיאה בהוספת פעילות לקבוצה");
  }
};

export const getGroupActivities = async (
  groupId: string,
): Promise<Activity[]> => {
  try {
    const { data: group } = await supabase
      .from("social_groups")
      .select("activities")
      .eq("id", groupId)
      .single();

    if (!group) throw new Error("קבוצה לא נמצאה");
    return group.activities;
  } catch (error) {
    console.error("Error fetching group activities:", error);
    throw new Error("שגיאה בטעינת פעילויות הקבוצה");
  }
};

export const joinActivity = async (
  groupId: string,
  activityId: string,
  userId: string,
): Promise<Activity> => {
  try {
    const { data: group } = await supabase
      .from("social_groups")
      .select("activities")
      .eq("id", groupId)
      .single();

    if (!group) throw new Error("קבוצה לא נמצאה");

    const activityIndex = group.activities.findIndex(
      (a: Activity) => a.id === activityId,
    );
    if (activityIndex === -1) throw new Error("פעילות לא נמצאה");

    const activity = group.activities[activityIndex];

    // Check if user already joined
    if (activity.participants.includes(userId)) {
      return activity;
    }

    // Check max participants
    if (
      activity.max_participants &&
      activity.participants.length >= activity.max_participants
    ) {
      throw new Error("הפעילות מלאה");
    }

    // Add user to participants
    activity.participants.push(userId);
    group.activities[activityIndex] = activity;

    const { error } = await supabase
      .from("social_groups")
      .update({
        activities: group.activities,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId);

    if (error) throw error;
    return activity;
  } catch (error) {
    console.error("Error joining activity:", error);
    throw new Error("שגיאה בהצטרפות לפעילות");
  }
};
