import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocialGroup {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  members: string[];
  activities: Activity[];
  created_at: string;
  updated_at: string;
  is_private: boolean;
  tags: string[];
}

interface Activity {
  id: string;
  group_id: string;
  title: string;
  description: string;
  type: "meeting" | "workshop" | "discussion" | "social";
  date: string;
  location: string | null;
  max_participants: number | null;
  participants: string[];
  created_at: string;
  updated_at: string;
}

interface SocialState {
  groups: SocialGroup[];
  currentGroup: SocialGroup | null;
  currentActivity: Activity | null;
  filters: {
    search: string;
    tags: string[];
    type: Activity["type"] | "all";
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: SocialState = {
  groups: [],
  currentGroup: null,
  currentActivity: null,
  filters: {
    search: "",
    tags: [],
    type: "all",
  },
  isLoading: false,
  error: null,
};

export const socialSlice = createSlice({
  name: "social",
  initialState,
  reducers: {
    setGroups: (state: SocialState, action: PayloadAction<SocialGroup[]>) => {
      state.groups = action.payload;
    },
    setCurrentGroup: (
      state: SocialState,
      action: PayloadAction<SocialGroup | null>,
    ) => {
      state.currentGroup = action.payload;
    },
    setCurrentActivity: (
      state: SocialState,
      action: PayloadAction<Activity | null>,
    ) => {
      state.currentActivity = action.payload;
    },
    addActivity: (
      state: SocialState,
      action: PayloadAction<{ groupId: string; activity: Activity }>,
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.activities.push(action.payload.activity);
      }
      if (
        state.currentGroup &&
        state.currentGroup.id === action.payload.groupId
      ) {
        state.currentGroup.activities.push(action.payload.activity);
      }
    },
    joinActivity: (
      state: SocialState,
      action: PayloadAction<{
        groupId: string;
        activityId: string;
        userId: string;
      }>,
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        const activity = group.activities.find(
          (a) => a.id === action.payload.activityId,
        );
        if (
          activity &&
          !activity.participants.includes(action.payload.userId)
        ) {
          activity.participants.push(action.payload.userId);
        }
      }
      if (
        state.currentGroup &&
        state.currentGroup.id === action.payload.groupId
      ) {
        const activity = state.currentGroup.activities.find(
          (a) => a.id === action.payload.activityId,
        );
        if (
          activity &&
          !activity.participants.includes(action.payload.userId)
        ) {
          activity.participants.push(action.payload.userId);
        }
      }
    },
    updateFilters: (
      state: SocialState,
      action: PayloadAction<Partial<SocialState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state: SocialState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state: SocialState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setGroups,
  setCurrentGroup,
  setCurrentActivity,
  addActivity,
  joinActivity,
  updateFilters,
  setLoading,
  setError,
} = socialSlice.actions;

export const socialReducer = socialSlice.reducer;
